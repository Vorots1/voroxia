import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { generateApiKey, hashApiKey } from '@/lib/api-key'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: profile } = await service
    .from('users').select('plan').eq('id', user.id).single() as { data: { plan: string } | null }

  if (profile?.plan !== 'enterprise') {
    return NextResponse.json({ error: 'API keys are only available on the Enterprise plan.' }, { status: 403 })
  }

  const { raw, hash } = generateApiKey()
  await service.from('users').update({ api_key_hash: hash }).eq('id', user.id)

  // Devolver la key en texto plano UNA SOLA VEZ
  return NextResponse.json({ api_key: raw })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  await service.from('users').update({ api_key_hash: null }).eq('id', user.id)

  return NextResponse.json({ revoked: true })
}

// Verificar si el usuario ya tiene una key activa (sin revelarla)
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceClient()
  const { data: profile } = await service
    .from('users').select('api_key_hash').eq('id', user.id).single() as { data: { api_key_hash: string | null } | null }

  return NextResponse.json({ has_key: !!profile?.api_key_hash })
}
