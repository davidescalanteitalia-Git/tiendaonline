'use client'

import { useState, useEffect } from 'react'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'
import { 
  Search, 
  Filter, 
  ArrowUpToLine, 
  Download, 
  Plus, 
  Star, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  CreditCard, 
  Truck, 
  MapPin, 
  Calendar, 
  User, 
  ExternalLink,
  MessageSquare,
  TrendingUp,
  Package,
  ChevronRight,
  MoreVertical,
  X
} from 'lucide-react'

export default function PedidosPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']

  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todos') // todos, pendiente, confirmado, cancelado
  const [selectedPedido, setSelectedPedido] = useState(null)
  
  const [stats, setStats] = useState({
    todaySales: 0,
    pendingCount: 0,
    totalOrders: 0
  })

  useEffect(() => {
    fetchPedidos()
  }, [])

  useEffect(() => {
    if (pedidos.length > 0) {
      calculateStats(pedidos)
    }
  }, [pedidos])

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

  const calculateStats = (data) => {
    const today = new Date().toISOString().split('T')[0]
    const todayPedidos = data.filter(p => p.created_at.startsWith(today))
    
    setStats({
      todaySales: todayPedidos.reduce((acc, p) => acc + parseFloat(p.total), 0),
      pendingCount: data.filter(p => p.estado === 'pendiente').length,
      totalOrders: data.length
    })
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
        if (selectedPedido?.id === id) {
           setSelectedPedido(prev => ({ ...prev, estado: nuevoEstado }))
        }
      }
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const sendWhatsappReminder = (p) => {
    const meta = getMetadata(p.items)
    const phone = meta.whatsapp
    if (!phone) {
      alert('No hay un número de WhatsApp registrado para este pedido.')
      return
    }

    const message = `Hola *${p.cliente_nombre}*! Te escribimos de *Tu Tienda* sobre tu pedido *${p.codigo}*.%0A%0AQueríamos coordinar los detalles de la entrega. El total es *€${parseFloat(p.total).toFixed(2)}*.%0A%0A¿Cómo podemos ayudarte?`
    window.open(`https://wa.me/${phone.replace(/\+/g, '').replace(/\s/g, '')}?text=${message}`, '_blank')
  }

  const deletePedido = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este pedido?')) return;
    try {
        setPedidos(prev => prev.filter(p => p.id !== id))
        // API call...
    } catch (err) {}
  }

  const filteredPedidos = pedidos.filter(p => {
    const matchesSearch = p.cliente_nombre.toLowerCase().includes(search.toLowerCase()) || 
                          p.codigo.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'todos' || p.estado === filter
    return matchesSearch && matchesFilter
  })

  const getMetadata = (items) => {
    return items.find(i => i.id === 'ORDER_META') || {}
  }

  const getOrderItems = (items) => {
    return items.filter(i => i.id !== 'ORDER_META')
  }

  // Format Helpers
  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(lang === 'es' ? 'es-AR' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  const getStatusUI = (status) => {
    switch (status) {
      case 'confirmado':
        return { label: dict.estadoConfirmado, color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' }
      case 'cancelado':
        return { label: dict.estadoCancelado, color: 'text-slate-500', bg: 'bg-slate-100', dot: 'bg-slate-400' }
      default:
        return { label: dict.estadoPendiente, color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' }
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans text-slate-900 pb-20">
      
      {/* 1. Header & Stats Area */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
              {dict.pedidosAbiertos || 'Pedidos'}
            </h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <Package size={16} /> {stats.totalOrders} órdenes en total
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95">
             <Plus size={20} /> Nuevo Pedido
          </button>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                 <TrendingUp size={28} />
              </div>
              <div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Ventas de Hoy</p>
                 <h3 className="text-2xl font-black text-slate-800">€{stats.todaySales.toFixed(2)}</h3>
              </div>
           </div>
           
           <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                 <Clock size={28} />
              </div>
              <div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Por Confirmar</p>
                 <h3 className="text-2xl font-black text-slate-800">{stats.pendingCount} pedidos</h3>
              </div>
           </div>

           <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                 <Star size={28} />
              </div>
              <div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Meta Mensual</p>
                 <h3 className="text-2xl font-black text-slate-800">85% completado</h3>
              </div>
           </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          
          {/* Action Bar */}
          <div className="p-8 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="relative group max-w-md w-full">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
               <input 
                 type="text" 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 placeholder="Buscar por código o nombre..."
                 className="w-full pl-12 pr-4 py-4 bg-slate-50 border-transparent border-2 focus:border-blue-100 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-700"
               />
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
               {['todos', 'pendiente', 'confirmado', 'cancelado'].map(f => (
                 <button 
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                 >
                   {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
                 </button>
               ))}
               <div className="w-px h-8 bg-slate-200 mx-2 hidden lg:block"></div>
               <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                  <Download size={20} />
               </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-5">Orden e Info</th>
                      <th className="px-6 py-5">Fecha</th>
                      <th className="px-6 py-5">Items</th>
                      <th className="px-6 py-5">Total</th>
                      <th className="px-6 py-5">Estado</th>
                      <th className="px-8 py-5 text-right font-sans">Acciones</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {loading ? (
                     <tr>
                        <td colSpan="6" className="py-20 text-center">
                           <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                        </td>
                     </tr>
                   ) : filteredPedidos.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-20 text-center text-slate-400 font-medium">
                           No se encontraron pedidos
                        </td>
                      </tr>
                   ) : filteredPedidos.map((p) => {
                     const meta = getMetadata(p.items);
                     const ui = getStatusUI(p.estado);
                     return (
                      <tr 
                        key={p.id} 
                        onClick={() => setSelectedPedido(p)}
                        className="hover:bg-blue-50/30 transition-all cursor-pointer group"
                      >
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-xs shadow-sm group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-600 transition-all">
                                  {p.codigo.startsWith('#') ? p.codigo.slice(1,3) : p.codigo.slice(0,2)}
                               </div>
                               <div>
                                  <h4 className="font-bold text-slate-800 mb-0.5">{p.cliente_nombre}</h4>
                                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                     <span className="text-blue-500">{p.codigo}</span>
                                     <span className="opacity-30">•</span>
                                     <span className="flex items-center gap-1">
                                        {meta.metodo_pago === 'transferencia' ? <CreditCard size={10} /> : <CreditCard size={10} className="opacity-50" />}
                                        {meta.metodo_pago || 'Pago offline'}
                                     </span>
                                  </div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <div className="flex flex-col">
                               <span className="text-sm font-bold text-slate-700">{formatDate(p.created_at).split(' - ')[0]}</span>
                               <span className="text-[10px] font-medium text-slate-400">{formatDate(p.created_at).split(' - ')[1]}</span>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <div className="flex items-center gap-1 text-sm font-bold text-slate-600">
                               <Package size={14} className="text-slate-400" />
                               {getOrderItems(p.items).length}
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <span className="text-sm font-black text-slate-800">€{parseFloat(p.total).toFixed(2)}</span>
                         </td>
                         <td className="px-6 py-6">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${ui.bg} ${ui.color}`}>
                               <span className={`w-1.5 h-1.5 rounded-full ${ui.dot}`}></span>
                               {ui.label}
                            </div>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                               {p.estado === 'pendiente' && (
                                 <button onClick={(e) => { e.stopPropagation(); updateStatus(p.id, 'confirmado'); }} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg">
                                    <CheckCircle2 size={18} />
                                 </button>
                               )}
                               <button onClick={(e) => { e.stopPropagation(); deletePedido(p.id); }} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                                  <Trash2 size={18} />
                               </button>
                               <ChevronRight size={18} className="text-slate-300 ml-2" />
                            </div>
                         </td>
                      </tr>
                     )
                   })}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* 3. Detail Slide-over */}
      {selectedPedido && (
        <div className="fixed inset-0 z-50 flex justify-end">
           {/* Overlay */}
           <div 
             className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
             onClick={() => setSelectedPedido(null)}
           />
           
           {/* Panel */}
           <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Header */}
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                 <div>
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Detalle de Orden</div>
                    <h2 className="text-2xl font-black text-slate-800">{selectedPedido.codigo}</h2>
                 </div>
                 <button onClick={() => setSelectedPedido(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                    <X size={24} />
                 </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-8 bg-[#FDFDFF]">
                 
                 {/* Status Section */}
                 <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-8">
                    <div className="flex items-center justify-between mb-6">
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Estado Actual</span>
                       {(() => {
                          const ui = getStatusUI(selectedPedido.estado);
                          return (
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${ui.bg} ${ui.color}`}>
                               {ui.label}
                            </div>
                          )
                       })()}
                    </div>
                    <div className="flex gap-2">
                       {selectedPedido.estado === 'pendiente' && (
                        <button 
                          onClick={() => updateStatus(selectedPedido.id, 'confirmado')}
                          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                        >
                           <CheckCircle2 size={16} /> Confirmar Pago
                        </button>
                       )}
                       {selectedPedido.estado !== 'cancelado' && (
                        <button 
                          onClick={() => updateStatus(selectedPedido.id, 'cancelado')}
                          className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-bold text-sm transition-all"
                        >
                           Cancelar
                        </button>
                       )}
                    </div>
                 </div>

                 {/* Client & Info */}
                 <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                          <User size={20} />
                       </div>
                       <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Cliente</p>
                       <p className="font-bold text-slate-800 truncate">{selectedPedido.cliente_nombre}</p>
                    </div>
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                       <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                          <Calendar size={20} />
                       </div>
                       <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Fecha</p>
                       <p className="font-bold text-slate-800 text-sm">{formatDate(selectedPedido.created_at)}</p>
                    </div>
                 </div>

                 {/* Operational Meta */}
                 {(() => {
                    const meta = getMetadata(selectedPedido.items);
                    return (
                      <div className="bg-slate-900 rounded-[32px] p-8 text-white mb-8 shadow-xl shadow-slate-200">
                         <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Detalles de Entrega y Pago</h3>
                         
                         <div className="space-y-6">
                            <div className="flex gap-4">
                               <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                                  <Truck size={20} className="text-blue-400" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black text-slate-500 uppercase">Método de Envío</p>
                                  <p className="font-bold text-sm">{meta.metodo_envio === 'domicilio' ? 'Envío a Domicilio' : 'Retiro en Local'}</p>
                                  {meta.direccion && <p className="text-xs text-slate-400 mt-1">{meta.direccion}</p>}
                               </div>
                            </div>

                            <div className="flex gap-4">
                               <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                                  <CreditCard size={20} className="text-emerald-400" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black text-slate-500 uppercase">Método de Pago</p>
                                  <p className="font-bold text-sm">{meta.metodo_pago === 'transferencia' ? 'Transferencia Bancaria' : 'Efectivo / Contra-entrega'}</p>
                                  <p className="text-xs text-slate-400 mt-1">Total a cobrar: €{parseFloat(selectedPedido.total).toFixed(2)}</p>
                               </div>
                            </div>
                         </div>

                         {/* Quick link button */}
                         <button 
                           onClick={() => sendWhatsappReminder(selectedPedido)}
                           className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm transition-all active:scale-95"
                         >
                            <MessageSquare size={18} /> Chat con cliente
                         </button>
                      </div>
                    )
                 })()}

                 {/* Products List */}
                 <div className="mb-8 text-left">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Productos ({getOrderItems(selectedPedido.items).length})</h3>
                    <div className="space-y-3">
                       {getOrderItems(selectedPedido.items).map((item, idx) => (
                         <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                               {item.emoji || '📦'}
                            </div>
                            <div className="flex-1">
                               <p className="font-bold text-slate-800 text-sm leading-tight">{item.nombre}</p>
                               <p className="text-[11px] text-slate-400 font-medium">{item.quantity} unidades × €{parseFloat(item.price || item.precio).toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                               <p className="font-black text-slate-800 text-sm">€{(item.quantity * parseFloat(item.price || item.precio)).toFixed(2)}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

              </div>

              {/* Footer */}
              <div className="p-8 border-t border-slate-100 bg-white shadow-2xl">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 font-bold">Subtotal Productos</span>
                    <span className="text-slate-800 font-bold">€{(parseFloat(selectedPedido.total) - (getMetadata(selectedPedido.items).shipping_cost || 0)).toFixed(2)}</span>
                 </div>
                 <div className="flex items-center justify-between mb-6">
                    <span className="text-slate-400 font-bold">Costo de Envío</span>
                    <span className="text-emerald-500 font-bold">+€{(getMetadata(selectedPedido.items).shipping_cost || 0).toFixed(2)}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-slate-800">Total Orden</span>
                    <span className="text-2xl font-black text-blue-600">€{parseFloat(selectedPedido.total).toFixed(2)}</span>
                 </div>
              </div>

           </div>
        </div>
      )}

      {/* Global CSS for scrollbars and animations */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-in { animation-duration: 0.3s; animation-fill-mode: both; }
        .slide-in-from-right { animation-name: slideInRight; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  )
}
