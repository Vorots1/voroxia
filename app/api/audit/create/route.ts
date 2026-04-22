import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { checkAuditLimit } from '@/lib/rate-limiter'

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
    const { assistant_name, company_name, company_url, sector, language, country, system_prompt, connection_type } = body

    if (!assistant_name || !sector || !language || !country || !connection_type) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

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
