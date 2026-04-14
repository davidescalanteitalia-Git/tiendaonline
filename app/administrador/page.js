'use client'

import { useEffect, useState } from 'react'
import { DICTIONARY } from '../../lib/dictionaries'
import { useLang } from '../../components/LanguageProvider'
import {
  Users, UserPlus, Calendar, Store, Lock, Package,
  ChevronRight, TrendingUp, Activity, AlertCircle, ShoppingBag, ArrowUpRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

/* ── Stat Card ──────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, accentClass, glowClass, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="relative bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5 overflow-hidden group hover:border-slate-600/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Glow blob */}
      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${glowClass}`} />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-slate-900/60 border border-slate-700/40 ${accentClass}`}>
          <Icon size={20} />
        </div>
        {sub && (
          <span className="text-[0.65rem] font-bold px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-400 border border-slate-700/40">
            {sub}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <div className="text-slate-400 text-xs font-semibold mb-1.5 tracking-wide uppercase">{label}</div>
        <div className={`text-4xl font-black tracking-tight ${accentClass}`}>{value}</div>
      </div>
    </motion.div>
  )
}

/* ── Dashboard ──────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['it']

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-slate-400 font-medium text-sm">{dict.caricandoStats}…</div>
      </div>
    </div>
  )

  const activeRate = stats?.totalTiendas
    ? Math.round((stats.tiendasActivas / stats.totalTiendas) * 100)
    : 0

  const STATS = [
    { icon: Users,    label: dict.totalUtenti,        value: stats?.totalUsuarios ?? 0,   sub: 'Total',  accentClass: 'text-blue-400',    glowClass: 'bg-blue-500',    delay: 0.08 },
    { icon: UserPlus, label: dict.nuoviOggi,           value: stats?.nuevosHoy ?? 0,       sub: 'Hoy',    accentClass: 'text-emerald-400', glowClass: 'bg-emerald-500', delay: 0.14 },
    { icon: Calendar, label: dict.questaSettimana,     value: stats?.nuevosSemana ?? 0,    sub: '7 días', accentClass: 'text-amber-400',   glowClass: 'bg-amber-500',   delay: 0.20 },
    { icon: Store,    label: dict.tiendeAttiveAdmin,   value: stats?.tiendasActivas ?? 0,  sub: 'Activas',accentClass: 'text-emerald-400', glowClass: 'bg-emerald-500', delay: 0.26 },
    { icon: Lock,     label: dict.tiendeBloccateAdmin, value: stats?.tiendasBloqueadas ?? 0, sub: 'Locked',accentClass: 'text-rose-400',  glowClass: 'bg-rose-500',    delay: 0.32 },
    { icon: Package,  label: dict.totaleTiendeAdmin,   value: stats?.totalTiendas ?? 0,    sub: 'Total',  accentClass: 'text-violet-400',  glowClass: 'bg-violet-500',  delay: 0.38 },
  ]

  return (
    <div className="text-slate-100 w-full">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3 mb-1.5">
          {dict.pannelloControllo}
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 tracking-widest uppercase">Live</span>
        </h1>
        <p className="text-slate-400 font-medium">{dict.vistaGeneraleSistema}</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {STATS.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Growth bar chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.42 }}
          className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/60 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
              <TrendingUp size={19} />
            </div>
            <h3 className="text-base font-bold text-white">{dict.crescitaUtenti}</h3>
          </div>

          <div className="flex items-end gap-2 h-[180px] pt-2">
            {(stats?.crecimiento || []).map((d, i) => {
              const max = Math.max(...(stats?.crecimiento || []).map(x => x.usuarios), 1)
              const h = (d.usuarios / max) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-default">
                  <span className="text-indigo-400 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.usuarios > 0 ? d.usuarios : ''}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(h, 3)}%` }}
                    transition={{ duration: 0.7, delay: 0.5 + i * 0.05, ease: 'easeOut' }}
                    className={`w-full rounded-t-lg transition-all duration-300 group-hover:brightness-125 ${
                      d.usuarios > 0
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                        : 'bg-slate-700/50'
                    }`}
                  />
                  <span className="text-slate-500 text-[9px] sm:text-[11px] font-semibold text-center whitespace-nowrap">
                    {d.dia}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Store status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.52 }}
          className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6 flex flex-col hover:border-slate-600/60 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Activity size={19} />
            </div>
            <h3 className="text-base font-bold text-white">{dict.statoTiende}</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6">
            {[
              { label: dict.tiendeAttiveAdmin,   val: stats?.tiendasActivas   || 0, color: 'bg-emerald-500', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.5)]', text: 'text-emerald-400' },
              { label: dict.tiendeBloccateAdmin, val: stats?.tiendasBloqueadas || 0, color: 'bg-rose-500',   glow: 'shadow-[0_0_8px_rgba(239,68,68,0.5)]',   text: 'text-rose-400'   },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-slate-400 font-semibold text-sm">{item.label}</span>
                  <span className={`font-black text-lg ${item.text}`}>{item.val}</span>
                </div>
                <div className="h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.val / (stats?.totalTiendas || 1)) * 100}%` }}
                    transition={{ duration: 1.2, delay: 0.9, ease: 'easeOut' }}
                    className={`h-full ${item.color} ${item.glow} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Activation rate */}
          <div className="mt-6 p-4 bg-slate-900/60 rounded-xl border border-slate-700/40 flex items-center justify-between">
            <div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{dict.tassoAttivazione}</div>
              <div className="text-emerald-400 font-black text-3xl">{activeRate}%</div>
            </div>
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Store size={18} className="text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.62 }}
        className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/60 transition-all duration-300"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <ShoppingBag size={19} />
            </div>
            <h3 className="text-base font-bold text-white">{dict.registrazioniRecenti}</h3>
          </div>
          <Link
            href="/administrador/tiendas"
            className="flex items-center gap-1.5 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40"
          >
            {dict.vediTutte} <ArrowUpRight size={15} />
          </Link>
        </div>

        {(stats?.recientes || []).length === 0 ? (
          <div className="text-center py-14 flex flex-col items-center gap-3">
            <AlertCircle size={36} className="text-slate-600" />
            <p className="text-slate-500 font-medium">{dict.nessunaTienda}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {(stats?.recientes || []).map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + i * 0.06 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-700/40 hover:border-emerald-500/25 hover:bg-emerald-500/5 transition-all duration-200 gap-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-700/60 border border-slate-600/40 flex items-center justify-center shrink-0 group-hover:border-emerald-500/30 transition-all">
                    <Store size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold leading-tight mb-0.5">{t.nombre}</div>
                    <a
                      href={`https://${t.subdominio}.tiendaonline.it`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 text-sm font-semibold hover:underline flex items-center gap-1"
                    >
                      {t.subdominio}.tiendaonline.it <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:justify-end">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                    t.estado === 'activo'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}>
                    {t.estado === 'activo' ? dict.adminAttivo : dict.adminBloccato}
                  </span>
                  <span className="text-slate-500 font-medium text-sm whitespace-nowrap">
                    {new Date(t.created_at).toLocaleDateString(lang === 'it' ? 'it-IT' : lang === 'es' ? 'es-ES' : 'en-US')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
