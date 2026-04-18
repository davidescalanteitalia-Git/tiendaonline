import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPostBySlug, getAllPosts, getRelatedPosts } from '../../../lib/blog-posts'

// ── Genera rutas estáticas en build time ─────────────────────────────────────
export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

// ── Metadata dinámica por artículo ───────────────────────────────────────────
export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug)
  if (!post) return {}

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: { canonical: `https://tiendaonline.it/blog/${post.slug}` },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `https://tiendaonline.it/blog/${post.slug}`,
      siteName: 'TIENDAONLINE',
      type: 'article',
      publishedTime: post.date,
      authors: ['TIENDAONLINE'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
    },
  }
}

function formatDate(dateStr, lang) {
  const date = new Date(dateStr)
  const locales = { es: 'es-IT', it: 'it-IT', en: 'en-GB' }
  return date.toLocaleDateString(locales[lang] || 'es-IT', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ── Renderizado del contenido Markdown-like ──────────────────────────────────
// Procesamos manualmente sin dependencia externa para mantener el bundle mínimo
function renderContent(raw) {
  const lines = raw.split('\n')
  const elements = []
  let inTable = false
  let tableRows = []
  let listItems = []
  let inList = false
  let key = 0

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="my-5 space-y-2 pl-5">
          {listItems.map((item, i) => (
            <li key={i} className="text-slate-300 leading-relaxed flex gap-2">
              <span className="text-emerald-400 mt-1 shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      )
      listItems = []
    }
    inList = false
  }

  const flushTable = () => {
    if (tableRows.length > 0) {
      const [header, , ...body] = tableRows
      const headers = header.split('|').filter(c => c.trim())
      const rows = body.map(r => r.split('|').filter(c => c.trim()))
      elements.push(
        <div key={key++} className="my-6 overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/60">
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-slate-200 font-bold">
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-slate-300">
                      {cell.trim() === '✅' ? <span className="text-emerald-400">✅</span>
                      : cell.trim() === '❌' ? <span className="text-red-400">❌</span>
                      : <span dangerouslySetInnerHTML={{ __html: inlineFormat(cell.trim()) }} />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      tableRows = []
    }
    inTable = false
  }

  for (const line of lines) {
    const trimmed = line.trim()

    // Tablas
    if (trimmed.startsWith('|')) {
      if (!inTable) { inTable = true; flushList() }
      tableRows.push(trimmed)
      continue
    } else if (inTable) {
      flushTable()
    }

    // Listas
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true
      listItems.push(trimmed.slice(2))
      continue
    } else if (inList && trimmed === '') {
      flushList()
      continue
    } else if (inList) {
      flushList()
    }

    // Separador
    if (trimmed === '---') {
      elements.push(<hr key={key++} className="my-8 border-slate-800" />)
      continue
    }

    // Vacío
    if (trimmed === '') continue

    // Encabezados
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-lg font-black text-white mt-8 mb-3">
          {trimmed.slice(4)}
        </h3>
      )
      continue
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-xl sm:text-2xl font-black text-white mt-10 mb-4 pt-6 border-t border-slate-800/50">
          {trimmed.slice(3)}
        </h2>
      )
      continue
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote key={key++} className="my-5 pl-5 border-l-2 border-emerald-500/50 text-slate-400 italic leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed.slice(2)) }} />
        </blockquote>
      )
      continue
    }

    // Párrafo normal
    elements.push(
      <p key={key++} className="text-slate-300 leading-relaxed my-4">
        <span dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }} />
      </p>
    )
  }

  if (inList) flushList()
  if (inTable) flushTable()

  return elements
}

function inlineFormat(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors" target="_blank" rel="noopener">$1</a>')
}

// ── Schema.org Article JSON-LD ────────────────────────────────────────────────
function ArticleSchema({ post }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'TIENDAONLINE',
      url: 'https://tiendaonline.it',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TIENDAONLINE',
      url: 'https://tiendaonline.it',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tiendaonline.it/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://tiendaonline.it/blog/${post.slug}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

const CATEGORY_COLORS = {
  'Guías':       'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'Guide':       'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'Comparativas':'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  'Marketing':   'bg-violet-500/10 text-violet-400 border border-violet-500/20',
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function BlogPost({ params }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const related = getRelatedPosts(post.slug, 2)

  return (
    <>
      <ArticleSchema post={post} />

      <div className="min-h-screen bg-slate-950">

        {/* ── NAV ── */}
        <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-emerald-400 text-lg font-black tracking-tight">TIENDA</span>
              <span className="text-white text-lg font-black tracking-tight">ONLINE</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/blog" className="text-slate-400 hover:text-white text-xs font-medium transition-colors hidden sm:block">
                ← Blog
              </Link>
              <Link
                href="/register"
                className="text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl transition-colors"
              >
                Empezar gratis
              </Link>
            </div>
          </div>
        </nav>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

          {/* ── BREADCRUMB ── */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-slate-400 truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* ── HEADER ── */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-slate-700 text-slate-300'}`}>
                {post.category}
              </span>
              <span className="text-slate-500 text-xs">{formatDate(post.date, post.lang)}</span>
              <span className="text-slate-500 text-xs">{post.readTime} lectura</span>
            </div>

            <div className="text-5xl mb-5">{post.emoji}</div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-5">
              {post.title}
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed border-l-2 border-emerald-500/40 pl-4">
              {post.excerpt}
            </p>
          </header>

          {/* ── CONTENIDO ── */}
          <div className="prose-custom">
            {renderContent(post.content)}
          </div>

          {/* ── CTA INLINE ── */}
          <div className="mt-14 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-900/40 p-8 text-center">
            <p className="text-white font-black text-lg mb-2">¿Listo para probarlo?</p>
            <p className="text-slate-400 text-sm mb-5">Crea tu tienda gratis en 10 minutos. Sin tarjeta de crédito.</p>
            <Link
              href="/register"
              className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-2xl transition-colors text-sm"
            >
              Crear mi tienda gratis →
            </Link>
          </div>

          {/* ── ARTÍCULOS RELACIONADOS ── */}
          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">También te puede interesar</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {related.map(r => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} className="group">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 p-5 transition-all">
                      <div className="text-2xl mb-2">{r.emoji}</div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug mb-1">
                        {r.title}
                      </h3>
                      <span className="text-slate-500 text-xs">{r.readTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── BACK ── */}
          <div className="mt-12 pt-8 border-t border-slate-800">
            <Link href="/blog" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2">
              ← Volver al blog
            </Link>
          </div>

        </article>

        {/* ── FOOTER ── */}
        <footer className="border-t border-slate-800 mt-8 py-8 text-center text-slate-600 text-xs">
          <div className="max-w-3xl mx-auto px-4 flex flex-wrap justify-center gap-4">
            <Link href="/" className="hover:text-slate-400 transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-slate-400 transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <span>© 2026 TIENDAONLINE</span>
          </div>
        </footer>
      </div>
    </>
  )
}
