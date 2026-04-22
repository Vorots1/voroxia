import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { checkAuditLimit } from '@/lib/rate-limiter'
import { CreateAuditSchema } from '@/lib/validation'

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

    let rawBody: unknown
    try {
      rawBody = await req.json()
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }

    const parsed = CreateAuditSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { assistant_name, company_name, company_url, sector, language, country, system_prompt, connection_type } = parsed.data

    const service = createServiceClient()
    const { data: audit, error } = await service.from('audits').insert({
      user_id: user.id,
      assistant_name,
      company_name: company_name || null,
      company_url: company_url || null,
      sector,
      language,
      country,
      system_prompt: system_prompt || null,
      connection_type,
      status: 'pending',
    }).select('id').single()

    if (error || !audit) {
      return NextResponse.json({ error: 'Error creando la auditoría' }, { status: 500 })
    }

    return NextResponse.json({ audit_id: audit.id })
  } catch (err) {
    console.error('[audit/create]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
