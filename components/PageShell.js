'use client'

import Image from 'next/image'
import LanguageSelector from './LanguageSelector'
import UniversalFooter from './UniversalFooter'
import { usePathname } from 'next/navigation'

import { C } from '../lib/theme'
import { DICTIONARY } from '../lib/dictionaries'
import { useLang } from './LanguageProvider'

export default function PageShell({ children }) {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['it']
  const pathname = usePathname()
  const isOnRegister = pathname === '/register'

  return (
    <div className="bg-slate-50 font-sans text-slate-900 min-h-screen flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="glass-header sticky top-0 left-0 right-0 z-50 py-2 sm:py-3 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2">
          <a href="/" className="flex items-center gap-1.5 sm:gap-3 no-underline group shrink-0">
            <div className="relative overflow-hidden rounded-xl">
              <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl transition-transform group-hover:scale-110" priority />
            </div>
            <span className="font-black text-sm sm:text-lg tracking-tight text-emerald-600">
              TIENDAONLINE
            </span>
          </a>

          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <LanguageSelector />
            <a href={isOnRegister ? '/login' : '/register'} className="glow-btn bg-emerald-500 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xl shadow-emerald-500/20 whitespace-nowrap border border-emerald-400/50">
              {isOnRegister ? dict.accedi : dict.registrati}
            </a>
          </div>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main className="flex-1 relative w-full pt-0">
        {children}
      </main>

      {/* ── Footer ── */}
      <UniversalFooter />

    </div>
  )
}
