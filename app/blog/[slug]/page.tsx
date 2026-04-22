import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPost, getAllPosts } from '@/lib/blog'
import { Shield, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} | Voroxia Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://voroxia.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-white mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-white mt-10 mb-4">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-slate-300">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul class="list-disc space-y-1 my-3 pl-2">${m}</ul>`)
    .replace(/^\|(.+)\|$/gm, (row) => {
      const cells = row.split('|').slice(1, -1).map(c => c.trim())
      const isHeader = false
      return `<tr class="border-b border-white/10">${cells.map(c =>
        `<td class="py-2 px-4 text-sm text-slate-300">${c}</td>`
      ).join('')}</tr>`
    })
    .replace(/(<tr[^>]*>.*<\/tr>\n?)+/g, m => `<div class="overflow-x-auto my-6"><table class="w-full border border-white/10 rounded-lg overflow-hidden">${m}</table></div>`)
    .replace(/\n\n/g, '</p><p class="text-slate-300 leading-relaxed my-4">')
    .replace(/^([^<\n].+)$/gm, (line) => {
      if (line.startsWith('<') || !line.trim()) return line
      return line
    })
}

const CATEGORY_COLORS: Record<string, string> = {
  'Regulación': 'bg-blue-950 border-blue-800 text-blue-400',
  'Cumplimiento': 'bg-red-950 border-red-800 text-red-400',
  'Guías técnicas': 'bg-emerald-950 border-emerald-800 text-emerald-400',
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const allPosts = getAllPosts()
  const currentIndex = allPosts.findIndex(p => p.slug === slug)
  const prev = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  const next = currentIndex > 0 ? allPosts[currentIndex - 1] : null

  const sections = post.content.split(/\n(?=## )/)

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
            <Link href="/blog" className="text-slate-400 hover:text-white transition-colors">← Blog</Link>
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors">
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8">
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al blog
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${CATEGORY_COLORS[post.category] ?? 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {post.readingTime} min de lectura
            </span>
            <span className="text-xs text-slate-600">
              {new Date(post.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            {post.description}
          </p>
        </header>

        {/* Content */}
        <article className="prose prose-invert max-w-none">
          {sections.map((section, i) => {
            const lines = section.split('\n')
            const isH2 = lines[0].startsWith('## ')
            const heading = isH2 ? lines[0].replace('## ', '') : null
            const body = (isH2 ? lines.slice(1) : lines).join('\n')

            return (
              <div key={i} className="mb-8">
                {heading && (
                  <h2 className="text-2xl font-bold text-white mt-10 mb-4 border-b border-white/10 pb-3">
                    {heading}
                  </h2>
                )}
                {body.split('\n').map((line, j) => {
                  if (!line.trim()) return null

                  if (line.startsWith('### ')) {
                    return <h3 key={j} className="text-xl font-bold text-white mt-6 mb-3">{line.replace('### ', '')}</h3>
                  }

                  if (line.startsWith('- ')) {
                    return (
                      <ul key={j} className="list-disc ml-6 my-1">
                        <li className="text-slate-300 leading-relaxed">{line.replace('- ', '').replace(/\*\*(.+?)\*\*/g, '$1')}</li>
                      </ul>
                    )
                  }

                  if (line.startsWith('| ')) {
                    return null
                  }

                  const formatted = line
                    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')

                  return (
                    <p
                      key={j}
                      className="text-slate-300 leading-relaxed my-3"
                      dangerouslySetInnerHTML={{ __html: formatted }}
                    />
                  )
                })}

                {/* Table rendering */}
                {body.includes('| ') && (() => {
                  const tableLines = body.split('\n').filter(l => l.startsWith('| '))
                  if (!tableLines.length) return null
                  const [headerRow, , ...dataRows] = tableLines
                  const headers = headerRow.split('|').slice(1, -1).map(c => c.trim())
                  const rows = dataRows.map(r => r.split('|').slice(1, -1).map(c => c.trim()))
                  return (
                    <div className="overflow-x-auto my-6">
                      <table className="w-full border border-white/10 rounded-lg overflow-hidden text-sm">
                        <thead className="bg-slate-800">
                          <tr>
                            {headers.map((h, idx) => (
                              <th key={idx} className="py-2.5 px-4 text-left text-slate-300 font-semibold">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, idx) => (
                            <tr key={idx} className="border-t border-white/5 hover:bg-slate-800/50">
                              {row.map((cell, cidx) => (
                                <td key={cidx} className="py-2.5 px-4 text-slate-300"
                                  dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }}
                                />
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                })()}
              </div>
            )
          })}
        </article>

        {/* CTA inline */}
        <div className="my-12 bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-800/50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-2">Audita tu chatbot ahora</h3>
          <p className="text-slate-400 text-sm mb-5">
            Genera un informe de cumplimiento EU AI Act en minutos. Plan gratuito disponible.
          </p>
          <Link
            href="/register"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            Empezar gratis →
          </Link>
        </div>

        {/* Prev/Next navigation */}
        {(prev || next) && (
          <nav className="flex gap-4 pt-8 border-t border-white/10">
            {prev && (
              <Link
                href={`/blog/${prev.slug}`}
                className="flex-1 group block bg-slate-900 border border-white/5 rounded-xl p-4 hover:border-blue-500/40 transition-all"
              >
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Anterior
                </p>
                <p className="text-sm text-slate-300 group-hover:text-white font-medium transition-colors line-clamp-2">
                  {prev.title}
                </p>
              </Link>
            )}
            {next && (
              <Link
                href={`/blog/${next.slug}`}
                className="flex-1 group block bg-slate-900 border border-white/5 rounded-xl p-4 hover:border-blue-500/40 transition-all text-right"
              >
                <p className="text-xs text-slate-500 mb-1 flex items-center justify-end gap-1">
                  Siguiente <ArrowRight className="h-3 w-3" />
                </p>
                <p className="text-sm text-slate-300 group-hover:text-white font-medium transition-colors line-clamp-2">
                  {next.title}
                </p>
              </Link>
            )}
          </nav>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 mt-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} Voroxia. Todos los derechos reservados.</span>
          <div className="flex gap-6">
            <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
            <Link href="/#precios" className="hover:text-slate-300 transition-colors">Precios</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
