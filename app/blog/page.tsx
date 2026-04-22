import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import { Shield, Clock, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog EU AI Act | Voroxia',
  description: 'Guías y análisis sobre el Reglamento (UE) 2024/1689 y su impacto en chatbots y asistentes de IA. Prepara tu empresa para el cumplimiento obligatorio en agosto de 2026.',
  openGraph: {
    title: 'Blog EU AI Act | Voroxia',
    description: 'Guías y análisis sobre el EU AI Act y chatbots de IA.',
    url: 'https://voroxia.com/blog',
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  'Regulación': 'bg-blue-100 text-blue-700',
  'Cumplimiento': 'bg-red-100 text-red-700',
  'Guías técnicas': 'bg-emerald-100 text-emerald-700',
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="font-bold text-white">Voroxia</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/#precios" className="text-slate-400 hover:text-white transition-colors">Precios</Link>
            <Link href="/login" className="text-slate-400 hover:text-white transition-colors">Entrar</Link>
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors">
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-block bg-blue-950 border border-blue-800 text-blue-400 text-xs font-medium px-3 py-1 rounded-full mb-4">
            EU AI Act · Agosto 2026
          </span>
          <h1 className="text-4xl font-bold text-white mb-4">
            Guías de cumplimiento EU AI Act
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Todo lo que necesitas saber para que tus chatbots e IA sean conformes con el Reglamento (UE) 2024/1689 antes del plazo obligatorio.
          </p>
        </div>

        {/* Post grid */}
        <div className="grid gap-6">
          {posts.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-slate-900 border border-white/5 rounded-2xl p-6 hover:border-blue-500/40 hover:bg-slate-800/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-slate-700 text-slate-300'}`}>
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {post.readingTime} min
                    </span>
                    <span className="text-xs text-slate-600">
                      {new Date(post.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                    {post.description}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-800/50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">¿Tu chatbot cumple el EU AI Act?</h2>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto">
            Audita tu chatbot en minutos y obtén un informe accionable con score de cumplimiento, riesgos legales y recomendaciones.
          </p>
          <Link
            href="/register"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Empezar gratis →
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 mt-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} Voroxia. Todos los derechos reservados.</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">Inicio</Link>
            <Link href="/#precios" className="hover:text-slate-300 transition-colors">Precios</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
