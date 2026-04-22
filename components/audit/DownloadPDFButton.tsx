'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default function DownloadPDFButton({ auditId }: { auditId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch(`/api/audit/pdf?id=${auditId}`)
      if (res.status === 403) {
        alert('La exportación a PDF está disponible en planes Starter, Professional y Enterprise.')
        return
      }
      if (!res.ok) throw new Error('Error generando el PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `voroxia-auditoria-${auditId.slice(0, 8)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('No se pudo generar el PDF. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading} className="gap-1.5">
      <Download className="h-3.5 w-3.5" />
      {loading ? 'Generando PDF...' : 'Descargar PDF'}
    </Button>
  )
}
