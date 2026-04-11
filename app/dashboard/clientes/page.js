'use client'

import { useState, useEffect } from 'react'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'
import {
  Users,
  Search,
  MessageCircle,
  ShoppingBag,
  TrendingUp,
  Calendar,
  ChevronRight,
  X,
  Phone,
  Star,
  Loader2,
  ArrowUpRight
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

// Extrae el metadata oculto en los items del pedido
function getMeta(items) {
  if (!Array.isArray(items)) return {}
  return items.find(i => i.id === 'ORDER_META') || {}
}

// Agrupa pedidos por nombre de cliente y construye perfil
function buildClientes(pedidos) {
  const map = {}
  pedidos.forEach(p => {
    const key = p.cliente_nombre?.trim().toLowerCase()
    if (!key) return
    const meta = getMeta(p.items)
    if (!map[key]) {
      map[key] = {
        nombre: p.cliente_nombre,
        whatsapp: meta.whatsapp || null,
        pedidos: [],
        totalGastado: 0,
        ultimoPedido: null,
      }
    }
    map[key].pedidos.push(p)
    map[key].totalGastado += parseFloat(p.total) || 0
    if (!map[key].ultimoPedido || new Date(p.created_at) > new Date(map[key].ultimoPedido)) {
      map[key].ultimoPedido = p.created_at
      if (meta.whatsapp) map[key].whatsapp = meta.whatsapp
    }
  })

  return Object.values(map).sort((a, b) => b.totalGastado - a.totalGastado)
}

// Etiqueta de valor del cliente
function getTag(total, count) {
  if (count >= 5 || total >= 200) return { label: 'VIP', color: 'bg-amber-100 text-amber-700 border-amber-200' }
  if (count >= 2 || total >= 50)  return { label: 'Frecuente', color: 'bg-blue-100 text-blue-700 border-blue-200' }
  return { label: 'Nuevo', color: 'bg-slate-100 text-slate-500 border-slate-200' }
}

export default function ClientesPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']

  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const res = await fetch('/api/pedidos', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        const data = await res.json()
        const pedidos = data.pedidos || []
        setClientes(buildClientes(pedidos))
      } catch (err) {
        console.error('Error loading clients:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.whatsapp && c.whatsapp.includes(search))
  )

  // ── Stats globales ──
  const totalClientes  = clientes.length
  const totalVentas    = clientes.reduce((s, c) => s + c.totalGastado, 0)
  const vipCount       = clientes.filter(c => getTag(c.totalGastado, c.pedidos.length).label === 'VIP').length
  const frecuenteCount = clientes.filter(c => getTag(c.totalGastado, c.pedidos.length).label === 'Frecuente').length

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-blue-500" size={32} />
            {lang === 'it' ? 'Clienti' : lang === 'en' ? 'Customers' : 'Clientes'}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            {lang === 'it' ? 'Storico acquisti e contatti dei tuoi clienti.' : lang === 'en' ? 'Purchase history and contact info for your customers.' : 'Historial de compras y contactos de tus clientes.'}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: lang === 'it' ? 'Clienti totali' : lang === 'en' ? 'Total customers' : 'Clientes totales', value: totalClientes, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: lang === 'it' ? 'Fatturato totale' : lang === 'en' ? 'Total revenue' : 'Facturación total', value: `€${totalVentas.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'VIP', value: vipCount, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: lang === 'it' ? 'Frequenti' : lang === 'en' ? 'Frequent' : 'Frecuentes', value: frecuenteCount, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-4`}>
              <s.icon size={20} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'it' ? 'Cerca per nome o WhatsApp...' : lang === 'en' ? 'Search by name or WhatsApp...' : 'Buscar por nombre o WhatsApp...'}
          className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[32px] p-16 border-2 border-dashed border-slate-200 text-center shadow-sm">
          <Users size={52} className="mx-auto mb-4 text-slate-200" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            {clientes.length === 0
              ? (lang === 'it' ? 'Nessun cliente ancora' : lang === 'en' ? 'No customers yet' : 'Sin clientes aún')
              : (lang === 'it' ? 'Nessun risultato' : lang === 'en' ? 'No results' : 'Sin resultados')}
          </h3>
          <p className="text-slate-400 font-medium text-sm">
            {clientes.length === 0
              ? (lang === 'it' ? 'I clienti appariranno qui dopo il primo ordine.' : lang === 'en' ? 'Customers will appear here after the first order.' : 'Los clientes aparecerán aquí tras el primer pedido.')
              : (lang === 'it' ? 'Prova con un\'altra ricerca.' : lang === 'en' ? 'Try a different search.' : 'Intenta con otra búsqueda.')}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 px-8 py-4 border-b border-slate-50 bg-slate-50/60">
            <span className="col-span-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {lang === 'it' ? 'Cliente' : lang === 'en' ? 'Customer' : 'Cliente'}
            </span>
            <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {lang === 'it' ? 'Pedidos' : lang === 'en' ? 'Orders' : 'Pedidos'}
            </span>
            <span className="col-span-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {lang === 'it' ? 'Totale speso' : lang === 'en' ? 'Total spent' : 'Total gastado'}
            </span>
            <span className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {lang === 'it' ? 'Tipo' : lang === 'en' ? 'Type' : 'Tipo'}
            </span>
            <span className="col-span-1" />
          </div>

          <div className="divide-y divide-slate-50">
            {filtered.map((c, idx) => {
              const tag = getTag(c.totalGastado, c.pedidos.length)
              const fechaUltimo = c.ultimoPedido
                ? new Date(c.ultimoPedido).toLocaleDateString(
                    lang === 'it' ? 'it-IT' : lang === 'en' ? 'en-GB' : 'es-ES',
                    { day: '2-digit', month: 'short', year: 'numeric' }
                  )
                : '—'

              return (
                <button
                  key={idx}
                  onClick={() => setSelected(selected?.nombre === c.nombre ? null : c)}
                  className="w-full text-left px-8 py-5 hover:bg-blue-50/30 transition-all group"
                >
                  {/* Mobile layout */}
                  <div className="md:hidden flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-600 text-sm">
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{c.nombre}</p>
                        <p className="text-xs text-slate-400">{c.pedidos.length} pedidos · €{c.totalGastado.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${tag.color}`}>
                      {tag.label}
                    </span>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-12 items-center">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-600 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-700 transition-all">
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{c.nombre}</p>
                        {c.whatsapp && (
                          <p className="text-xs text-slate-400 font-mono">{c.whatsapp}</p>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="font-black text-slate-800">{c.pedidos.length}</span>
                      <span className="text-slate-400 text-sm ml-1">
                        {c.pedidos.length === 1
                          ? (lang === 'it' ? 'ordine' : lang === 'en' ? 'order' : 'pedido')
                          : (lang === 'it' ? 'ordini' : lang === 'en' ? 'orders' : 'pedidos')}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <span className="font-black text-slate-800">€{c.totalGastado.toFixed(2)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${tag.color}`}>
                        {tag.label}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {selected?.nombre === c.nombre && (
                    <div className="mt-5 pt-5 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Último pedido */}
                        <div className="bg-slate-50 rounded-2xl p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                            <Calendar size={11} /> {lang === 'it' ? 'Ultimo ordine' : lang === 'en' ? 'Last order' : 'Último pedido'}
                          </p>
                          <p className="font-bold text-slate-700">{fechaUltimo}</p>
                        </div>

                        {/* Ticket promedio */}
                        <div className="bg-slate-50 rounded-2xl p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                            <TrendingUp size={11} /> {lang === 'it' ? 'Scontrino medio' : lang === 'en' ? 'Avg. ticket' : 'Ticket promedio'}
                          </p>
                          <p className="font-bold text-slate-700">
                            €{(c.totalGastado / c.pedidos.length).toFixed(2)}
                          </p>
                        </div>

                        {/* WhatsApp */}
                        <div className="bg-slate-50 rounded-2xl p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                            <Phone size={11} /> WhatsApp
                          </p>
                          {c.whatsapp ? (
                            <a
                              href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${c.nombre}! 👋`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
                            >
                              <MessageCircle size={14} />
                              {lang === 'it' ? 'Scrivi su WhatsApp' : lang === 'en' ? 'Message on WhatsApp' : 'Escribir por WhatsApp'}
                            </a>
                          ) : (
                            <p className="text-sm text-slate-400 font-medium">
                              {lang === 'it' ? 'Non disponibile' : lang === 'en' ? 'Not available' : 'No disponible'}
                            </p>
                          )}
                        </div>

                      </div>

                      {/* Mini historial de pedidos */}
                      <div className="mt-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                          {lang === 'it' ? 'Storico ordini' : lang === 'en' ? 'Order history' : 'Historial de pedidos'}
                        </p>
                        <div className="space-y-2">
                          {c.pedidos.slice(0, 4).map((p, pidx) => (
                            <div key={pidx} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-100">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-slate-400 font-mono">{p.codigo}</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                  p.estado === 'confirmado'
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                    : p.estado === 'cancelado'
                                      ? 'bg-red-50 border-red-100 text-red-500'
                                      : 'bg-amber-50 border-amber-100 text-amber-600'
                                }`}>
                                  {p.estado}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400">
                                  {new Date(p.created_at).toLocaleDateString(
                                    lang === 'it' ? 'it-IT' : lang === 'en' ? 'en-GB' : 'es-ES',
                                    { day: '2-digit', month: 'short' }
                                  )}
                                </span>
                                <span className="font-black text-slate-800 text-sm">€{parseFloat(p.total).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                          {c.pedidos.length > 4 && (
                            <p className="text-xs text-slate-400 font-bold text-center py-1">
                              +{c.pedidos.length - 4} {lang === 'it' ? 'ordini precedenti' : lang === 'en' ? 'more orders' : 'pedidos más'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
