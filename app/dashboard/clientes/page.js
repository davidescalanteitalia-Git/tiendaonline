'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Plus,
  CreditCard,
  Phone,
  Mail,
  Loader2,
  X,
  CheckCircle2,
  ArrowRight,
  User as UserIcon,
  ShoppingBag
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  const [showModal, setShowModal] = useState(false)
  const [showAbonoModal, setShowAbonoModal] = useState(null)
  
  const [formData, setFormData] = useState({ nombre: '', telefono: '', email: '' })
  const [abono, setAbono] = useState('')
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    loadClientes()
  }, [])

  async function loadClientes() {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/clientes', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      if (res.ok) {
        setClientes(await res.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const showError = (msg) => {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(null), 3000)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Error al guardar cliente')
      
      setSuccessMsg('Cliente registrado')
      setShowModal(false)
      setFormData({ nombre: '', telefono: '', email: '' })
      loadClientes()
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      showError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAbono = async (e) => {
    e.preventDefault()
    if (!abono || parseFloat(abono) <= 0) return

    setIsProcessing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id: showAbonoModal.id, abono: parseFloat(abono) })
      })

      if (!res.ok) throw new Error('Error al procesar abono')
      
      setSuccessMsg('Abono registrado con éxito')
      setShowAbonoModal(null)
      setAbono('')
      loadClientes()
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      showError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const filtered = clientes.filter(c => 
    c.nombre.toLowerCase().includes(search.toLowerCase()) || 
    (c.telefono && c.telefono.includes(search))
  )

  const deudoresCount = clientes.filter(c => parseFloat(c.deuda_actual) > 0).length
  const deudaTotal = clientes.reduce((acc, c) => acc + parseFloat(c.deuda_actual || 0), 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Toasts */}
      {errorMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <X size={18} /> <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={18} /> <span className="text-sm font-bold">{successMsg}</span>
        </div>
      )}

      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Clientes y Fiados</h1>
          <p className="text-slate-500 font-medium">Gestiona tu cartera de clientes y cuentas corrientes</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
           <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex-1 md:w-48 shadow-sm">
             <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">Deuda Pendiente</p>
             <p className="text-2xl font-black text-amber-700">€{deudaTotal.toFixed(2)}</p>
           </div>
           <button 
            onClick={() => setShowModal(true)}
            className="flex-1 md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus size={20} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o teléfono..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl outline-none border border-slate-200 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
          />
        </div>
        
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
           <Users size={16} /> {clientes.length} Totales <span className="mx-2 text-slate-300">|</span> <CreditCard size={16} className="text-amber-500" /> {deudoresCount} Fiados
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex flex-col justify-center items-center gap-4 text-slate-400">
          <Loader2 className="animate-spin text-blue-500" size={40} />
          <p className="font-bold">Cargando clientes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 flex flex-col justify-center items-center gap-4 text-slate-400 bg-white rounded-3xl border border-slate-200 border-dashed">
          <Users size={48} className="opacity-20" />
          <p className="font-bold">No se encontraron clientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(c => {
             const deuda = parseFloat(c.deuda_actual || 0)
             const hasDeuda = deuda > 0
             return (
              <div key={c.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:shadow-md transition-shadow">
                
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${hasDeuda ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                    {c.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">{c.nombre}</h3>
                    <div className="flex gap-3 text-sm text-slate-500 font-medium mt-1">
                       {c.telefono && <span className="flex items-center gap-1"><Phone size={12} /> {c.telefono}</span>}
                       {c.email && <span className="flex items-center gap-1"><Mail size={12} /> {c.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto gap-6 bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-xl">
                  <div className="text-left md:text-right">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Deuda Pendiente</p>
                     <p className={`text-xl font-black ${hasDeuda ? 'text-amber-600' : 'text-slate-300'}`}>€{deuda.toFixed(2)}</p>
                  </div>
                  {hasDeuda && (
                     <button 
                       onClick={() => {
                          setAbono(deuda.toString()) // Por defecto prerellena el total de la deuda
                          setShowAbonoModal(c)
                       }}
                       className="bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
                     >
                       Abonar
                     </button>
                  )}
                </div>

              </div>
             )
          })}
        </div>
      )}

      {/* New Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h2 className="text-xl font-black text-slate-900">Nuevo Cliente</h2>
               <button onClick={() => setShowModal(false)} className="w-8 h-8 flex justify-center items-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all">
                 <X size={16} />
               </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre Completo *</label>
                  <input required type="text" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium transition-all" placeholder="Ej. Juan Pérez" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Teléfono</label>
                  <input type="tel" value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium transition-all" placeholder="+34 600 000 000" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                  <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium transition-all" placeholder="cliente@email.com" />
               </div>
               
               <button type="submit" disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-6 flex justify-center items-center gap-2 transition-all">
                  {isProcessing ? <Loader2 size={20} className="animate-spin" /> : 'Guardar Cliente'}
               </button>
            </form>
          </div>
        </div>
      )}

      {/* Abono Modal */}
      {showAbonoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 relative">
            
            <button onClick={() => setShowAbonoModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 z-10 p-2">
               <X size={20} />
            </button>
            
            <div className="p-8 text-center pb-4">
               <div className="w-16 h-16 bg-amber-100 text-amber-500 flex items-center justify-center rounded-2xl mx-auto mb-4 rotate-12">
                  <CreditCard size={32} />
               </div>
               <h2 className="text-2xl font-black text-slate-900 mb-1">Registrar Abono</h2>
               <p className="text-slate-500 font-medium text-sm">Cliente: <span className="font-bold text-slate-800">{showAbonoModal.nombre}</span></p>
               <div className="mt-4 bg-slate-50 rounded-xl py-3 border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Deuda Restante</p>
                  <p className="text-xl font-black text-slate-800">€{parseFloat(showAbonoModal.deuda_actual).toFixed(2)}</p>
               </div>
            </div>

            <form onSubmit={handleAbono} className="p-6 pt-0 space-y-4">
               <div className="relative">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Monto a Abonar (€)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    max={showAbonoModal.deuda_actual}
                    value={abono} 
                    onChange={e => setAbono(e.target.value)} 
                    className="w-full text-center text-3xl px-4 py-4 bg-slate-50 border-2 border-amber-200 focus:border-amber-500 rounded-2xl outline-none font-black text-amber-700 transition-all font-mono shadow-inner mb-2" 
                    autoFocus
                  />
               </div>
               
               <button type="submit" disabled={isProcessing} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl mt-4 flex justify-center items-center gap-2 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                  {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <>Confirmar Pago <ArrowRight size={18} /></>}
               </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
