import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  getScoreColor, getScoreBadgeColor, getScoreEmoji,
  getSeverityColor, getSeverityLabel, getVerdictColor,
  getClassificationLabel, PHASE_NAMES, PHASE_ICONS,
} from '@/lib/scoring'
import ScoreGauge from '@/components/audit/ScoreGauge'
import DownloadPDFButton from '@/components/audit/DownloadPDFButton'
import DownloadCertificateButton from '@/components/audit/DownloadCertificateButton'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Wrench, ChevronDown } from 'lucide-react'

export default async function AuditResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()
  const { data: audit } = await service.from('audits').select('*').eq('id', id).eq('user_id', user.id).single()
  const { data: profile } = await service.from('users').select('plan').eq('id', user.id).single() as { data: { plan: string } | null }
  if (!audit) notFound()

  if (audit.status !== 'completed') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-500">
        <p className="text-lg font-medium">Auditoría en progreso...</p>
        <p className="text-sm">Estado: <strong>{audit.status}</strong></p>
        <Link href="/audits"><Button variant="outline">Volver a auditorías</Button></Link>
      </div>
    )
  }

  const { data: questions } = await service
    .from('audit_questions').select('*').eq('audit_id', id).order('order_index')
  const { data: risks } = await service
    .from('audit_legal_risks').select('*').eq('audit_id', id)
    .order('severity', { ascending: true })

  const score = audit.score_global ?? 0
  const phases = [1, 2, 3, 4, 5, 6]
  const phaseScores: Record<number, number> = {
    1: audit.score_linguistic ?? 0,
    2: audit.score_functional ?? 0,
    3: audit.score_guardrails ?? 0,
    4: audit.score_security ?? 0,
    5: audit.score_experience ?? 0,
    6: audit.score_legal ?? 0,
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{audit.assistant_name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {audit.company_name && `${audit.company_name} · `}
            {audit.sector} · {format(new Date(audit.created_at), "d MMMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0 flex-wrap">
          <DownloadPDFButton auditId={id} />
          {profile?.plan === 'enterprise' && (
            <DownloadCertificateButton auditId={id} />
          )}
          <Link href="/contact">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Wrench className="h-3.5 w-3.5" />
              Solicitar reparación
            </Button>
          </Link>
        </div>
      </div>

      {/* Score global */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ScoreGauge score={score} />
            <div className="flex-1 text-center md:text-left">
              <p className="text-4xl font-bold text-gray-900">{score}<span className="text-2xl text-gray-400">/100</span></p>
              <p className={`text-lg font-medium mt-1 ${getScoreColor(score)}`}>
                {getClassificationLabel(audit.classification as any)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Auditoría ref: <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{id}</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scores por fase */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {phases.map(phase => {
          const s = phaseScores[phase]
          return (
            <Card key={phase} className="text-center">
              <CardContent className="pt-4 pb-3">
                <p className="text-2xl mb-1">{PHASE_ICONS[phase]}</p>
                <p className="text-xs text-gray-500 mb-2 leading-tight">{PHASE_NAMES[phase]}</p>
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full border ${getScoreBadgeColor(s)}`}>
                  {getScoreEmoji(s)} {s}/100
                </span>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Métricas clave */}
      <Card>
        <CardHeader><CardTitle className="text-base">Métricas clave</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Brecha lingüística', value: `${audit.gap_formal_informal ?? 0}%`, warn: (audit.gap_formal_informal ?? 0) > 20 },
              { label: 'Tasa de alucinación', value: `${audit.hallucination_rate ?? 0}%`, warn: (audit.hallucination_rate ?? 0) > 10 },
              { label: 'Tasa de contención', value: `${audit.containment_rate ?? 0}%`, warn: (audit.containment_rate ?? 0) < 70 },
              { label: 'Resiliencia emocional', value: `${audit.emotional_resilience ?? 0}/100`, warn: (audit.emotional_resilience ?? 100) < 50 },
            ].map(m => (
              <div key={m.label} className={`rounded-lg p-3 text-center ${m.warn ? 'bg-red-50' : 'bg-gray-50'}`}>
                <p className={`text-xl font-bold ${m.warn ? 'text-red-600' : 'text-gray-800'}`}>{m.value}</p>
                <p className="text-xs text-gray-500 mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Riesgos legales */}
      {risks && risks.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-700">🔴 Dossier de riesgos legales ({risks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">Hallazgo</th>
                    <th className="pb-2 font-medium">Normativa</th>
                    <th className="pb-2 font-medium">Multa máx.</th>
                    <th className="pb-2 font-medium">Severidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {risks.map(risk => (
                    <tr key={risk.id}>
                      <td className="py-2.5 pr-4 max-w-xs">
                        <p className="font-medium text-gray-800 truncate">{risk.finding}</p>
                        {risk.real_case && <p className="text-xs text-gray-400 mt-0.5">Caso: {risk.real_case}</p>}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-600">
                        {risk.regulation}
                        {risk.regulation_article && <span className="text-gray-400"> · {risk.regulation_article}</span>}
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-gray-700">{risk.max_fine}</td>
                      <td className="py-2.5">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getSeverityColor(risk.severity)}`}>
                          {getSeverityLabel(risk.severity)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informe completo (markdown) */}
      {audit.report_markdown && (
        <Card>
          <CardHeader><CardTitle className="text-base">Informe ejecutivo completo</CardTitle></CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-mono text-xs bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              {audit.report_markdown}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preguntas y respuestas */}
      {questions && questions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Preguntas y evaluaciones ({questions.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map(phase => {
                const phaseQs = questions.filter(q => q.phase === phase)
                if (!phaseQs.length) return null
                return (
                  <details key={phase} className="group border rounded-lg">
                    <summary className="flex items-center justify-between p-3 cursor-pointer list-none">
                      <span className="font-medium text-sm">
                        {PHASE_ICONS[phase]} {PHASE_NAMES[phase]}
                        <span className="ml-2 text-gray-400 font-normal">({phaseQs.length} preguntas)</span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="border-t divide-y">
                      {phaseQs.map(q => (
                        <div key={q.id} className="p-3 text-sm">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-medium text-gray-700">{q.question_text}</p>
                            {q.verdict && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${getVerdictColor(q.verdict)}`}>
                                {q.verdict} · {q.score}/10
                              </span>
                            )}
                          </div>
                          {q.response_text && (
                            <p className="text-gray-500 text-xs mt-1 bg-gray-50 p-2 rounded">
                              <strong>Respuesta:</strong> {q.response_text}
                            </p>
                          )}
                          {q.explanation && (
                            <p className="text-gray-600 text-xs mt-1">{q.explanation}</p>
                          )}
                          {q.recommendation && (
                            <p className="text-blue-600 text-xs mt-1">💡 {q.recommendation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="font-semibold text-blue-900 mb-1">¿Necesitas ayuda para solucionar estos problemas?</p>
          <p className="text-sm text-blue-700 mb-4">Voroxia ofrece servicios de reparación y construcción de asistentes de IA compliance-ready.</p>
          <div className="flex gap-3">
            <Link href="/contact">
              <Button className="gap-1.5 bg-blue-600 hover:bg-blue-700">
                <Wrench className="h-4 w-4" />
                Solicitar reparación
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
