import Link from 'next/link'
import { getAllPosts } from '../../lib/blog-posts'

export const metadata = {
  title: 'Blog — TIENDAONLINE | Guías para vender online',
  description: 'Guías prácticas para pequeños negocios: cómo crear una tienda online, usar WhatsApp para vender, gestionar inventario y crecer sin gastar de más.',
  alternates: { canonical: 'https://tiendaonline.it/blog' },
  openGraph: {
    title: 'Blog TIENDAONLINE — Guías para pequeños negocios',
    description: 'Guías prácticas para vender online, gestionar tu negocio y crecer sin gastar de más.',
    url: 'https://tiendaonline.it/blog',
    siteName: 'TIENDAONLINE',
  },
}

const CATEGORY_COLORS = {
  'Guías':       'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'Guide':       'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'Comparativas':'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  'Marketing':   'bg-violet-500/10 text-violet-400 border border-violet-500/20',
}

function formatDate(dateStr, lang) {
  const date = new Date(dateStr)
  const locales = { es: 'es-IT', it: 'it-IT', en: 'en-GB' }
  return date.toLocaleDateString(locales[lang] || 'es-IT', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogIndex() {
  const posts = getAllPosts()
  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── NAV ── */}
      <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-emerald-400 text-lg font-black tracking-tight">TIENDA</span>
            <span className="text-white text-lg font-black tracking-tight">ONLINE</span>
          </Link>
          <Link
            href="/register"
            className="text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl transition-colors"
          >
            Empezar gratis →
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">

        {/* ── HEADER ── */}
        <div className="mb-14">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Blog</span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-3">
            Guías para vender online
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            Todo lo que necesitas saber para llevar tu negocio al mundo digital — sin gastar de más y sin complicarte la vida.
          </p>
        </div>

        {/* ── ARTÍCULO DESTACADO ── */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="block mb-12 group">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{featured.emoji}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[featured.category] || 'bg-slate-700 text-slate-300'}`}>
                  {featured.category}
                </span>
                <span className="text-slate-500 text-xs">{formatDate(featured.date, featured.lang)} · {featured.readTime}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-3 group-hover:text-emerald-300 transition-colors leading-snug">
                {featured.title}
              </h2>
              <p className="text-slate-400 leading-relaxed mb-5">{featured.excerpt}</p>
              <span className="text-emerald-400 text-sm font-bold group-hover:translate-x-1 inline-block transition-transform">
                Leer artículo →
              </span>
            </div>
          </Link>
        )}

        {/* ── GRID DE ARTÍCULOS ── */}
        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 transition-all p-6 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{post.emoji}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-slate-700 text-slate-300'}`}>
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mb-2 leading-snug flex-1">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800">
                    <span className="text-slate-500 text-xs">{formatDate(post.date, post.lang)}</span>
                    <span className="text-slate-500 text-xs">{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── CTA FINAL ── */}
        <div className="mt-20 rounded-3xl bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-900/40 p-10 text-center">
          <div className="text-4xl mb-4">🏪</div>
          <h2 className="text-2xl font-black text-white mb-2">¿Listo para empezar?</h2>
          <p className="text-slate-400 mb-6">Crea tu tienda online gratis en 10 minutos. Sin tarjeta de crédito.</p>
          <Link
            href="/register"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-2xl transition-colors text-sm"
          >
            Crear mi tienda gratis →
          </Link>
        </div>

      </div>

      {/* ── FOOTER MÍNIMO ── */}
      <footer className="border-t border-slate-800 mt-16 py-8 text-center text-slate-600 text-xs">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-4">
          <Link href="/" className="hover:text-slate-400 transition-colors">Home</Link>
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-400 transition-colors">Termini</Link>
          <span>© 2026 TIENDAONLINE</span>
        </div>
      </footer>
    </div>
  )
}
