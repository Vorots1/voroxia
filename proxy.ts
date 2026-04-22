import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rutas que no requieren sesión
const PUBLIC_ROUTES = ['/', '/blog', '/pricing', '/legal/terms', '/legal/privacy', '/legal/disclaimer']
const AUTH_ROUTES = ['/login', '/register']

// APIs con auth propia (no aplicar CORS interno)
const OPEN_API_PREFIXES = ['/api/webhooks', '/api/v1', '/api/cron']

// ── Rate limiting en memoria ──────────────────────────────────────────────
const rl = new Map<string, { n: number; reset: number }>()
let cleanupCounter = 0

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

function maybeCleanup() {
  if (++cleanupCounter < 100) return
  cleanupCounter = 0
  const now = Date.now()
  for (const [key, val] of rl) {
    if (now >= val.reset) rl.delete(key)
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getIP(request)

  maybeCleanup()

  // ── Rate limiting ────────────────────────────────────────────────────────
  const isAuthEndpoint = AUTH_ROUTES.some(r => pathname.startsWith(r))
  if (isAuthEndpoint && rateLimited(`auth:${ip}`, 10, 60_000)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }
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

    if (origin && origin !== allowed && origin !== 'http://localhost:3000') {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // ── Auth guard ───────────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isApi = pathname.startsWith('/api/')
  const isPublic = PUBLIC_ROUTES.some(r => pathname === r)
    || pathname.startsWith('/blog/')
    || pathname.startsWith('/legal/')
  const isAuth = AUTH_ROUTES.some(r => pathname.startsWith(r))

  // Redirige a /login si accede a ruta protegida sin sesión
  if (!user && !isPublic && !isAuth && !isApi) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirige al dashboard si ya está logueado e intenta entrar en login/register
  if (user && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)'],
}
