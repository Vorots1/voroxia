import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { AuditFormData } from '@/app/(dashboard)/audits/new/page'

interface Props {
  form: AuditFormData
  update: (d: Partial<AuditFormData>) => void
  onBack: () => void
  onNext: () => void
}

export default function Step2Connection({ form, update, onBack, onNext }: Props) {
  const valid = form.connection_type === 'manual' ||
    (form.connection_type === 'system_prompt' && form.system_prompt.trim().length > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modo de conexión</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Opciones */}
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              type: 'system_prompt' as const,
              title: 'Pegar system prompt',
              desc: 'Pega las instrucciones de tu asistente. Voroxia simulará su comportamiento.',
              badge: null,
            },
            {
              type: 'manual' as const,
              title: 'Auditoría manual',
              desc: 'Te generamos las preguntas para que las hagas tú directamente a tu chatbot.',
              badge: null,
            },
          ].map(opt => (
            <button
              key={opt.type}
              onClick={() => update({ connection_type: opt.type })}
              className={`text-left p-4 rounded-lg border-2 transition-colors ${
                form.connection_type === opt.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{opt.title}</span>
                {opt.badge && <Badge variant="secondary" className="text-xs">{opt.badge}</Badge>}
              </div>
              <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>

        {form.connection_type === 'system_prompt' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">System prompt *</label>
            <Textarea
              placeholder="Eres un asistente de atención al cliente de [empresa]. Tu función es ayudar a los clientes con..."
              className="min-h-[180px] font-mono text-sm"
              value={form.system_prompt}
              onChange={e => update({ system_prompt: e.target.value })}
            />
            <p className="text-xs text-gray-400">
              {form.system_prompt.length} caracteres · Cuanto más completo, más precisa la auditoría
            </p>
          </div>
        )}

        {form.connection_type === 'manual' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">Cómo funciona la auditoría manual:</p>
            <ol className="list-decimal list-inside space-y-1 text-amber-700">
              <li>Voroxia genera las 82 preguntas personalizadas para tu sector</li>
              <li>Tú las haces una a una a tu chatbot real</li>
              <li>Pegas las respuestas en el formulario</li>
              <li>Voroxia evalúa y genera el informe</li>
            </ol>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}>← Atrás</Button>
          <Button onClick={onNext} disabled={!valid}>Siguiente →</Button>
        </div>
      </CardContent>
    </Card>
  )
}
