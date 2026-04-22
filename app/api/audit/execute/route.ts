import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { executeAuditWithSystemPrompt } from '@/lib/audit-engine'
import type { AuditPlanQuestion } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const { audit_id, questions, system_prompt, connection_type } = body as {
      audit_id: string
      questions: AuditPlanQuestion[]
      system_prompt: string
      connection_type: 'system_prompt' | 'manual'
    }

    if (!audit_id || !questions?.length) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    // Verificar propiedad
    const { data: audit } = await supabase.from('audits').select('id').eq('id', audit_id).eq('user_id', user.id).single()
    if (!audit) return NextResponse.json({ error: 'Auditoría no encontrada' }, { status: 404 })

    const service = createServiceClient()

    if (connection_type === 'manual') {
      // Modo manual: devolver las preguntas para que el usuario las haga
      return NextResponse.json({ mode: 'manual', questions })
    }

    // Modo system_prompt: ejecutar contra Claude
    const results = await executeAuditWithSystemPrompt(
      questions,
      system_prompt,
      async (idx, question, response) => {
        await service.from('audit_questions')
          .update({ response_text: response })
          .eq('audit_id', audit_id)
          .eq('order_index', question.order_index)
      }
    )

    await service.from('audits').update({ status: 'evaluating' }).eq('id', audit_id)

    return NextResponse.json({ results: results.map(r => ({ id: r.question.id, response: r.response })) })
  } catch (err) {
    console.error('[audit/execute]', err)
    return NextResponse.json({ error: 'Error ejecutando la auditoría' }, { status: 500 })
  }
}
