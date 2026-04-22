import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { hashApiKey } from '@/lib/api-key'
import {
  generateAuditPlan,
  executeAuditWithSystemPrompt,
  evaluateAudit,
} from '@/lib/audit-engine'
import { calculateGlobalScore, getClassification } from '@/lib/scoring'
import type { AuditPlanQuestion } from '@/types'

export const runtime = 'nodejs'
export const maxDuration = 300

async function resolveApiKey(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer vx_live_')) return null
  const raw = auth.slice('Bearer '.length)
  const hash = hashApiKey(raw)
  const service = createServiceClient()
  const { data } = await service
    .from('users')
    .select('id, plan, audits_remaining')
    .eq('api_key_hash', hash)
    .single() as { data: { id: string; plan: string; audits_remaining: number } | null }
  if (!data || data.plan !== 'enterprise') return null
  return data
}

export async function POST(req: NextRequest) {
  const user = await resolveApiKey(req)
  if (!user) {
    return NextResponse.json({ error: 'Invalid or missing API key. Enterprise plan required.' }, { status: 401 })
  }

  if (user.audits_remaining <= 0) {
    return NextResponse.json({ error: 'No audits remaining this month.' }, { status: 402 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { assistant_name, sector, language, country, system_prompt, company_name, company_url } = body as Record<string, string>

  if (!assistant_name || !sector || !language || !country || !system_prompt) {
    return NextResponse.json({
      error: 'Missing required fields: assistant_name, sector, language, country, system_prompt',
    }, { status: 400 })
  }

  const service = createServiceClient()

  // Crear registro de auditoría
  const { data: audit, error } = await service.from('audits').insert({
    user_id: user.id,
    assistant_name,
    company_name: company_name ?? null,
    company_url: company_url ?? null,
    sector,
    language,
    country,
    system_prompt,
    connection_type: 'system_prompt',
    status: 'planning',
  }).select('id').single()

  if (error || !audit) {
    return NextResponse.json({ error: 'Failed to create audit' }, { status: 500 })
  }

  const auditId = audit.id

  try {
    // Generar plan
    const questions = await generateAuditPlan({ system_prompt, sector, language, country })

    // Insertar preguntas
    await service.from('audit_questions').insert(
      questions.map((q: AuditPlanQuestion, idx: number) => ({
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
    )

    // Ejecutar
    await service.from('audits').update({ status: 'executing' }).eq('id', auditId)
    const results = await executeAuditWithSystemPrompt(
      questions,
      system_prompt,
      async (idx, question, response) => {
        await service.from('audit_questions')
          .update({ response_text: response })
          .eq('audit_id', auditId)
          .eq('order_index', question.order_index)
      }
    )

    // Evaluar
    await service.from('audits').update({ status: 'evaluating' }).eq('id', auditId)
    const evaluation = await evaluateAudit({
      questions_with_responses: results,
      assistant_name,
      company_name: company_name ?? '',
      sector,
      company_url: company_url ?? '',
      country,
      system_prompt,
      audit_id: auditId,
    })

    const { metrics, evaluations, legal_risks, report_markdown } = evaluation
    const score_global = calculateGlobalScore(metrics)
    const classification = getClassification(score_global)

    // Guardar evaluaciones
    for (const ev of evaluations) {
      await service.from('audit_questions').update({
        score: ev.score, verdict: ev.verdict,
        explanation: ev.explanation, detail: ev.detail,
        recommendation: ev.recommendation,
        linguistic_comprehension: ev.linguistic_comprehension ?? null,
      }).eq('audit_id', auditId).eq('id', ev.id as string)
    }

    if (legal_risks.length) {
      await service.from('audit_legal_risks').insert(legal_risks.map(r => ({ ...r, audit_id: auditId })))
    }

    await service.from('audits').update({
      status: 'completed',
      score_global, classification,
      score_linguistic: metrics.score_linguistic,
      score_functional: metrics.score_functional,
      score_guardrails: metrics.score_guardrails,
      score_security: metrics.score_security,
      score_experience: metrics.score_experience,
      score_legal: metrics.score_legal,
      gap_formal_informal: metrics.gap_formal_informal,
      hallucination_rate: metrics.hallucination_rate,
      containment_rate: metrics.containment_rate,
      emotional_resilience: metrics.emotional_resilience,
      linguistic_comprehension: metrics.linguistic_comprehension.overall,
      report_markdown,
      completed_at: new Date().toISOString(),
    }).eq('id', auditId)

    // Decrementar auditorías restantes
    await service.from('users').update({
      audits_remaining: user.audits_remaining - 1,
    }).eq('id', user.id)

    return NextResponse.json({
      audit_id: auditId,
      score_global,
      classification,
      scores: {
        linguistic: metrics.score_linguistic,
        functional: metrics.score_functional,
        guardrails: metrics.score_guardrails,
        security: metrics.score_security,
        experience: metrics.score_experience,
        legal: metrics.score_legal,
      },
      metrics: {
        gap_formal_informal: metrics.gap_formal_informal,
        hallucination_rate: metrics.hallucination_rate,
        containment_rate: metrics.containment_rate,
        emotional_resilience: metrics.emotional_resilience,
      },
      legal_risks_count: legal_risks.length,
      pdf_url: `/api/v1/audit/${auditId}/pdf`,
      dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/audits/${auditId}`,
    }, { status: 201 })

  } catch (err) {
    console.error('[api/v1/audit]', err)
    await service.from('audits').update({ status: 'failed' }).eq('id', auditId)
    return NextResponse.json({ error: 'Audit failed during processing' }, { status: 500 })
  }
}
