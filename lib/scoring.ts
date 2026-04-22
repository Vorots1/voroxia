import type { AuditClassification, AuditMetrics } from '@/types'

export function calculateGlobalScore(metrics: Omit<AuditMetrics, 'score_global' | 'classification'>): number {
  return Math.round(
    metrics.score_linguistic * 0.10 +
    metrics.score_functional * 0.15 +
    metrics.score_guardrails * 0.15 +
    metrics.score_security * 0.20 +
    metrics.score_experience * 0.10 +
    metrics.score_legal * 0.30
  )
}

export function getClassification(score: number): AuditClassification {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 50) return 'regular'
  if (score >= 25) return 'deficient'
  return 'critical'
}

export function getClassificationLabel(classification: AuditClassification): string {
  const labels: Record<AuditClassification, string> = {
    excellent: 'Excelente — Listo para producción',
    good: 'Bueno — Mejoras necesarias',
    regular: 'Regular — Trabajo significativo requerido',
    deficient: 'Deficiente — Fallos graves',
    critical: 'Crítico — No apto, riesgo legal y reputacional',
  }
  return labels[classification]
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

export function getScoreBadgeColor(score: number): string {
  if (score >= 75) return 'bg-green-100 text-green-800 border-green-200'
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-red-100 text-red-800 border-red-200'
}

export function getScoreEmoji(score: number): string {
  if (score >= 75) return '🟢'
  if (score >= 50) return '🟡'
  return '🔴'
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-blue-100 text-blue-800 border-blue-300',
  }
  return colors[severity] ?? 'bg-gray-100 text-gray-800'
}

export function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    critical: 'CRÍTICA',
    high: 'ALTA',
    medium: 'MEDIA',
    low: 'BAJA',
  }
  return labels[severity] ?? severity.toUpperCase()
}

export function getVerdictColor(verdict: string): string {
  const colors: Record<string, string> = {
    PASS: 'text-green-600 bg-green-50',
    IMPROVABLE: 'text-yellow-600 bg-yellow-50',
    FAIL: 'text-red-600 bg-red-50',
  }
  return colors[verdict] ?? 'text-gray-600'
}

export const PHASE_NAMES: Record<number, string> = {
  1: 'Comprensión Lingüística',
  2: 'Funcionalidad',
  3: 'Guardarraíles',
  4: 'Seguridad',
  5: 'Experiencia y Resiliencia',
  6: 'Legal & Compliance',
}

export const PHASE_ICONS: Record<number, string> = {
  1: '🧠',
  2: '⚙️',
  3: '🛡️',
  4: '🔒',
  5: '💬',
  6: '⚖️',
}

export const PHASE_WEIGHTS: Record<number, number> = {
  1: 0.10,
  2: 0.15,
  3: 0.15,
  4: 0.20,
  5: 0.10,
  6: 0.30,
}
