'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { EXTRA_AUDIT_PRICES, type Plan } from '@/types'

export default function BuyExtrasButton({ plan }: { plan: Plan }) {
  const [loading, setLoading] = useState(false)

  if (plan === 'free') return null

  const price = EXTRA_AUDIT_PRICES[plan as Exclude<Plan, 'free'>]

  async function handleBuy() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/extra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 1 }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBuy}
      disabled={loading}
      className="gap-1.5 text-xs"
    >
      <PlusCircle className="h-3.5 w-3.5" />
      {loading ? 'Redirigiendo...' : `Comprar extra (€${price})`}
    </Button>
  )
}
