'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Step1Info from '@/components/audit/Step1Info'
import Step2Connection from '@/components/audit/Step2Connection'
import Step3Confirm from '@/components/audit/Step3Confirm'
import Step4Progress from '@/components/audit/Step4Progress'

export interface AuditFormData {
  assistant_name: string
  company_name: string
  company_url: string
  sector: string
  country: string
  language: string
  connection_type: 'system_prompt' | 'manual'
  system_prompt: string
}

const STEPS = ['Información', 'Conexión', 'Confirmación', 'Ejecutando']

export default function NewAuditPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [auditId, setAuditId] = useState<string | null>(null)
  const [form, setForm] = useState<AuditFormData>({
    assistant_name: '',
    company_name: '',
    company_url: '',
    sector: '',
    country: 'ES',
    language: 'es',
    connection_type: 'system_prompt',
    system_prompt: '',
  })

  function update(data: Partial<AuditFormData>) {
    setForm(prev => ({ ...prev, ...data }))
  }

  async function startAudit() {
    // Crear auditoría
    const res = await fetch('/api/audit/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setAuditId(data.audit_id)
    setStep(4)
  }

  function onComplete(id: string) {
    router.push(`/audits/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva auditoría</h1>
        <p className="text-gray-500 text-sm mt-0.5">82 preguntas · 6 fases · ~5 minutos</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              i + 1 < step ? 'bg-blue-600 text-white' :
              i + 1 === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i + 1 === step ? 'text-blue-600' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {step === 1 && <Step1Info form={form} update={update} onNext={() => setStep(2)} />}
      {step === 2 && <Step2Connection form={form} update={update} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
      {step === 3 && <Step3Confirm form={form} onBack={() => setStep(2)} onStart={startAudit} />}
      {step === 4 && auditId && <Step4Progress auditId={auditId} form={form} onComplete={onComplete} />}
    </div>
  )
}
