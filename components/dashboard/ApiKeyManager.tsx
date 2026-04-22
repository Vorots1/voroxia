'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react'

export default function ApiKeyManager() {
  const [hasKey, setHasKey] = useState<boolean | null>(null)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/settings/api-key')
      .then(r => r.json())
      .then(d => setHasKey(d.has_key))
  }, [])

  async function handleGenerate() {
    if (hasKey && !confirm('Esto invalidará la API key actual. ¿Continuar?')) return
    setLoading(true)
    try {
      const res = await fetch('/api/settings/api-key', { method: 'POST' })
      const data = await res.json()
      if (data.api_key) {
        setNewKey(data.api_key)
        setHasKey(true)
        setShowKey(true)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRevoke() {
    if (!confirm('¿Revocar la API key? Todas las integraciones dejarán de funcionar.')) return
    setLoading(true)
    try {
      await fetch('/api/settings/api-key', { method: 'DELETE' })
      setHasKey(false)
      setNewKey(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!newKey) return
    await navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {newKey && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-800 mb-2">
            Copia esta API key ahora — no se volverá a mostrar
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-800 truncate">
              {showKey ? newKey : '•'.repeat(40)}
            </code>
            <Button variant="ghost" size="sm" onClick={() => setShowKey(v => !v)} className="flex-shrink-0 px-2">
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="flex-shrink-0 px-2">
              <Copy className="h-4 w-4" />
              {copied && <span className="ml-1 text-xs text-green-600">¡Copiada!</span>}
            </Button>
          </div>
        </div>
      )}

      {!newKey && hasKey && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-sm text-green-800">
            <span className="font-semibold">API key activa</span> — empieza por <code className="font-mono">vx_live_...</code>
          </p>
          <p className="text-xs text-green-600 mt-0.5">La clave no se puede recuperar. Si la perdiste, genera una nueva.</p>
        </div>
      )}

      {hasKey === false && (
        <p className="text-sm text-gray-500">No tienes ninguna API key activa.</p>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={loading}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {hasKey ? 'Regenerar API key' : 'Generar API key'}
        </Button>
        {hasKey && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRevoke}
            disabled={loading}
            className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Revocar
          </Button>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-1.5 font-mono">
        <p className="font-sans font-semibold text-gray-700 not-italic mb-2">Uso de la API</p>
        <p className="text-gray-500 font-sans">Lanzar auditoría:</p>
        <p>POST {process.env.NEXT_PUBLIC_APP_URL ?? 'https://voroxia.com'}/api/v1/audit</p>
        <p>Authorization: Bearer vx_live_...</p>
        <p className="text-gray-500 font-sans mt-2">Consultar resultado:</p>
        <p>GET /api/v1/audit/{'{id}'}</p>
        <p className="text-gray-500 font-sans mt-2">Descargar PDF:</p>
        <p>GET /api/v1/audit/{'{id}'}/pdf</p>
      </div>
    </div>
  )
}
