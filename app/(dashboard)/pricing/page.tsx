'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PLAN_PRICES, PLAN_LIMITS } from '@/types'
import type { Plan } from '@/types'

const PLAN_FEATURES: Record<Exclude<Plan, 'free'>, string[]> = {
  starter: [
    '10 auditorías al mes',
    '82 preguntas por auditoría',
    '6 fases completas',
    'Informe completo en markdown',
    'Dossier legal EU AI Act',
    'Exportar a PDF',
  ],
  professional: [
    '30 auditorías al mes',
    '82 preguntas + modo API',
    '6 fases completas',
    'Re-auditoría semanal automática',
    'Alertas de regresión por email',
    'Dossier legal + PDF',
    'Soporte prioritario',
  ],
  enterprise: [
    '100 auditorías al mes',
    '82 preguntas + API completa',
    '6 fases completas',
    'Re-auditoría diaria automática',
    'API key para integraciones',
    'Certificado de cumplimiento EU AI Act',
    'SLA + soporte dedicado',
  ],
}

const PLAN_LABELS: Record<Exclude<Plan, 'free'>, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<Exclude<Plan, 'free'> | null>(null)

  async function handleUpgrade(plan: Exclude<Plan, 'free'>) {
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error(data.error)
        setLoading(null)
      }
    } catch {
      setLoading(null)
    }
  }

  const plans = (['starter', 'professional', 'enterprise'] as const).map((plan) => ({
    plan,
    label: PLAN_LABELS[plan],
    price: PLAN_PRICES[plan],
    features: PLAN_FEATURES[plan],
    highlight: plan === 'professional',
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Actualizar plan</h1>
        <p className="text-gray-500 text-sm mt-1">
          Elige el plan que mejor se adapte a tus necesidades. Sin permanencia, cancela cuando quieras.
        </p>
      </div>

      {/* Free current plan reminder */}
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">Plan actual: <span className="font-bold">Free</span></p>
          <p className="text-xs text-gray-500 mt-0.5">
            1 auditoría/mes · 20 preguntas · 3 fases · Sin dossier legal
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map(({ plan, label, price, features, highlight }) => (
          <div
            key={plan}
            className={`rounded-2xl p-6 flex flex-col relative ${
              highlight
                ? 'bg-blue-600 text-white ring-2 ring-blue-600 shadow-xl shadow-blue-100'
                : 'bg-white border border-gray-200'
            }`}
          >
            {highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-white text-blue-600 border-blue-100 shadow text-xs font-bold">
                  Más popular
                </Badge>
              </div>
            )}

            <div className="mb-5">
              <p className={`text-sm font-semibold mb-1 ${highlight ? 'text-blue-100' : 'text-gray-500'}`}>
                {label}
              </p>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${highlight ? 'text-white' : 'text-gray-900'}`}>
                  €{price}
                </span>
                <span className={`text-sm ${highlight ? 'text-blue-100' : 'text-gray-400'}`}>/mes</span>
              </div>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${highlight ? 'text-blue-200' : 'text-green-500'}`} />
                  <span className={highlight ? 'text-blue-50' : 'text-gray-600'}>{f}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => plan !== 'enterprise' ? handleUpgrade(plan) : router.push('/contact')}
              disabled={loading === plan}
              className={`w-full gap-2 ${
                highlight
                  ? 'bg-white text-blue-600 hover:bg-blue-50 border-0'
                  : 'border-gray-200'
              }`}
              variant={highlight ? 'default' : 'outline'}
            >
              {loading === plan ? (
                'Redirigiendo...'
              ) : plan === 'enterprise' ? (
                'Hablar con ventas'
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Activar {label}
                </>
              )}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-400">
        ¿Necesitas auditorías adicionales puntuales? Disponibles desde €5,90/unidad según plan.
        <br />
        Todos los precios incluyen IVA. Pago con tarjeta procesado por Stripe (PCI-DSS).
      </p>
    </div>
  )
}
