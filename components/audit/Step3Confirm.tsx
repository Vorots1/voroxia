'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { AuditFormData } from '@/app/(dashboard)/audits/new/page'

interface Props {
  form: AuditFormData
  onBack: () => void
  onStart: () => Promise<void>
}

export default function Step3Confirm({ form, onBack, onStart }: Props) {
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleStart() {
    setLoading(true)
    setError('')
    try {
      await onStart()
    } catch (e: any) {
      setError(e.message || 'Error iniciando la auditoría')
      setLoading(false)
    }
  }

  const rows = [
    ['Asistente', form.assistant_name],
    ['Empresa', form.company_name || '—'],
    ['Sector', form.sector],
    ['País / Idioma', `${form.country} / ${form.language}`],
    ['Modo', form.connection_type === 'system_prompt' ? 'System prompt' : 'Manual'],
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmar y lanzar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between px-4 py-2.5 text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium text-gray-900">{v}</span>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-800">
          <p className="font-medium">Estimación: ~82 preguntas · 6 fases · 5-8 minutos</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
            checked={accepted}
            onChange={e => setAccepted(e.target.checked)}
          />
          <span className="text-sm text-gray-600">
            Entiendo que esta auditoría es una <strong>evaluación técnica automatizada</strong> y
            <strong> NO constituye asesoramiento legal</strong> ni certificación de compliance regulatorio.
          </span>
        </label>

        <div className="flex justify-between pt-1">
          <Button variant="outline" onClick={onBack} disabled={loading}>← Atrás</Button>
          <Button onClick={handleStart} disabled={!accepted || loading} className="gap-2">
            {loading ? '⏳ Iniciando...' : '🚀 Iniciar auditoría'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
