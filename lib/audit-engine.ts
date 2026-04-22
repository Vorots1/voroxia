import crypto from 'crypto'
import { anthropic, AUDIT_MODEL, MAX_TOKENS_PLAN, MAX_TOKENS_EVAL } from '@/lib/anthropic'
import { PLANNING_PROMPT, EVALUATION_PROMPT } from '@/lib/prompts'
import type { AuditPlanQuestion, QuestionEvaluation, AuditMetrics, AuditLegalRisk } from '@/types'

export interface AuditPlanInput {
  system_prompt: string
  sector: string
  language: string
  country: string
}

export interface AuditExecutionInput {
  questions: AuditPlanQuestion[]
  system_prompt: string
  connection_type: 'system_prompt' | 'manual'
  api_endpoint?: string
}

export interface QuestionWithResponse {
  question: AuditPlanQuestion
  response: string
}

export interface EvaluationInput {
  questions_with_responses: QuestionWithResponse[]
  assistant_name: string
  company_name: string
  sector: string
  company_url: string
  country: string
  system_prompt: string
  audit_id: string
}

export interface EvaluationOutput {
  evaluations: QuestionEvaluation[]
  metrics: AuditMetrics
  legal_risks: Omit<AuditLegalRisk, 'id' | 'audit_id'>[]
  report_markdown: string
}

export function hashSystemPrompt(system_prompt: string): string {
  return crypto.createHash('sha256').update(system_prompt.trim()).digest('hex')
}

export async function generateAuditPlan(input: AuditPlanInput): Promise<AuditPlanQuestion[]> {
  const prompt = PLANNING_PROMPT
    .replace('{{system_prompt}}', input.system_prompt)
    .replace('{{sector}}', input.sector)
    .replace(/\{\{idioma\}\}/g, input.language)
    .replace('{{pais}}', input.country)

  const response = await anthropic.messages.create({
    model: AUDIT_MODEL,
    max_tokens: MAX_TOKENS_PLAN,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Respuesta inesperada de la API')

  const text = content.text.trim()
  const jsonText = text.startsWith('[') ? text : text.slice(text.indexOf('['), text.lastIndexOf(']') + 1)

  return JSON.parse(jsonText) as AuditPlanQuestion[]
}

export async function executeAuditWithSystemPrompt(
  questions: AuditPlanQuestion[],
  system_prompt: string,
  onProgress?: (questionIndex: number, question: AuditPlanQuestion, response: string) => void
): Promise<QuestionWithResponse[]> {
  const results: QuestionWithResponse[] = []

  // Agrupar preguntas por fase para conversaciones multi-turn (reduce tokens)
  const phases = [...new Set(questions.map(q => q.phase))].sort()

  for (const phase of phases) {
    const phaseQuestions = questions.filter(q => q.phase === phase).sort((a, b) => a.order_index - b.order_index)
    const messages: { role: 'user' | 'assistant'; content: string }[] = []

    for (const question of phaseQuestions) {
      messages.push({ role: 'user', content: question.question_text })

      const response = await anthropic.messages.create({
        model: AUDIT_MODEL,
        max_tokens: 1000,
        system: system_prompt,
        messages: [...messages],
      })

      const content = response.content[0]
      const responseText = content.type === 'text' ? content.text : ''

      messages.push({ role: 'assistant', content: responseText })

      const idx = questions.indexOf(question)
      onProgress?.(idx, question, responseText)

      results.push({ question, response: responseText })
    }
  }

  return results.sort((a, b) => a.question.order_index - b.question.order_index)
}

export async function evaluateAudit(input: EvaluationInput): Promise<EvaluationOutput> {
  const resultsJson = JSON.stringify(
    input.questions_with_responses.map(qr => ({
      id: qr.question.id,
      phase: qr.question.phase,
      phase_name: qr.question.phase_name,
      question_code: qr.question.question_code,
      linguistic_layer: qr.question.linguistic_layer,
      intention: qr.question.intention,
      question_text: qr.question.question_text,
      evaluates: qr.question.evaluates,
      criteria_10: qr.question.criteria_10,
      criteria_5: qr.question.criteria_5,
      criteria_0: qr.question.criteria_0,
      response: qr.response,
    })),
    null,
    2
  )

  const fecha = new Date().toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const prompt = EVALUATION_PROMPT
    .replace('{{assistant_name}}', input.assistant_name)
    .replace('{{company_name}}', input.company_name || 'Sin especificar')
    .replace('{{sector}}', input.sector)
    .replace('{{company_url}}', input.company_url || 'No indicada')
    .replace('{{country}}', input.country)
    .replace('{{system_prompt}}', input.system_prompt || 'No proporcionado')
    .replace('{{results_json}}', resultsJson)
    .replace(/\{\{fecha\}\}/g, fecha)
    .replace('{{audit_id}}', input.audit_id)

  const response = await anthropic.messages.create({
    model: AUDIT_MODEL,
    max_tokens: MAX_TOKENS_EVAL,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Respuesta inesperada de la API')

  const text = content.text.trim()
  const jsonText = text.startsWith('{') ? text : text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)

  return JSON.parse(jsonText) as EvaluationOutput
}
