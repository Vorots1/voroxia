'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export default function BillingPortalButton() {
  const [loading, setLoading] = useState(false)

  async function handlePortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handlePortal} disabled={loading} className="gap-1.5">
      <ExternalLink className="h-3.5 w-3.5" />
      {loading ? 'Abriendo...' : 'Gestionar suscripción'}
    </Button>
  )
}
