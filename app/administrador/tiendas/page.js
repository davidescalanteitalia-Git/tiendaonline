'use client'

import { useEffect, useState } from 'react'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'
import {
  Store, Search, AlertCircle, Lock, CheckCircle,
  Trash2, ExternalLink, X, ShieldAlert, ShieldCheck, Filter
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TiendasPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['it']

  const [tiendas,  setTiendas]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filtro,   setFiltro]   = useState('todas')
  const [confirm,  setConfirm]  = useState(null)

  const cargar = () => {
    setLoading(true)
    fetch('/api/admin/tiendas')
      .then(r => r.json())
      .then(d => { setTiendas(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const toggleEstado = async (tienda) => {
    const nuevoEstado = tienda.estado === 'activo' ? 'bloqueado' : 'activo'
    await fetch('/api/admin/tiendas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tienda.id, estado: nuevoEstado }),
    })
    cargar()
    setConfirm(null)
  }

  const eliminar = async (tienda) => {
    await fetch('/api/admin/tiendas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tienda.id }),
    })
    cargar()
    setConfirm(null)
  }

  const filtradas = tiendas.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      t.nombre?.toLowerCase().includes(q) ||
      t.subdominio?.toLowerCase().includes(q) ||
      t.whatsapp?.includes(q)
    const matchFiltro =
      filtro === 'todas'      ? true :
      filtro === 'activas'    ? t.estado === 'activo' :
      filtro === 'bloqueadas' ? t.estado === 'bloqueado' : true
    return matchSearch && matchFiltro
  })

  const FILTERS = [
    { key: 'todas',      label: dict.filtroTutte  },
    { key: 'activas',    label: dict.filtroAttive  },
    { key: 'bloqueadas', label: dict.filtroBloccate },
  ]

  return (
    <div className="text-slate-100 w-full">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-7"
      >
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 mb-1">
          <span className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <Store size={18} />
          </span>
          {dict.gestioneNegozi}
        </h1>
        <p className="text-slate-400 text-sm ml-12">
          {tiendas.length} {dict.negoziRegistrati} · {tiendas.filter(t => t.estado === 'activo').length} {dict.negoziAttiviLabel}
        </p>
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 mb-6"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder={dict.cercaNegoziPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-500 hidden sm:block" />
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                filtro === f.key
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/40 hover:bg-slate-700/50 hover:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
            <Store size={28} className="text-slate-600" />
          </div>
          <p className="text-slate-500 font-medium">{dict.nessunNegozioTrovato}</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filtradas.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="group bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5 flex flex-col gap-4 hover:border-slate-600/60 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-950/40 transition-all duration-300"
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-700/60 border border-slate-600/40 flex items-center justify-center shrink-0 group-hover:border-emerald-500/30 transition-all">
                    <Store size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-white font-bold text-sm leading-tight truncate">{t.nombre}</div>
                    <a
                      href={`https://${t.subdominio}.tiendaonline.it`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 text-xs font-semibold hover:underline flex items-center gap-1 mt-0.5"
                    >
                      {t.subdominio}.tiendaonline.it <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
                {/* Status badge */}
                <span className={`shrink-0 flex items-center gap-1.5 text-[0.65rem] font-bold px-2.5 py-1.5 rounded-full border ${
                  t.estado === 'activo'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {t.estado === 'activo'
                    ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />{dict.adminAttivo}</>
                    : <><span className="w-1.5 h-1.5 rounded-full bg-rose-400" />{dict.adminBloccato}</>
                  }
                </span>
              </div>

              {/* Info rows */}
              <div className="flex flex-col gap-2 text-sm">
                {t.whatsapp && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-base">📱</span>
                    <span>{t.whatsapp}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-base">📅</span>
                  <span>
                    {dict.registrataIl} {new Date(t.created_at).toLocaleDateString(
                      lang === 'it' ? 'it-IT' : lang === 'es' ? 'es-ES' : 'en-US',
                      { day: 'numeric', month: 'short', year: 'numeric' }
                    )}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1 border-t border-slate-700/40">
                <button
                  onClick={() => setConfirm({ type: 'toggle', tienda: t })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                    t.estado === 'activo'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40'
                  }`}
                >
                  {t.estado === 'activo' ? <><Lock size={13} />{dict.blocca}</> : <><CheckCircle size={13} />{dict.attiva}</>}
                </button>
                <button
                  onClick={() => setConfirm({ type: 'delete', tienda: t })}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40 transition-all duration-200"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={e => { if (e.target === e.currentTarget) setConfirm(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
              className="bg-slate-900 border border-slate-700/60 rounded-2xl p-7 max-w-sm w-full shadow-2xl shadow-slate-950/60"
            >
              {/* Modal icon */}
              <div className={`w-14 h-14 rounded-2xl mb-5 flex items-center justify-center ${
                confirm.type === 'delete'
                  ? 'bg-rose-500/15 border border-rose-500/30'
                  : confirm.tienda.estado === 'activo'
                    ? 'bg-amber-500/15 border border-amber-500/30'
                    : 'bg-emerald-500/15 border border-emerald-500/30'
              }`}>
                {confirm.type === 'delete'
                  ? <Trash2 size={24} className="text-rose-400" />
                  : confirm.tienda.estado === 'activo'
                    ? <ShieldAlert size={24} className="text-amber-400" />
                    : <ShieldCheck size={24} className="text-emerald-400" />
                }
              </div>

              <h3 className="text-white font-black text-lg mb-2">
                {confirm.type === 'delete'
                  ? dict.eliminaNegoziConfirm
                  : confirm.tienda.estado === 'activo'
                    ? `${dict.blocca} ${dict.perfilTienda}`
                    : `${dict.attiva} ${dict.perfilTienda}`
                }
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-7">
                {confirm.type === 'delete'
                  ? `${dict.eliminaNegoziConfirm.replace('?', '')} "${confirm.tienda.nombre}"?`
                  : `${confirm.tienda.estado === 'activo' ? dict.blocca : dict.attiva} "${confirm.tienda.nombre}"?`
                }
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-sm hover:bg-slate-800 hover:text-slate-300 transition-all"
                >
                  {dict.annulla}
                </button>
                <button
                  onClick={() => confirm.type === 'delete' ? eliminar(confirm.tienda) : toggleEstado(confirm.tienda)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    confirm.type === 'delete'
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25'
                      : confirm.tienda.estado === 'activo'
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                  }`}
                >
                  {dict.confirmar}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
