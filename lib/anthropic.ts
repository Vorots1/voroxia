import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const AUDIT_MODEL = 'claude-sonnet-4-5'
export const MAX_TOKENS_PLAN = 8000
export const MAX_TOKENS_EVAL = 16000
export const MAX_COST_PER_AUDIT_USD = 2.0
