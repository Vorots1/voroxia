import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren sesión activa
const PROTECTED = ['/dashboard', '/audits', '/settings', '/pricing', '/contact']

// APIs internas: solo acepta peticiones desde voroxia.com (misma origen)
// Excluidas: webhooks de Stripe, API pública v1, cron (tienen su propia auth)
const OPEN_API_PREFIXES = ['/api/webhooks', '/api/v1', '/api/cron']

// Rate limiting en memoria (por instancia serverless — suficiente para frenar abusos básicos)
const rl = new Map<string, { n: number; reset: number }>()

function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
}

function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rl.get(key)
  if (!entry || now >= entry.reset) {
    rl.set(key, { n: 1, reset: now + windowMs })
    return false
  }
  if (entry.n >= max) return true
  entry.n++
  return false
}

// Limpia entradas expiradas cada ~100 peticiones para evitar memory leak
let cleanupCounter = 0
function maybeCleanup() {
  if (++cleanupCounter < 100) return
  cleanupCounter = 0
  const now = Date.now()
  for (const [key, val] of rl) {
    if (now >= val.reset) rl.delete(key)
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getIP(request)

  maybeCleanup()

  // ── Rate limiting ────────────────────────────────────────────────────────
  // Más estricto en endpoints de autenticación (10 req/min)
  const isAuthEndpoint = pathname === '/login' || pathname === '/register'
  if (isAuthEndpoint && rateLimited(`auth:${ip}`, 10, 60_000)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }
  // APIs internas: 60 req/min por IP
  if (pathname.startsWith('/api/') && rateLimited(`api:${ip}`, 60, 60_000)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // ── CORS para APIs internas ──────────────────────────────────────────────
  if (
    pathname.startsWith('/api/') &&
    !OPEN_API_PREFIXES.some(p => pathname.startsWith(p))
  ) {
    const origin = request.headers.get('origin')
    const allowed = process.env.NEXT_PUBLIC_APP_URL ?? 'https://voroxia.com'

    // Preflight OPTIONS
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowed,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // Bloquea peticiones cross-origin que no vengan de nuestro dominio
    if (origin && origin !== allowed && origin !== 'http://localhost:3000') {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // ── Auth guard para rutas protegidas ─────────────────────────────────────
  const needsAuth = PROTECTED.some(p => pathname === p || pathname.startsWith(`${p}/`))
  if (!needsAuth) return NextResponse.next()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    // Aplica a todo excepto archivos estáticos de Next.js y assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
