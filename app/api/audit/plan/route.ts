import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { generateAuditPlan, hashSystemPrompt } from '@/lib/audit-engine'
import { checkAuditLimit } from '@/lib/rate-limiter'
import type { AuditPlanQuestion } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
    if (!profile) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const limit = checkAuditLimit(profile as any)
    if (!limit.allowed) {
      return NextResponse.json({ error: limit.reason, upsell_plan: limit.upsell_plan }, { status: 402 })
    }

    const body = await req.json()
    const { audit_id, system_prompt, sector, language, country } = body

    if (!audit_id || !sector || !language || !country) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios' }, { status: 400 })
    }

    // Verificar que la auditoría pertenece al usuario
    const { data: audit } = await supabase.from('audits').select('id, status').eq('id', audit_id).eq('user_id', user.id).single()
    if (!audit) return NextResponse.json({ error: 'Auditoría no encontrada' }, { status: 404 })

    // Buscar plan en caché (solo si hay system_prompt)
    const service = createServiceClient()
    let questions: AuditPlanQuestion[] | null = null

    if (system_prompt) {
      const hash = hashSystemPrompt(system_prompt)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data: cached } = await service
        .from('audit_plan_cache')
        .select('plan_json')
        .eq('user_id', user.id)
        .eq('system_prompt_hash', hash)
        .eq('sector', sector)
        .eq('language', language)
        .gte('created_at', sevenDaysAgo)
        .single()

      if (cached) {
        questions = cached.plan_json as AuditPlanQuestion[]
      } else {
        // Generar plan nuevo y cachear
        questions = await generateAuditPlan({ system_prompt, sector, language, country })
        await service.from('audit_plan_cache').upsert({
          user_id: user.id,
          system_prompt_hash: hash,
          sector,
          language,
          plan_json: questions as any,
        })
      }
    } else {
      questions = await generateAuditPlan({ system_prompt: '', sector, language, country })
    }

    // Actualizar estado de la auditoría
    await service.from('audits').update({ status: 'planning' }).eq('id', audit_id)

    // Insertar preguntas en BD
    const questionsToInsert = questions.map(q => ({
      audit_id,
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
      order_index: q.order_index,
    }))

    await service.from('audit_questions').insert(questionsToInsert)
    await service.from('audits').update({ status: 'executing' }).eq('id', audit_id)

    return NextResponse.json({ questions, total: questions.length })
  } catch (err) {
    console.error('[audit/plan]', err)
    return NextResponse.json({ error: 'Error generando el plan de auditoría' }, { status: 500 })
  }
}
