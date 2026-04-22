import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { getScoreBadgeColor, getScoreEmoji, PHASE_NAMES } from '@/lib/scoring'
import type { Audit } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronRight, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'

const STATUS_ICON: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
  pending: <Clock className="h-4 w-4 text-gray-400" />,
  planning: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
  executing: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
  evaluating: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
}

const STATUS_LABEL: Record<string, string> = {
  completed: 'Completada',
  failed: 'Error',
  pending: 'Pendiente',
  planning: 'Planificando...',
  executing: 'Ejecutando...',
  evaluating: 'Evaluando...',
}

export default function AuditRow({ audit }: { audit: Audit }) {
  const isCompleted = audit.status === 'completed'
  const isInProgress = ['planning', 'executing', 'evaluating'].includes(audit.status)

  return (
    <Link
      href={`/audits/${audit.id}`}
      className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        {STATUS_ICON[audit.status]}
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">{audit.assistant_name}</p>
          <p className="text-xs text-gray-400 truncate">
            {audit.company_name && `${audit.company_name} · `}
            {audit.sector} · {format(new Date(audit.created_at), "d MMM yyyy", { locale: es })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {isCompleted && audit.score_global !== null ? (
          <span className={`text-sm font-bold px-2.5 py-1 rounded-full border ${getScoreBadgeColor(audit.score_global)}`}>
            {getScoreEmoji(audit.score_global)} {audit.score_global}/100
          </span>
        ) : (
          <span className="text-sm text-gray-400">{STATUS_LABEL[audit.status]}</span>
        )}
        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </Link>
  )
}
