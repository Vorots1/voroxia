import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { stripe, getPriceId } from '@/lib/stripe'
import type { Plan } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json() as { plan: Exclude<Plan, 'free'> }
  if (!['starter', 'professional', 'enterprise'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const priceId = getPriceId(plan)
  if (!priceId) return NextResponse.json({ error: 'Price not configured' }, { status: 500 })

  const { data: profile } = await supabase.from('users').select('stripe_customer_id, email').eq('id', user.id).single() as { data: { stripe_customer_id: string | null; email: string | null } | null }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://voroxia.com'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : (profile?.email ?? user.email ?? undefined),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=1`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { user_id: user.id, plan },
    subscription_data: { metadata: { user_id: user.id, plan } },
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
