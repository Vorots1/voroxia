export type Plan = 'free' | 'starter' | 'professional' | 'enterprise'

export type AuditStatus =
  | 'pending'
  | 'planning'
  | 'executing'
  | 'evaluating'
  | 'completed'
  | 'failed'

export type AuditClassification =
  | 'excellent'
  | 'good'
  | 'regular'
  | 'deficient'
  | 'critical'

export type ConnectionType = 'system_prompt' | 'api' | 'manual'

export type Verdict = 'PASS' | 'IMPROVABLE' | 'FAIL'

export type Severity = 'critical' | 'high' | 'medium' | 'low'

export type LinguisticLayer =
  | 'formal'
  | 'coloquial'
  | 'jerga_genz'
  | 'abreviaciones'
  | 'multiidioma'
  | 'erratica'
  | 'mixed'

export type Intention =
  | 'legitimate'
  | 'out_of_domain'
  | 'adversarial'
  | 'absurd'
  | 'ambiguous'
  | 'persistence'
  | 'discrimination_test'

export interface User {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  plan: Plan
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  audits_remaining: number
  audits_used_this_month: number
  current_period_start: string
  onboarding_completed: boolean | null
  api_key_hash: string | null
  created_at: string
  updated_at: string
}

export interface Audit {
  id: string
  user_id: string
  assistant_name: string
  company_name: string | null
  company_url: string | null
  sector: string
  language: string
  country: string
  system_prompt: string | null
  api_endpoint: string | null
  connection_type: ConnectionType
  status: AuditStatus
  score_global: number | null
  score_linguistic: number | null
  score_functional: number | null
  score_guardrails: number | null
  score_security: number | null
  score_experience: number | null
  score_legal: number | null
  classification: AuditClassification | null
  gap_formal_informal: number | null
  hallucination_rate: number | null
  containment_rate: number | null
  emotional_resilience: number | null
  linguistic_comprehension: number | null
  report_markdown: string | null
  legal_dossier_markdown: string | null
  created_at: string
  completed_at: string | null
}

export interface AuditQuestion {
  id: string
  audit_id: string
  phase: number
  phase_name: string
  question_code: string
  linguistic_layer: LinguisticLayer | null
  intention: Intention
  question_text: string
  evaluates: string
  criteria_10: string | null
  criteria_5: string | null
  criteria_0: string | null
  response_text: string | null
  score: number | null
  verdict: Verdict | null
  explanation: string | null
  detail: string | null
  recommendation: string | null
  linguistic_comprehension: boolean | null
  order_index: number
}

export interface AuditLegalRisk {
  id: string
  audit_id: string
  finding: string
  regulation: string
  regulation_article: string | null
  max_fine: string
  real_case: string | null
  real_case_description: string | null
  severity: Severity
}

export interface AuditPlanQuestion {
  id: string
  phase: number
  phase_name: string
  question_code: string
  linguistic_layer: LinguisticLayer | null
  intention: Intention
  question_text: string
  evaluates: string
  criteria_10: string
  criteria_5: string
  criteria_0: string
  order_index: number
}

export interface QuestionEvaluation {
  id: string
  score: number
  verdict: Verdict
  explanation: string
  detail: string
  recommendation: string
  linguistic_comprehension?: boolean
}

export interface AuditMetrics {
  score_global: number
  score_linguistic: number
  score_functional: number
  score_guardrails: number
  score_security: number
  score_experience: number
  score_legal: number
  classification: AuditClassification
  gap_formal_informal: number
  hallucination_rate: number
  containment_rate: number
  emotional_resilience: number
  linguistic_comprehension: {
    formal: number
    coloquial: number
    jerga_genz: number
    abreviaciones: number
    multiidioma: number
    erratica: number
    overall: number
  }
}

export interface PlanLimits {
  audits_per_month: number
  questions_per_audit: number
  phases: number[]
  features: string[]
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    audits_per_month: 1,
    questions_per_audit: 20,
    phases: [1, 2, 3],
    features: ['score_global', 'top_3_findings'],
  },
  starter: {
    audits_per_month: 10,
    questions_per_audit: 82,
    phases: [1, 2, 3, 4, 5, 6],
    features: ['full_report', 'legal_dossier', 'pdf'],
  },
  professional: {
    audits_per_month: 30,
    questions_per_audit: 82,
    phases: [1, 2, 3, 4, 5, 6],
    features: ['full_report', 'legal_dossier', 'pdf', 'api_mode', 'weekly_reaudit', 'alerts'],
  },
  enterprise: {
    audits_per_month: 100,
    questions_per_audit: 82,
    phases: [1, 2, 3, 4, 5, 6],
    features: [
      'full_report',
      'legal_dossier',
      'pdf',
      'api_mode',
      'daily_reaudit',
      'alerts',
      'api_access',
      'compliance_cert',
    ],
  },
}

export const PLAN_PRICES: Record<Exclude<Plan, 'free'>, number> = {
  starter: 79,
  professional: 199,
  enterprise: 499,
}

export const EXTRA_AUDIT_PRICES: Record<Exclude<Plan, 'free'>, number> = {
  starter: 9.9,
  professional: 7.9,
  enterprise: 5.9,
}
