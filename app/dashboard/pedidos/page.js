'use client'

import { useState, useEffect } from 'react'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'
import { ShoppingCart, Search, Filter, Clock, CheckCircle2, XCircle, MoreVertical, Package, User, Calendar, Euro } from 'lucide-react'

export default function PedidosPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']

  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todos') // todos, pendiente, confirmado, cancelado

  useEffect(() => {
    fetchPedidos()
  }, [])

  const fetchPedidos = async () => {
    try {
      const token = localStorage.getItem('supabase_token')
      const res = await fetch('/api/pedidos', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.pedidos) setPedidos(data.pedidos)
    } catch (err) {
      console.error('Error fetching pedidos:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, nuevoEstado) => {
    try {
      const token = localStorage.getItem('supabase_token')
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      })
      const data = await res.json()
      if (data.success) {
        setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p))
      }
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const filteredPedidos = pedidos.filter(p => {
    const matchesSearch = p.cliente_nombre.toLowerCase().includes(search.toLowerCase()) || 
                          p.codigo.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'todos' || p.estado === filter
    return matchesSearch && matchesFilter
  })

  // Stats
  const stats = {
    total: pedidos.length,
    pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    confirmados: pedidos.filter(p => p.estado === 'confirmado').length,
    cancelados: pedidos.filter(p => p.estado === 'cancelado').length
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmado':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
          <CheckCircle2 size={12} /> {dict.estadoConfirmado}
        </span>
      case 'cancelado':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
          <XCircle size={12} /> {dict.estadoCancelado}
        </span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
          <Clock size={12} /> {dict.estadoPendiente}
        </span>
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1200px] mx-auto p-4 md:p-8">
      {/* Header & Stats */}
      <div className="flex flex-col gap-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <span className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                <ShoppingCart size={32} />
              </span>
              {stats.total} {dict.pedidosAbiertos || 'pedidos abiertos'}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">{dict.visualizaYProcesa}</p>
          </div>
          
          <button className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold">
            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">?</span>
            Ayuda
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: dict.totalPedidos, value: stats.total, color: 'primary', icon: Package },
            { label: dict.pedidosPendientes, value: stats.pendientes, color: 'amber', icon: Clock },
            { label: dict.pedidosRealizados, value: stats.confirmados, color: 'emerald', icon: CheckCircle2 },
            { label: dict.pedidosCancelados, value: stats.cancelados, color: 'rose', icon: XCircle },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className={`p-2 w-fit rounded-xl bg-${stat.color}-50 text-${stat.color}-500 mb-4`}>
                <stat.icon size={20} />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black text-slate-800 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Filters Panel */}
        <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row items-center gap-6 bg-white">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dict.buscarPedido}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
              {['todos', 'pendiente', 'confirmado', 'cancelado'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-tight transition-all ${
                    filter === f 
                    ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f === 'todos' ? 'Todos' : dict[`estado${f.charAt(0).toUpperCase() + f.slice(1)}`]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em] border-b border-slate-50">
                <th className="px-8 py-6">{dict.nPedido}</th>
                <th className="px-8 py-6">{dict.fecha}</th>
                <th className="px-8 py-6">{dict.cliente}</th>
                <th className="px-8 py-6 text-center">{dict.items}</th>
                <th className="px-8 py-6">{dict.total}</th>
                <th className="px-8 py-6">{dict.estado}</th>
                <th className="px-8 py-6 text-right">{dict.acciones}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{dict.caricamento}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPedidos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <ShoppingCart size={40} className="text-slate-200" />
                      </div>
                      <p className="text-xl font-bold text-slate-800 mb-2">{dict.sinPedidos}</p>
                      <p className="text-slate-500 font-medium leading-relaxed">{dict.sinPedidosDesc}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPedidos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <Package size={16} />
                        </div>
                        <span className="font-black text-slate-800">{p.codigo}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{new Date(p.created_at).toLocaleDateString()}</span>
                        <span className="text-[11px] text-slate-400 font-bold">{new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 font-bold text-slate-700">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                          {p.cliente_nombre.charAt(0)}
                        </div>
                        {p.cliente_nombre}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[11px] font-black uppercase tracking-tight">
                        {p.items?.length || 0} items
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-black text-slate-800">€{parseFloat(p.total).toFixed(2)}</span>
                    </td>
                    <td className="px-8 py-6">
                      {getStatusBadge(p.estado)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {p.estado === 'pendiente' && (
                          <>
                            <button 
                              onClick={() => updateStatus(p.id, 'confirmado')}
                              className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
                              title={dict.confirmaPedido}
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => updateStatus(p.id, 'cancelado')}
                              className="p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all"
                              title={dict.cancelaPedido}
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
