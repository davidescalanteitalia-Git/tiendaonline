'use client'

import { useEffect, useState } from 'react'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'
import {
  Users, Search, ExternalLink, Lock, CheckCircle,
  Trash2, Filter, ShieldAlert, ShieldCheck, UserX, Store
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UsuariosPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['it']

  const [usuarios, setUsuarios] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filtro,   setFiltro]   = useState('todos')
  const [confirm,  setConfirm]  = useState(null)

  const cargar = () => {
    setLoading(true)
    fetch('/api/admin/usuarios')
      .then(r => r.json())
      .then(d => { setUsuarios(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const toggleEstado = async (user) => {
    const nuevoEstado = user.tienda?.estado === 'activo' ? 'bloqueado' : 'activo'
    await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tiendaId: user.tienda?.id, estado: nuevoEstado }),
    })
    cargar()
    setConfirm(null)
  }

  const eliminarUsuario = async (user) => {
    await fetch('/api/admin/usuarios', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, tiendaId: user.tienda?.id }),
    })
    cargar()
    setConfirm(null)
  }

  const filtrados = usuarios.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      u.email?.toLowerCase().includes(q) ||
      u.tienda?.nombre?.toLowerCase().includes(q) ||
      u.tienda?.subdominio?.toLowerCase().includes(q)
    const matchFiltro =
      filtro === 'todos'      ? true :
      filtro === 'activos'    ? u.tienda?.estado === 'activo' :
      filtro === 'bloqueados' ? u.tienda?.estado === 'bloqueado' :
      filtro === 'sin-tienda' ? !u.tienda : true
    return matchSearch && matchFiltro
  })

  const FILTERS = [
    { key: 'todos',      label: dict.filtroTutte    },
    { key: 'activos',    label: dict.filtroAttive    },
    { key: 'bloqueados', label: dict.filtroBloccate  },
    { key: 'sin-tienda', label: dict.sinTienda       },
  ]

  const dateStr = (iso) => new Date(iso).toLocaleDateString(
    lang === 'it' ? 'it-IT' : lang === 'es' ? 'es-ES' : 'en-US',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )

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
          <span className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
            <Users size={18} />
          </span>
          {dict.gestioneUtenti}
        </h1>
        <p className="text-slate-400 text-sm ml-12">
          {usuarios.length} {dict.utentiRegistrati}
        </p>
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap items-center gap-3 mb-6"
      >
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder={dict.cercaNegoziPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-500 hidden sm:block" />
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                filtro === f.key
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/40 hover:bg-slate-700/50 hover:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
            <UserX size={26} className="text-slate-600" />
          </div>
          <p className="text-slate-500 font-medium">{dict.nessunNegozioTrovato}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="hidden lg:block bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden"
          >
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1.8fr_1.4fr_1fr_1fr_1.4fr] px-5 py-3.5 bg-slate-900/60 border-b border-slate-700/50">
              {[dict.tabEmail, dict.tabNegozio, dict.tabSotto, dict.tabWA, dict.tabStato, dict.tabAzioni].map(h => (
                <div key={h} className="text-slate-500 text-[0.7rem] font-bold uppercase tracking-wider">{h}</div>
              ))}
            </div>

            {/* Rows */}
            {filtrados.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className={`grid grid-cols-[2fr_1.8fr_1.4fr_1fr_1fr_1.4fr] px-5 py-4 items-center transition-colors hover:bg-slate-700/30 ${
                  i < filtrados.length - 1 ? 'border-b border-slate-700/30' : ''
                }`}
              >
                {/* Email */}
                <div>
                  <div className="text-slate-200 text-sm font-semibold truncate max-w-[210px]">{u.email}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{dateStr(u.created_at)}</div>
                </div>

                {/* Store name */}
                <div className="flex items-center gap-2">
                  {u.tienda
                    ? <>
                        <Store size={13} className="text-slate-500 shrink-0" />
                        <span className="text-slate-300 text-sm truncate max-w-[160px]">{u.tienda.nombre}</span>
                      </>
                    : <span className="text-slate-600 text-sm">—</span>
                  }
                </div>

                {/* Subdomain */}
                <div>
                  {u.tienda
                    ? <a
                        href={`https://${u.tienda.subdominio}.tiendaonline.it`}
                        target="_blank" rel="noreferrer"
                        className="text-emerald-400 text-sm font-semibold hover:underline flex items-center gap-1"
                      >
                        {u.tienda.subdominio} <ExternalLink size={11} />
                      </a>
                    : <span className="text-slate-600 text-sm">—</span>
                  }
                </div>

                {/* WhatsApp */}
                <div className="text-slate-400 text-sm">{u.tienda?.whatsapp || '—'}</div>

                {/* Status */}
                <div>
                  {u.tienda
                    ? <span className={`inline-flex items-center gap-1.5 text-[0.65rem] font-bold px-2.5 py-1.5 rounded-full border ${
                        u.tienda.estado === 'activo'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          u.tienda.estado === 'activo' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                        }`} />
                        {u.tienda.estado === 'activo' ? dict.adminAttivo : dict.adminBloccato}
                      </span>
                    : <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold px-2.5 py-1.5 rounded-full bg-slate-700/60 text-slate-500 border border-slate-700/40">
                        <UserX size={10} /> {dict.sinTienda}
                      </span>
                  }
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {u.tienda && (
                    <button
                      onClick={() => setConfirm({ type: 'toggle', user: u })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        u.tienda.estado === 'activo'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40'
                      }`}
                    >
                      {u.tienda.estado === 'activo' ? <><Lock size={11} />{dict.blocca}</> : <><CheckCircle size={11} />{dict.attiva}</>}
                    </button>
                  )}
                  <button
                    onClick={() => setConfirm({ type: 'delete', user: u })}
                    className="p-1.5 rounded-lg text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {filtrados.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex flex-col gap-4 hover:border-slate-600/60 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-slate-200 text-sm font-semibold break-all">{u.email}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{dateStr(u.created_at)}</div>
                  </div>
                  {u.tienda
                    ? <span className={`shrink-0 inline-flex items-center gap-1.5 text-[0.65rem] font-bold px-2.5 py-1.5 rounded-full border ${
                        u.tienda.estado === 'activo'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.tienda.estado === 'activo' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                        {u.tienda.estado === 'activo' ? dict.adminAttivo : dict.adminBloccato}
                      </span>
                    : <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold px-2.5 py-1.5 rounded-full bg-slate-700/60 text-slate-500 border border-slate-700/40">
                        <UserX size={10} /> {dict.sinTienda}
                      </span>
                  }
                </div>

                {u.tienda && (
                  <div className="flex flex-col gap-1.5 text-sm p-3 bg-slate-900/40 rounded-xl border border-slate-700/30">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Store size={13} className="text-slate-500" />
                      <span className="font-semibold">{u.tienda.nombre}</span>
                    </div>
                    <a
                      href={`https://${u.tienda.subdominio}.tiendaonline.it`}
                      target="_blank" rel="noreferrer"
                      className="text-emerald-400 text-xs font-semibold hover:underline flex items-center gap-1 ml-5"
                    >
                      {u.tienda.subdominio}.tiendaonline.it <ExternalLink size={10} />
                    </a>
                  </div>
                )}

                <div className="flex gap-2 pt-1 border-t border-slate-700/40">
                  {u.tienda && (
                    <button
                      onClick={() => setConfirm({ type: 'toggle', user: u })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all border ${
                        u.tienda.estado === 'activo'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40'
                      }`}
                    >
                      {u.tienda.estado === 'activo' ? <><Lock size={13} />{dict.blocca}</> : <><CheckCircle size={13} />{dict.attiva}</>}
                    </button>
                  )}
                  <button
                    onClick={() => setConfirm({ type: 'delete', user: u })}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
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
              <div className={`w-14 h-14 rounded-2xl mb-5 flex items-center justify-center ${
                confirm.type === 'delete'
                  ? 'bg-rose-500/15 border border-rose-500/30'
                  : confirm.user.tienda?.estado === 'activo'
                    ? 'bg-amber-500/15 border border-amber-500/30'
                    : 'bg-emerald-500/15 border border-emerald-500/30'
              }`}>
                {confirm.type === 'delete'
                  ? <Trash2 size={24} className="text-rose-400" />
                  : confirm.user.tienda?.estado === 'activo'
                    ? <ShieldAlert size={24} className="text-amber-400" />
                    : <ShieldCheck size={24} className="text-emerald-400" />
                }
              </div>

              <h3 className="text-white font-black text-lg mb-2">
                {confirm.type === 'delete'
                  ? dict.eliminaNegoziConfirm
                  : confirm.user.tienda?.estado === 'activo'
                    ? `${dict.blocca} ${dict.perfilTienda}`
                    : `${dict.attiva} ${dict.perfilTienda}`
                }
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-7">
                {confirm.type === 'delete'
                  ? `${dict.eliminaNegoziConfirm.replace('?', '')} "${confirm.user.email}"?`
                  : `${confirm.user.tienda?.estado === 'activo' ? dict.blocca : dict.attiva} "${confirm.user.email}"?`
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
                  onClick={() => confirm.type === 'delete' ? eliminarUsuario(confirm.user) : toggleEstado(confirm.user)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    confirm.type === 'delete'
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25'
                      : confirm.user.tienda?.estado === 'activo'
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
