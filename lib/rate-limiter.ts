import type { Plan, User } from '@/types'
import { PLAN_LIMITS } from '@/types'

export interface RateLimitResult {
  allowed: boolean
  reason?: string
  audits_used: number
  audits_limit: number
  can_purchase_extra: boolean
  upsell_plan?: Plan
}

export function checkAuditLimit(user: User): RateLimitResult {
  const limits = PLAN_LIMITS[user.plan]

  if (user.plan === 'free') {
    const totalUsed = user.audits_used_this_month + (user.audits_remaining < 1 ? 1 : 0)
    const allowed = user.audits_remaining > 0
    return {
      allowed,
      reason: allowed ? undefined : 'Has agotado tu auditoría gratuita. Actualiza tu plan para continuar.',
      audits_used: allowed ? 0 : 1,
      audits_limit: 1,
      can_purchase_extra: false,
      upsell_plan: 'starter',
    }
  }

  const periodStart = new Date(user.current_period_start)
  const now = new Date()
  const isNewPeriod = now.getTime() - periodStart.getTime() > 30 * 24 * 60 * 60 * 1000

  const usedThisPeriod = isNewPeriod ? 0 : user.audits_used_this_month
  const allowed = usedThisPeriod < limits.audits_per_month || user.audits_remaining > 0

  if (!allowed) {
    const nextPlan = getNextPlan(user.plan)
    return {
      allowed: false,
      reason: `Has alcanzado el límite de ${limits.audits_per_month} auditorías este mes.`,
      audits_used: usedThisPeriod,
      audits_limit: limits.audits_per_month,
      can_purchase_extra: true,
      upsell_plan: nextPlan,
    }
  }

  return {
    allowed: true,
    audits_used: usedThisPeriod,
    audits_limit: limits.audits_per_month,
    can_purchase_extra: true,
  }
}

function getNextPlan(current: Plan): Plan | undefined {
  const order: Plan[] = ['free', 'starter', 'professional', 'enterprise']
  const idx = order.indexOf(current)
  return idx < order.length - 1 ? order[idx + 1] : undefined
}

export function estimateTokenCost(questions: number, avgResponseLength: number): number {
  const inputTokensPerQuestion = 500
  const outputTokensPerQuestion = avgResponseLength / 4
  const evalInputTokens = questions * 200
  const evalOutputTokens = questions * 100

  const totalInput = questions * inputTokensPerQuestion + evalInputTokens
  const totalOutput = questions * outputTokensPerQuestion + evalOutputTokens

  const inputCostPer1M = 3.0
  const outputCostPer1M = 15.0

  return (totalInput / 1_000_000) * inputCostPer1M + (totalOutput / 1_000_000) * outputCostPer1M
}
