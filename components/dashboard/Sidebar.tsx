'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { User } from '@/types'
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Settings,
  MessageSquare,
  LogOut,
  Shield,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/audits', label: 'Auditorías', icon: ClipboardList },
  { href: '/audits/new', label: 'Nueva auditoría', icon: PlusCircle },
  { href: '/contact', label: 'Solicitar reparación', icon: MessageSquare },
  { href: '/settings', label: 'Configuración', icon: Settings },
]

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  starter: 'bg-blue-100 text-blue-700',
  professional: 'bg-purple-100 text-purple-700',
  enterprise: 'bg-amber-100 text-amber-700',
}

export default function Sidebar({ user }: { user: User | null }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Voroxia</span>
        </div>
        {user && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-800 truncate">{user.full_name || user.email}</p>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize mt-1 inline-block', PLAN_COLORS[user.plan])}>
              {user.plan}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        {user && (
          <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Auditorías este mes</p>
            <p className="text-sm font-semibold text-gray-800">
              {user.audits_used_this_month} / {user.plan === 'free' ? 1 : user.plan === 'starter' ? 10 : user.plan === 'professional' ? 30 : 100}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
