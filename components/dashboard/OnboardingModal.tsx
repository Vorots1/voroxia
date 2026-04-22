'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { CheckCircle2, FileSearch, BarChart3, X } from 'lucide-react'

const STEPS = [
  {
    icon: <CheckCircle2 className="h-10 w-10 text-blue-600" />,
    title: '¡Bienvenido a Voroxia!',
    body: 'Voroxia audita tus chatbots de IA para garantizar su cumplimiento con el EU AI Act (Reglamento UE 2024/1689). El plazo de aplicación obligatoria es el 2 de agosto de 2026 — empieza ahora.',
  },
  {
    icon: <FileSearch className="h-10 w-10 text-blue-600" />,
    title: 'Crea tu primera auditoría',
    body: 'Haz clic en "Nueva auditoría", introduce el system prompt de tu chatbot y deja que Voroxia lo evalúe automáticamente en 6 dimensiones: lingüística, funcional, guardarraíles, seguridad, experiencia y legal.',
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-blue-600" />,
    title: 'Interpreta tus resultados',
    body: 'Recibirás un score de cumplimiento de 0 a 100, desglosado por fase, con riesgos legales identificados y recomendaciones accionables. Los planes de pago incluyen PDF exportable y re-auditoría automática.',
  },
]

export default function OnboardingModal({ show }: { show: boolean }) {
  const [open, setOpen] = useState(show)
  const [step, setStep] = useState(0)
  const [closing, setClosing] = useState(false)
  const router = useRouter()

  async function handleClose() {
    setClosing(true)
    await fetch('/api/user/onboarding', { method: 'PATCH' })
    setOpen(false)
    router.refresh()
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      handleClose()
    }
  }

  if (!open) return null

  const current = STEPS[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
          disabled={closing}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <div className="flex flex-col items-center text-center gap-4">
          {current.icon}
          <h2 className="text-xl font-bold text-gray-900">{current.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{current.body}</p>
        </div>

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
              Anterior
            </Button>
          )}
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleNext} disabled={closing}>
            {step < STEPS.length - 1 ? 'Siguiente' : 'Empezar'}
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Paso {step + 1} de {STEPS.length}
        </p>
      </div>
    </div>
  )
}
