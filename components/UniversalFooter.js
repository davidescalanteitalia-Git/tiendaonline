'use client'

import Image from 'next/image'
import { DICTIONARY } from '../lib/dictionaries'
import { useLang } from './LanguageProvider'
import { ShoppingBag, Globe, Lock, FileText, Mail, Cookie } from 'lucide-react'

const STORAGE_KEY = 'tiendaonline_cookie_consent'

export default function UniversalFooter() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['it']

  const links = [
    { href: '/privacy', label: dict.footerPrivacy || 'Política de privacidad', icon: Lock },
    { href: '/terms', label: dict.footerTerms || 'Términos de servicio', icon: FileText },
    { href: '/cookie-policy', label: 'Cookie Policy', icon: Cookie },
    { href: '/contatti', label: dict.footerContact || 'Contacto', icon: Mail },
  ]

  return (
    <footer className="relative w-full bg-slate-950 overflow-hidden">
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-[100px]" />
      <div className="pointer-events-none absolute -top-32 right-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-[100px]" />

      {/* Top border gradient */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Main row */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">

          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(52,211,153,0.2)]">
                <ShoppingBag size={18} className="text-emerald-400" />
              </div>
              <span className="font-black text-white text-lg tracking-tight">TIENDAONLINE</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              {dict.footerTagline || 'Tu tienda online en 10 minutos'}
            </p>
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {lang === 'it' ? 'Tutti i servizi operativi' : lang === 'en' ? 'All services operational' : 'Todos los servicios operativos'}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-2">
            {links.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-slate-800 text-sm font-medium transition-all duration-200"
              >
                <Icon size={13} />
                {label}
              </a>
            ))}
            <button
              onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.reload() }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 hover:bg-slate-800 text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              <Cookie size={13} />
              {lang === 'it' ? 'Gestisci cookie' : lang === 'es' ? 'Gestionar cookies' : 'Manage cookies'}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-slate-800/80 mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-slate-600 text-xs font-medium">
            © {new Date().getFullYear()} TIENDAONLINE. 
            {lang === 'it' ? ' Tutti i diritti riservati.' : lang === 'en' ? ' All rights reserved.' : ' Todos los derechos reservados.'}
          </span>
          <span className="text-slate-600 text-xs font-medium flex items-center gap-1.5">
            <Globe size={12} className="text-slate-500" />
            {dict.footerCredit || 'Desarrollado por David Escalante'}
          </span>
        </div>

      </div>
    </footer>
  )
}
