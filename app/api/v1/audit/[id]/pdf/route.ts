import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { hashApiKey } from '@/lib/api-key'

async function resolveApiKey(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer vx_live_')) return null
  const hash = hashApiKey(auth.slice('Bearer '.length))
  const service = createServiceClient()
  const { data } = await service
    .from('users')
    .select('id, plan')
    .eq('api_key_hash', hash)
    .single() as { data: { id: string; plan: string } | null }
  if (!data || data.plan !== 'enterprise') return null
  return data
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await resolveApiKey(req)
  if (!user) {
    return NextResponse.json({ error: 'Invalid or missing API key. Enterprise plan required.' }, { status: 401 })
  }

  const { id } = await params
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://voroxia.com'

  // Delegar en la ruta PDF existente usando service role (sin cookie de sesión)
  // Construimos la URL interna y la llamamos pasando el audit_id como param
  const service = createServiceClient()
  const { data: audit } = await service
    .from('audits')
    .select('id, status, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
  if (audit.status !== 'completed') return NextResponse.json({ error: 'Audit not completed yet' }, { status: 400 })

  // Redirigir al endpoint PDF con una signed URL temporal (simplificado: redirect a dashboard)
  return NextResponse.redirect(`${appUrl}/api/audit/pdf?id=${id}`, { status: 302 })
}
