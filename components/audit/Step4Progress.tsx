'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PHASE_NAMES, PHASE_ICONS } from '@/lib/scoring'
import type { AuditFormData } from '@/app/(dashboard)/audits/new/page'

interface Props {
  auditId: string
  form: AuditFormData
  onComplete: (id: string) => void
}

interface ProgressState {
  phase: number
  questionIndex: number
  totalQuestions: number
  currentQuestion: string
  currentResponse: string
  status: 'planning' | 'executing' | 'evaluating' | 'done' | 'error'
  error?: string
}

export default function Step4Progress({ auditId, form, onComplete }: Props) {
  const [progress, setProgress] = useState<ProgressState>({
    phase: 1,
    questionIndex: 0,
    totalQuestions: 82,
    currentQuestion: '',
    currentResponse: '',
    status: 'planning',
  })

  useEffect(() => {
    runAudit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runAudit() {
    try {
      // Fase 1: Generar plan
      setProgress(p => ({ ...p, status: 'planning', currentQuestion: 'Generando plan de auditoría personalizado...' }))

      const planRes = await fetch('/api/audit/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audit_id: auditId,
          system_prompt: form.system_prompt,
          sector: form.sector,
          language: form.language,
          country: form.country,
        }),
      })
      const planData = await planRes.json()
      if (!planRes.ok) throw new Error(planData.error)

      const questions = planData.questions
      setProgress(p => ({ ...p, totalQuestions: questions.length }))

      // Fase 2: Ejecutar
      setProgress(p => ({ ...p, status: 'executing', currentQuestion: 'Iniciando preguntas...' }))

      const execRes = await fetch('/api/audit/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audit_id: auditId,
          questions,
          system_prompt: form.system_prompt,
          connection_type: form.connection_type,
        }),
      })
      const execData = await execRes.json()
      if (!execRes.ok) throw new Error(execData.error)

      // Fase 3: Evaluar
      setProgress(p => ({ ...p, status: 'evaluating', currentQuestion: 'Evaluando respuestas y generando informe legal...' }))

      const evalRes = await fetch('/api/audit/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audit_id: auditId }),
      })
      const evalData = await evalRes.json()
      if (!evalRes.ok) throw new Error(evalData.error)

      setProgress(p => ({ ...p, status: 'done' }))
      setTimeout(() => onComplete(auditId), 1500)
    } catch (e: any) {
      setProgress(p => ({ ...p, status: 'error', error: e.message }))
    }
  }

  const statusInfo: Record<string, { label: string; pct: number }> = {
    planning: { label: 'Generando plan de auditoría...', pct: 15 },
    executing: { label: 'Ejecutando preguntas contra el asistente...', pct: 60 },
    evaluating: { label: 'Evaluando respuestas y generando informe legal...', pct: 90 },
    done: { label: '¡Auditoría completada!', pct: 100 },
    error: { label: 'Error en la auditoría', pct: 0 },
  }

  const info = statusInfo[progress.status]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auditoría en progreso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {progress.status === 'error' ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Error durante la auditoría</p>
            <p className="text-sm mt-1">{progress.error}</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">{info.label}</span>
                <span className="text-gray-400">{info.pct}%</span>
              </div>
              <Progress value={info.pct} className="h-3" />
            </div>

            {/* Fases */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(step => {
                const active = (step === 1 && progress.status === 'planning') ||
                  (step === 2 && progress.status === 'executing') ||
                  (step === 3 && progress.status === 'evaluating')
                const done = (step === 1 && ['executing', 'evaluating', 'done'].includes(progress.status)) ||
                  (step === 2 && ['evaluating', 'done'].includes(progress.status)) ||
                  (step === 3 && progress.status === 'done')
                const labels = ['Planificación', 'Ejecución', 'Evaluación']

                return (
                  <div key={step} className={`rounded-lg p-3 text-center text-sm transition-all ${
                    done ? 'bg-green-50 text-green-700 font-medium' :
                    active ? 'bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-200' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    <p className="text-lg">{done ? '✓' : active ? '⏳' : '○'}</p>
                    <p>{labels[step - 1]}</p>
                  </div>
                )
              })}
            </div>

            {progress.status === 'done' && (
              <div className="text-center text-green-700 font-medium">
                ✅ Redirigiendo a los resultados...
              </div>
            )}

            <p className="text-xs text-center text-gray-400">
              No cierres esta ventana. La auditoría puede tardar entre 5 y 10 minutos.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
