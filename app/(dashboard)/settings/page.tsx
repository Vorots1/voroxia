import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PLAN_LIMITS, type Plan } from '@/types'
import BillingPortalButton from '@/components/dashboard/BillingPortalButton'
import ApiKeyManager from '@/components/dashboard/ApiKeyManager'

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()
  const { data: profile } = await service.from('users').select('*').eq('id', user.id).single()

  const plan = (profile?.plan ?? 'free') as Plan
  const limits = PLAN_LIMITS[plan]

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Mi cuenta</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            ['Email', user.email],
            ['Nombre', profile?.full_name || '—'],
            ['Empresa', profile?.company_name || '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium text-gray-800">{v}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Plan actual</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="text-sm px-3 py-1 capitalize">{plan}</Badge>
            {plan !== 'enterprise' && (
              <Link href="/pricing">
                <Button variant="outline" size="sm">Actualizar plan</Button>
              </Link>
            )}
            {plan !== 'free' && <BillingPortalButton />}
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <p><span className="text-gray-500">Auditorías al mes:</span> <strong>{plan === 'free' ? '1 (total)' : limits.audits_per_month}</strong></p>
            <p><span className="text-gray-500">Usadas este mes:</span> <strong>{profile?.audits_used_this_month ?? 0}</strong></p>
            <p><span className="text-gray-500">Preguntas por auditoría:</span> <strong>{limits.questions_per_audit}</strong></p>
          </div>
        </CardContent>
      </Card>
      {plan === 'enterprise' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API key</CardTitle>
          </CardHeader>
          <CardContent>
            <ApiKeyManager />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
