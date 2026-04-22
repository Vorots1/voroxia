import Stripe from 'stripe'
import type { Plan } from '@/types'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

const PRICE_IDS: Record<Exclude<Plan, 'free'>, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL!,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE!,
}

export function getPriceId(plan: Exclude<Plan, 'free'>): string {
  return PRICE_IDS[plan]
}

export function getPlanFromPriceId(priceId: string): Plan {
  const entry = Object.entries(PRICE_IDS).find(([, id]) => id === priceId)
  return (entry?.[0] as Plan) ?? 'free'
}
