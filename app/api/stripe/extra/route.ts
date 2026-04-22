import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { stripe, getExtraPriceId } from '@/lib/stripe'
import type { Plan } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('plan, stripe_customer_id')
    .eq('id', user.id)
    .single() as { data: { plan: Plan; stripe_customer_id: string | null } | null }

  const plan = profile?.plan
  if (!plan || plan === 'free') {
    return NextResponse.json({ error: 'Extra audits require an active paid plan' }, { status: 400 })
  }

  const priceId = getExtraPriceId(plan as Exclude<Plan, 'free'>)
  if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 500 })

  const { quantity } = await req.json() as { quantity?: number }
  const qty = Math.min(Math.max(1, quantity ?? 1), 50)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://voroxia.com'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer: profile?.stripe_customer_id ?? undefined,
    line_items: [{ price: priceId, quantity: qty }],
    success_url: `${appUrl}/dashboard?extras=${qty}`,
    cancel_url: `${appUrl}/dashboard`,
    metadata: { user_id: user.id, extra_audits: String(qty) },
  })

  return NextResponse.json({ url: session.url })
}
