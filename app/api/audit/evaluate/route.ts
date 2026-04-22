import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { evaluateAudit } from '@/lib/audit-engine'
import { calculateGlobalScore, getClassification } from '@/lib/scoring'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const { audit_id } = body

    if (!audit_id) return NextResponse.json({ error: 'Falta audit_id' }, { status: 400 })

    const service = createServiceClient()

    // Cargar auditoría completa
    const { data: audit } = await service.from('audits').select('*').eq('id', audit_id).single()
    if (!audit || audit.user_id !== user.id) {
      return NextResponse.json({ error: 'Auditoría no encontrada' }, { status: 404 })
    }

    // Cargar preguntas con respuestas
    const { data: questions } = await service
      .from('audit_questions')
      .select('*')
      .eq('audit_id', audit_id)
      .order('order_index')

    if (!questions?.length) {
      return NextResponse.json({ error: 'No hay preguntas para evaluar' }, { status: 400 })
    }

    const questionsWithResponses = questions
      .filter(q => q.response_text !== null)
      .map(q => ({
        question: {
          id: q.id,
          phase: q.phase,
          phase_name: q.phase_name,
          question_code: q.question_code,
          linguistic_layer: q.linguistic_layer as any,
          intention: q.intention as any,
          question_text: q.question_text,
          evaluates: q.evaluates,
          criteria_10: q.criteria_10 || '',
          criteria_5: q.criteria_5 || '',
          criteria_0: q.criteria_0 || '',
          order_index: q.order_index,
        },
        response: q.response_text!,
      }))

    const result = await evaluateAudit({
      questions_with_responses: questionsWithResponses,
      assistant_name: audit.assistant_name,
      company_name: audit.company_name || '',
      sector: audit.sector,
      company_url: audit.company_url || '',
      country: audit.country,
      system_prompt: audit.system_prompt || '',
      audit_id,
    })

    const { metrics, evaluations, legal_risks, report_markdown } = result
    const score_global = calculateGlobalScore(metrics)
    const classification = getClassification(score_global)

    // Actualizar evaluaciones en BD
    for (const ev of evaluations) {
      await service.from('audit_questions').update({
        score: ev.score,
        verdict: ev.verdict,
        explanation: ev.explanation,
        detail: ev.detail,
        recommendation: ev.recommendation,
        linguistic_comprehension: ev.linguistic_comprehension ?? null,
      }).eq('audit_id', audit_id).eq('id', ev.id as any)
    }

    // Insertar riesgos legales
    if (legal_risks.length) {
      await service.from('audit_legal_risks').insert(
        legal_risks.map(r => ({ ...r, audit_id }))
      )
    }

    // Actualizar auditoría con scores finales
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
    }).eq('id', audit_id)

    // Incrementar contador de auditorías del usuario
    await service.from('users').update({
      audits_used_this_month: (audit as any).user_id ? undefined : 0,
    }).eq('id', user.id)

    try {
      await service.rpc('increment_audits_used', { user_id: user.id })
    } catch { /* RPC opcional */ }

    return NextResponse.json({ score_global, classification, metrics, audit_id })
  } catch (err) {
    console.error('[audit/evaluate]', err)
    return NextResponse.json({ error: 'Error evaluando la auditoría' }, { status: 500 })
  }
}
