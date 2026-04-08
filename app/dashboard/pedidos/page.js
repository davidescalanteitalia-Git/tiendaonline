'use client'

import { useState, useEffect } from 'react'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'
import { Search, Filter, FolderClosed, ArrowUpToLine, Download, Plus, Star, Trash2, CheckCircle2, Clock, XCircle } from 'lucide-react'

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

  const deletePedido = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este pedido?')) return;
    try {
        setPedidos(prev => prev.filter(p => p.id !== id))
        // API call to delete could go here if implemented
    } catch (err) {}
  }

  const filteredPedidos = pedidos.filter(p => {
    const matchesSearch = p.cliente_nombre.toLowerCase().includes(search.toLowerCase()) || 
                          p.codigo.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'todos' || p.estado === filter
    return matchesSearch && matchesFilter
  })

  // Format Helpers
  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} - ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmado':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {dict.estadoConfirmado}
        </span>
      case 'cancelado':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span> {dict.estadoCancelado}
        </span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span> {dict.estadoPendiente}
        </span>
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 font-sans">
      
      {/* Kyte-style Header */}
      <div className="flex flex-col md:flex-row md:items-baseline gap-3 mb-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{dict.pedidosAbiertos || 'Pedidos'}</h1>
        <span className="text-slate-500 font-medium text-sm">{pedidos.length} {dict.pedidosRegistrados || 'pedidos registrados'}</span>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 p-2 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="flex-1 max-w-sm pl-2">
          <div className="relative w-full group">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Código o cliente"
              className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 font-medium text-slate-700"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pr-1">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setFilter(filter === 'todos' ? 'pendiente' : 'todos')}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors ${filter !== 'todos' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600'}`}
            >
              <Filter size={16}/> Filtro
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <FolderClosed size={16}/> Estados
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <ArrowUpToLine size={16}/> Exportar
            </button>
          </div>
          
          <div className="hidden lg:block w-px h-6 bg-slate-200 mx-1"></div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-emerald-500 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors" title="Descargar reporte">
              <Download size={18}/>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-emerald-400 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm">
              <Plus size={18}/> Nuevo Pedido
            </button>
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="text-slate-500 text-xs font-bold border-b border-slate-200 bg-white">
                <th className="px-4 py-4 w-12 text-center"><input type="checkbox" className="rounded text-emerald-500 focus:ring-emerald-500" /></th>
                <th className="px-2 py-4 w-10 text-center"><Star size={16} className="text-slate-300 mx-auto" /></th>
                <th className="px-4 py-4 cursor-pointer hover:bg-slate-50 transition-colors">{dict.cliente} ↑</th>
                <th className="px-4 py-4">{dict.fecha}</th>
                <th className="px-4 py-4">{dict.items}</th>
                <th className="px-4 py-4">{dict.total}</th>
                <th className="px-4 py-4">{dict.estado}</th>
                <th className="px-4 py-4 w-16 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-16 text-center">
                    <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredPedidos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-16 text-center text-slate-500 font-medium">
                    {dict.sinPedidos || 'No hay pedidos con esos criterios.'}
                  </td>
                </tr>
              ) : (
                filteredPedidos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-4 text-center">
                      <input type="checkbox" className="rounded text-emerald-500 border-slate-300 focus:ring-emerald-500 cursor-pointer" />
                    </td>
                    <td className="px-2 py-4 text-center cursor-pointer">
                      <Star size={18} className={p.estado === 'pendiente' ? 'text-amber-400 fill-amber-400 mx-auto' : 'text-slate-300 mx-auto hover:text-amber-400 transition-colors'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar/Thumbnail fake */}
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-sm shrink-0">
                          {p.cliente_nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{p.cliente_nombre}</span>
                          <span className="text-[11px] text-slate-500">Cód.: {p.codigo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600 font-medium tracking-wide uppercase text-[11px]">{formatDate(p.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-600">{p.items?.length || 0} unid.</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-slate-700">€{parseFloat(p.total).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(p.estado)}
                        {/* Quick toggle action for status */}
                        {p.estado === 'pendiente' && (
                           <button onClick={() => updateStatus(p.id, 'confirmado')} className="text-emerald-600 hover:bg-emerald-100 p-1 rounded-md transition-colors" title={dict.confirmaPedido}>
                             <CheckCircle2 size={16} />
                           </button>
                        )}
                        {p.estado === 'pendiente' && (
                           <button onClick={() => updateStatus(p.id, 'cancelado')} className="text-slate-400 hover:bg-slate-200 p-1 rounded-md transition-colors" title={dict.cancelaPedido}>
                             <XCircle size={16} />
                           </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => deletePedido(p.id)}
                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
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

