import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AuditRow from '@/components/dashboard/AuditRow'
import { PlusCircle } from 'lucide-react'

export default async function AuditsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()
  const { data: audits } = await service
    .from('audits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditorías</h1>
          <p className="text-gray-500 text-sm mt-0.5">{audits?.length ?? 0} auditorías en total</p>
        </div>
        <Link href="/audits/new">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Nueva auditoría
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-4">
          {!audits?.length ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg mb-4">Aún no tienes auditorías</p>
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
