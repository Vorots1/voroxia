import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function ContactPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Solicitar reparación o construcción</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Te ayudamos a corregir los problemas detectados o a construir un asistente compliance-ready desde cero.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '🔍', title: 'Auditoría', desc: 'Evaluamos tu chatbot en 5 minutos' },
          { icon: '⚠️', title: 'Alerta legal', desc: 'Te mostramos las multas y consecuencias' },
          { icon: '🔧', title: 'Reparación', desc: 'Te lo arreglamos o construimos desde cero' },
        ].map(s => (
          <div key={s.title} className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-3xl mb-2">{s.icon}</p>
            <p className="font-semibold text-blue-900">{s.title}</p>
            <p className="text-sm text-blue-700 mt-1">{s.desc}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cuéntanos qué necesitas</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action="mailto:hola@voroxia.com"
            method="get"
            encType="text/plain"
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input name="nombre" placeholder="Ana García" />
              </div>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input name="empresa" placeholder="Mi Empresa S.L." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email de contacto</Label>
              <Input name="email" type="email" placeholder="ana@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label>¿Qué necesitas?</Label>
              <Textarea
                name="mensaje"
                placeholder="Hemos auditado nuestro chatbot y hemos detectado problemas de compliance. Nos gustaría recibir ayuda para..."
                className="min-h-[120px]"
              />
            </div>
            <Button type="submit" className="w-full">Enviar solicitud</Button>
          </form>
          <p className="text-xs text-gray-400 mt-3 text-center">
            También puedes escribirnos directamente a hola@voroxia.com
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
