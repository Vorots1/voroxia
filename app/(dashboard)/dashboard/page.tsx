import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getClassificationLabel } from '@/lib/scoring'
import { PLAN_LIMITS, type Plan } from '@/types'
import { PlusCircle, AlertTriangle, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import CountdownBanner from '@/components/dashboard/CountdownBanner'
import AuditRow from '@/components/dashboard/AuditRow'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; extras?: string }>
}) {
  const params = await searchParams
  const justUpgraded = params.upgraded === '1'
  const extrasAdded = params.extras ? parseInt(params.extras, 10) : 0
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()
  const { data: profile } = await service.from('users').select('*').eq('id', user.id).single()
  const { data: audits } = await service
    .from('audits')
    .select('id, assistant_name, company_name, sector, status, score_global, classification, created_at, completed_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const plan = (profile?.plan ?? 'free') as Plan
  const limits = PLAN_LIMITS[plan]
  const used = profile?.audits_used_this_month ?? 0
  const monthLimit = plan === 'free' ? 1 : limits.audits_per_month
  const usedPct = Math.min((used / monthLimit) * 100, 100)

  const completedAudits = audits?.filter(a => a.status === 'completed') ?? []
  const avgScore = completedAudits.length
    ? Math.round(completedAudits.reduce((s, a) => s + (a.score_global ?? 0), 0) / completedAudits.length)
    : null
  const activeAlerts = completedAudits.filter(a => (a.score_global ?? 100) < 50).length

  return (
    <div className="space-y-6">
      {justUpgraded && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Plan actualizado correctamente</p>
            <p className="text-xs text-green-600 mt-0.5">Tu nuevo plan ya está activo. Las auditorías adicionales ya están disponibles.</p>
          </div>
        </div>
      )}
      {extrasAdded > 0 && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              {extrasAdded} auditoría{extrasAdded > 1 ? 's' : ''} adicional{extrasAdded > 1 ? 'es' : ''} añadida{extrasAdded > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-green-600 mt-0.5">Ya puedes usarlas desde el panel.</p>
          </div>
        </div>
      )}
      <CountdownBanner />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {profile?.full_name?.split(' ')[0] ?? 'usuario'}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Panel de auditorías de IA</p>
        </div>
        <Link href="/audits/new">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Nueva auditoría
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Auditorías este mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{used} <span className="text-gray-400 text-lg font-normal">/ {monthLimit}</span></p>
            <Progress value={usedPct} className="mt-2 h-2" />
            {plan === 'free' && (
              <p className="text-xs text-gray-400 mt-1">
                <Link href="/pricing" className="text-blue-600 hover:underline">Actualiza tu plan</Link> para más auditorías
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Score medio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {avgScore !== null ? (
              <>
                <p className="text-2xl font-bold">{avgScore}<span className="text-gray-400 text-lg">/100</span></p>
                <p className="text-xs text-gray-500 mt-1">{getClassificationLabel(avgScore >= 90 ? 'excellent' : avgScore >= 75 ? 'good' : avgScore >= 50 ? 'regular' : avgScore >= 25 ? 'deficient' : 'critical')}</p>
              </>
            ) : (
              <p className="text-2xl font-bold text-gray-300">—</p>
            )}
          </CardContent>
        </Card>

        <Card className={activeAlerts > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${activeAlerts > 0 ? 'text-red-500' : ''}`} />
              Alertas de compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${activeAlerts > 0 ? 'text-red-600' : ''}`}>{activeAlerts}</p>
            <p className="text-xs text-gray-500 mt-1">
              {activeAlerts > 0 ? 'Chatbots con score crítico' : 'Sin alertas activas'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de auditorías recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Auditorías recientes</CardTitle>
          <Link href="/audits" className="text-sm text-blue-600 hover:underline">Ver todas</Link>
        </CardHeader>
        <CardContent>
          {!audits?.length ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-lg mb-2">Aún no tienes auditorías</p>
              <Link href="/audits/new">
                <Button variant="outline" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Crear tu primera auditoría
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {audits.map(audit => (
                <AuditRow key={audit.id} audit={audit as any} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
