'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { DICTIONARY } from '../../lib/dictionaries'
import { useLang } from '../../components/LanguageProvider'
import LanguageSelector from '../../components/LanguageSelector'
import UniversalFooter from '../../components/UniversalFooter'
import {
  LayoutDashboard, Users, Store, LogOut, Menu, X,
  Globe, ChevronLeft, ChevronRight, ShieldCheck, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'davidescalanteitalia@gmail.com'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['it']

  const [checking, setChecking] = useState(true)
  const [admin, setAdmin] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const NAV = [
    { href: '/administrador',          icon: LayoutDashboard, label: dict.dashboard },
    { href: '/administrador/usuarios', icon: Users,           label: dict.utenti   },
    { href: '/administrador/tiendas',  icon: Store,           label: dict.negozi   },
  ]

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        router.replace('/login')
      } else {
        setAdmin(session.user)
        setChecking(false)
      }
    })
  }, [router])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck size={28} className="text-emerald-400" />
            </div>
            <div className="absolute inset-0 rounded-2xl border-2 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
          <div className="text-slate-400 font-semibold tracking-wide text-sm">{dict.verificando}…</div>
        </div>
      </div>
    )
  }

  const initials = admin?.email?.charAt(0).toUpperCase() || 'A'

  /* ─── Sidebar content ─────────────────────────────────────── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Brand */}
      <div className={`h-16 flex items-center border-b border-slate-800 shrink-0 ${collapsed ? 'justify-center px-4' : 'px-5 gap-3'}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
          <ShieldCheck size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-black text-sm tracking-tight leading-none">SUPER ADMIN</div>
            <div className="text-emerald-400 text-[0.65rem] font-bold uppercase tracking-widest mt-0.5">{dict.pannelloAdmin}</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-3 flex flex-col gap-1 overflow-y-auto">
        {NAV.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group overflow-hidden ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              } ${collapsed ? 'justify-center' : 'justify-start'}`}
            >
              {/* Active glow bar */}
              {isActive && (
                <span className="absolute left-0 inset-y-2 w-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]" />
              )}
              <Icon
                size={20}
                className={`shrink-0 transition-transform duration-200 ${isActive ? 'scale-110 drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]' : 'group-hover:scale-110'}`}
              />
              {!collapsed && (
                <span className={`font-semibold text-sm ${isActive ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-slate-800 shrink-0">
        {!collapsed && (
          <div className="px-3 py-3 mb-2 rounded-xl bg-slate-800/50 border border-slate-700/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md">
                {initials}
              </div>
              <div className="overflow-hidden">
                <div className="text-emerald-400 text-[0.65rem] font-bold uppercase tracking-widest">{dict.superAdmin}</div>
                <div className="text-slate-300 text-xs font-semibold truncate">{admin?.email}</div>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 font-semibold text-sm transition-all hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>{dict.esci}</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans selection:bg-emerald-500/20">

      {/* Subtle background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Desktop Sidebar ───────────────────────────── */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 sticky top-0 h-screen z-40 shrink-0 overflow-hidden"
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-[4.5rem] bg-slate-800 border border-slate-700 rounded-full p-1 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 shadow-lg transition-all z-50"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </motion.aside>

      {/* ── Mobile Overlay ────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Mobile Sidebar ────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 shadow-2xl z-50 md:hidden flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main ──────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">

        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 -ml-1 text-slate-400 hover:text-emerald-400 rounded-xl hover:bg-emerald-500/10 transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              {(() => {
                const active = NAV.find(n => n.href === pathname)
                const Icon = active?.icon
                return (
                  <>
                    {Icon && <Icon size={18} className="text-emerald-400 hidden md:block" />}
                    <span className="text-white font-bold text-base">{active?.label || 'Admin'}</span>
                  </>
                )
              })()}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <LanguageSelector />
            <a
              href="/"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20"
            >
              <Globe size={15} />
              {dict.vediSito}
            </a>
            {/* Status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)] animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold hidden sm:block">Online</span>
            </div>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-emerald-500/25 ring-2 ring-slate-800">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 md:p-7 flex flex-col z-10 w-full max-w-[1400px] mx-auto">
          <div className="flex-1 w-full">
            {children}
          </div>
          <div className="mt-12 pt-6 border-t border-slate-800">
            <UniversalFooter />
          </div>
        </div>
      </main>
    </div>
  )
}
