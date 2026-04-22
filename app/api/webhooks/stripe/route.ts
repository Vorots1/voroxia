import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPlanFromPriceId } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

async function updateUserPlan(
  customerId: string,
  plan: string,
  subscriptionId: string,
) {
  const service = createServiceClient()
  await service
    .from('users')
    .update({
      plan,
      stripe_subscription_id: subscriptionId,
      audits_remaining: plan === 'starter' ? 10 : plan === 'professional' ? 30 : 100,
    })
    .eq('stripe_customer_id', customerId)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const service = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      if (!userId) break

      if (session.mode === 'subscription') {
        const plan = session.metadata?.plan
        if (!plan) break
        await service.from('users').update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan,
          audits_remaining: plan === 'starter' ? 10 : plan === 'professional' ? 30 : 100,
        }).eq('id', userId)
      } else if (session.mode === 'payment') {
        // Compra puntual de auditorías extra
        const extra = parseInt(session.metadata?.extra_audits ?? '0', 10)
        if (extra > 0) {
          const { data: current } = await service
            .from('users')
            .select('audits_remaining')
            .eq('id', userId)
            .single() as { data: { audits_remaining: number } | null }
          await service.from('users').update({
            audits_remaining: (current?.audits_remaining ?? 0) + extra,
          }).eq('id', userId)
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const priceId = sub.items.data[0]?.price.id
      if (!priceId) break
      const plan = getPlanFromPriceId(priceId)
      await updateUserPlan(sub.customer as string, plan, sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await service
        .from('users')
        .update({ plan: 'free', stripe_subscription_id: null, audits_remaining: 1 })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }

    case 'invoice.payment_failed': {
      // Log for now — future: send notification email
      const invoice = event.data.object as Stripe.Invoice
      console.error('[stripe webhook] Payment failed for customer:', invoice.customer)
      break
    }
  }

  return NextResponse.json({ received: true })
}
