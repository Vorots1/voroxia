import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import {
  generateAuditPlan,
  executeAuditWithSystemPrompt,
  evaluateAudit,
} from '@/lib/audit-engine'
import { calculateGlobalScore, getClassification } from '@/lib/scoring'
import { sendRegressionAlert, sendReauditSummary } from '@/lib/email'
import type { AuditPlanQuestion } from '@/types'

export const runtime = 'nodejs'
export const maxDuration = 300

const PLAN_INTERVALS: Record<string, number> = {
  professional: 7 * 24 * 60 * 60 * 1000,  // 7 días
  enterprise: 24 * 60 * 60 * 1000,          // 24 horas
}

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

async function runReaudit(
  service: ReturnType<typeof createServiceClient>,
  sourceAudit: Record<string, unknown>,
  userId: string,
): Promise<{ auditId: string; score: number; previousScore: number; regression: boolean } | null> {
  const previousScore = (sourceAudit.score_global as number) ?? 0

  // 1. Crear nuevo registro de auditoría
  const { data: newAudit, error } = await service.from('audits').insert({
    user_id: userId,
    assistant_name: sourceAudit.assistant_name,
    company_name: sourceAudit.company_name,
    company_url: sourceAudit.company_url,
    sector: sourceAudit.sector,
    language: sourceAudit.language,
    country: sourceAudit.country,
    system_prompt: sourceAudit.system_prompt,
    connection_type: sourceAudit.connection_type,
    status: 'planning',
  }).select('id').single()

  if (error || !newAudit) {
    console.error('[reaudit] Error creando auditoría:', error)
    return null
  }

  const auditId = newAudit.id

  try {
    // 2. Generar plan de preguntas
    await service.from('audits').update({ status: 'planning' }).eq('id', auditId)

    const questions = await generateAuditPlan({
      system_prompt: (sourceAudit.system_prompt as string) ?? '',
      sector: sourceAudit.sector as string,
      language: sourceAudit.language as string,
      country: sourceAudit.country as string,
    })

    // 3. Insertar preguntas en BD
    const questionsToInsert = questions.map((q: AuditPlanQuestion, idx: number) => ({
      audit_id: auditId,
      phase: q.phase,
      phase_name: q.phase_name,
      question_code: q.question_code,
      linguistic_layer: q.linguistic_layer,
      intention: q.intention,
      question_text: q.question_text,
      evaluates: q.evaluates,
      criteria_10: q.criteria_10,
      criteria_5: q.criteria_5,
      criteria_0: q.criteria_0,
      order_index: idx,
    }))

    await service.from('audit_questions').insert(questionsToInsert)

    // 4. Ejecutar auditoría automáticamente (solo system_prompt)
    await service.from('audits').update({ status: 'executing' }).eq('id', auditId)

    const results = await executeAuditWithSystemPrompt(
      questions,
      (sourceAudit.system_prompt as string) ?? '',
      async (idx, question, response) => {
        await service.from('audit_questions')
          .update({ response_text: response })
          .eq('audit_id', auditId)
          .eq('order_index', question.order_index)
      }
    )

    // 5. Evaluar resultados
    await service.from('audits').update({ status: 'evaluating' }).eq('id', auditId)

    const evaluation = await evaluateAudit({
      questions_with_responses: results,
      assistant_name: sourceAudit.assistant_name as string,
      company_name: (sourceAudit.company_name as string) ?? '',
      sector: sourceAudit.sector as string,
      company_url: (sourceAudit.company_url as string) ?? '',
      country: sourceAudit.country as string,
      system_prompt: (sourceAudit.system_prompt as string) ?? '',
      audit_id: auditId,
    })

    const { metrics, evaluations, legal_risks, report_markdown } = evaluation
    const score_global = calculateGlobalScore(metrics)
    const classification = getClassification(score_global)

    // 6. Actualizar evaluaciones
    for (const ev of evaluations) {
      await service.from('audit_questions').update({
        score: ev.score,
        verdict: ev.verdict,
        explanation: ev.explanation,
        detail: ev.detail,
        recommendation: ev.recommendation,
        linguistic_comprehension: ev.linguistic_comprehension ?? null,
      }).eq('audit_id', auditId).eq('id', ev.id as string)
    }

    // 7. Insertar riesgos legales
    if (legal_risks.length) {
      await service.from('audit_legal_risks').insert(
        legal_risks.map(r => ({ ...r, audit_id: auditId }))
      )
    }

    // 8. Finalizar auditoría
    await service.from('audits').update({
      status: 'completed',
      score_global,
      score_linguistic: metrics.score_linguistic,
      score_functional: metrics.score_functional,
      score_guardrails: metrics.score_guardrails,
      score_security: metrics.score_security,
      score_experience: metrics.score_experience,
      score_legal: metrics.score_legal,
      classification,
      gap_formal_informal: metrics.gap_formal_informal,
      hallucination_rate: metrics.hallucination_rate,
      containment_rate: metrics.containment_rate,
      emotional_resilience: metrics.emotional_resilience,
      linguistic_comprehension: metrics.linguistic_comprehension.overall,
      report_markdown,
      completed_at: new Date().toISOString(),
    }).eq('id', auditId)

    const regression = score_global < previousScore - 10

    console.log(`[reaudit] ✅ audit=${auditId} user=${userId} score=${score_global} prev=${previousScore} regression=${regression}`)

    return { auditId, score: score_global, previousScore, regression }
  } catch (err) {
    console.error(`[reaudit] ❌ audit=${auditId} user=${userId}`, err)
    await service.from('audits').update({ status: 'failed' }).eq('id', auditId)
    return null
  }
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()
  const now = Date.now()
  const results: Array<{ userId: string; auditId: string; score: number; previousScore: number; regression: boolean }> = []
  const skipped: string[] = []

  for (const [plan, interval] of Object.entries(PLAN_INTERVALS)) {
    const cutoff = new Date(now - interval).toISOString()

    // Obtener usuarios del plan con email (necesario para alertas)
    const { data: users } = await service
      .from('users')
      .select('id, email')
      .eq('plan', plan)

    if (!users?.length) continue

    for (const user of users) {
      // Última auditoría completada del usuario (no manual)
      const { data: lastAudit } = await service
        .from('audits')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .neq('connection_type', 'manual')
        .not('system_prompt', 'is', null)
        .lt('completed_at', cutoff)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

      if (!lastAudit) {
        skipped.push(user.id)
        continue
      }

      // Verificar que no haya una re-auditoría ya en curso hoy
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const { data: todayAudit } = await service
        .from('audits')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', todayStart.toISOString())
        .limit(1)
        .single()

      if (todayAudit) {
        skipped.push(user.id)
        continue
      }

      const result = await runReaudit(service, lastAudit as Record<string, unknown>, user.id)
      if (result) {
        results.push({ userId: user.id, ...result })

        // Enviar email si hay RESEND_API_KEY configurada
        if (process.env.RESEND_API_KEY && (user as { id: string; email?: string }).email) {
          const email = (user as { id: string; email: string }).email
          const assistantName = (lastAudit as Record<string, unknown>).assistant_name as string
          try {
            if (result.regression) {
              await sendRegressionAlert({
                to: email,
                assistantName,
                previousScore: result.previousScore,
                newScore: result.score,
                auditId: result.auditId,
              })
            } else {
              await sendReauditSummary({
                to: email,
                assistantName,
                score: result.score,
                auditId: result.auditId,
              })
            }
          } catch (emailErr) {
            console.error('[reaudit] Email error for', user.id, emailErr)
          }
        }
      }
    }
  }

  return NextResponse.json({
    processed: results.length,
    skipped: skipped.length,
    regressions: results.filter(r => r.regression).length,
    results,
    ts: new Date().toISOString(),
  })
}
