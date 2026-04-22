'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Award } from 'lucide-react'

export default function DownloadCertificateButton({ auditId }: { auditId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch(`/api/audit/certificate?id=${auditId}`)
      if (res.status === 403) {
        alert('El certificado de cumplimiento está disponible en el plan Enterprise.')
        return
      }
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `voroxia-certificado-${auditId.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('No se pudo generar el certificado. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading} className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50">
      <Award className="h-3.5 w-3.5" />
      {loading ? 'Generando...' : 'Certificado EU AI Act'}
    </Button>
  )
}
