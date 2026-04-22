import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AuditFormData } from '@/app/(dashboard)/audits/new/page'

const SECTORS = [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'saas', label: 'SaaS / Tecnología' },
  { value: 'banca', label: 'Banca / Fintech' },
  { value: 'seguros', label: 'Seguros' },
  { value: 'salud', label: 'Salud / Clínicas' },
  { value: 'educacion', label: 'Educación' },
  { value: 'telecomunicaciones', label: 'Telecomunicaciones' },
  { value: 'hosteleria', label: 'Hostelería / Turismo' },
  { value: 'inmobiliaria', label: 'Inmobiliaria' },
  { value: 'legal', label: 'Legal / Asesoría' },
  { value: 'alimentacion', label: 'Alimentación / Restauración' },
  { value: 'automocion', label: 'Automoción' },
  { value: 'energia', label: 'Energía' },
  { value: 'logistica', label: 'Logística / Transporte' },
  { value: 'otro', label: 'Otro' },
]

const COUNTRIES = [
  { value: 'ES', label: 'España' }, { value: 'FR', label: 'Francia' },
  { value: 'DE', label: 'Alemania' }, { value: 'IT', label: 'Italia' },
  { value: 'PT', label: 'Portugal' }, { value: 'GB', label: 'Reino Unido' },
  { value: 'NL', label: 'Países Bajos' }, { value: 'BE', label: 'Bélgica' },
  { value: 'MX', label: 'México' }, { value: 'AR', label: 'Argentina' },
  { value: 'CO', label: 'Colombia' }, { value: 'CL', label: 'Chile' },
]

const LANGUAGES = [
  { value: 'es', label: 'Español' }, { value: 'en', label: 'Inglés' },
  { value: 'fr', label: 'Francés' }, { value: 'de', label: 'Alemán' },
  { value: 'it', label: 'Italiano' }, { value: 'pt', label: 'Portugués' },
]

interface Props {
  form: AuditFormData
  update: (d: Partial<AuditFormData>) => void
  onNext: () => void
}

export default function Step1Info({ form, update, onNext }: Props) {
  const valid = form.assistant_name && form.sector && form.country && form.language

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del asistente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Nombre del asistente *</Label>
          <Input placeholder="Ej: Asistente de ventas" value={form.assistant_name}
            onChange={e => update({ assistant_name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Empresa</Label>
            <Input placeholder="Mi Empresa S.L." value={form.company_name}
              onChange={e => update({ company_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>URL de la empresa</Label>
            <Input placeholder="https://miempresa.com" value={form.company_url}
              onChange={e => update({ company_url: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Sector *</Label>
          <Select value={form.sector || ''} onValueChange={(v) => update({ sector: v ?? '' })}>
            <SelectTrigger><SelectValue placeholder="Selecciona el sector" /></SelectTrigger>
            <SelectContent>
              {SECTORS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>País *</Label>
            <Select value={form.country || ''} onValueChange={v => update({ country: v ?? '' })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Idioma principal *</Label>
            <Select value={form.language || ''} onValueChange={v => update({ language: v ?? '' })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="pt-2 flex justify-end">
          <Button onClick={onNext} disabled={!valid}>Siguiente →</Button>
        </div>
      </CardContent>
    </Card>
  )
}
