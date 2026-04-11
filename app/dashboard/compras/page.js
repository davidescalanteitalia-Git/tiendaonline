'use client'

import React, { useState, useEffect } from 'react'
import {
  ShoppingBag,
  Search,
  Plus,
  History,
  DollarSign,
  Calendar,
  Hash,
  Package,
  ArrowRight,
  Loader2,
  AlertCircle,
  Save,
  Trash2,
  X,
  PlusCircle,
  FolderTree,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Boxes,
  CheckCircle2
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'

export default function ComprasPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']

  const [productos, setProductos] = useState([])
  const [compras, setCompras] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // Form state
  const [productoId, setProductoId] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [costo, setCosto] = useState('')
  const [vencimiento, setVencimiento] = useState('')
  
  // New product inline state
  const [isNewProduct, setIsNewProduct] = useState(false)
  const [newNombre, setNewNombre] = useState('')
  const [newPrecio, setNewPrecio] = useState('')
  const [newCategoriaId, setNewCategoriaId] = useState('')
  const [showCatInput, setShowCatInput] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [creatingCat, setCreatingCat] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const [resProd, resComp, resCat] = await Promise.all([
        fetch('/api/productos', { headers: { 'Authorization': `Bearer ${session.access_token}` } }),
        fetch('/api/compras', { headers: { 'Authorization': `Bearer ${session.access_token}` } }),
        fetch('/api/categorias', { headers: { 'Authorization': `Bearer ${session.access_token}` } })
      ])

      if (resProd.ok) setProductos(await resProd.json())
      if (resComp.ok) setCompras(await resComp.json())
      if (resCat.ok) setCategorias(await resCat.json())
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCat() {
    if (!newCatName.trim()) return
    setCreatingCat(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ nombre: newCatName, orden: 0 })
      })
      if (res.ok) {
        const newCat = await res.json()
        const newCatId = Array.isArray(newCat) ? newCat[0]?.id : newCat?.id
        setCategorias(prev => [...prev, { id: newCatId, nombre: newCatName }])
        setNewCategoriaId(newCatId || '')
        setNewCatName('')
        setShowCatInput(false)
      }
    } catch (err) {
      console.error('Error creating category:', err)
    } finally {
      setCreatingCat(false)
    }
  }

  async function handleSaveCompra(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      let pId = productoId

      if (isNewProduct) {
        const prodRes = await fetch('/api/productos', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            nombre: newNombre,
            precio: parseFloat(newPrecio),
            categoria_id: newCategoriaId || null,
            emoji: '📦',
            estado: 'activo',
            stock: 0
          })
        })
        if (!prodRes.ok) throw new Error('Error creating product')
        const newProdResult = await prodRes.json()
        pId = newProdResult[0].id
      }

      const res = await fetch('/api/compras', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          producto_id: pId,
          cantidad: parseInt(cantidad),
          costo: parseFloat(costo),
          fecha_vencimiento: vencimiento
        })
      })

      if (res.ok) {
        setShowForm(false)
        resetForm()
        loadData()
      }
    } catch (err) {
      console.error('Error saving purchase:', err)
      setErrorMsg('Error al guardar compra: ' + err.message)
      setTimeout(() => setErrorMsg(null), 4000)
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setProductoId('')
    setCantidad('')
    setCosto('')
    setVencimiento('')
    setIsNewProduct(false)
    setNewNombre('')
    setNewPrecio('')
    setNewCategoriaId('')
  }

  const filteredCompras = compras.filter(c => 
    c.productos?.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  )

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 font-sans animate-in fade-in duration-500">

      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <X size={18} className="shrink-0" />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <ShoppingBag className="text-blue-600" size={36} /> {dict.compras || 'Inventario'}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">{dict.registroCompras || 'Gestión de entradas de stock y control de costos.'}</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95"
        >
          <Plus size={24} />
          {dict.nuevaCompra || 'Registrar Entrada'}
        </button>
      </div>

      {/* Stats Section with Kyte aesthetic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
         {[
           { label: 'Compras Totales', value: compras.length, icon: History, color: 'bg-blue-50 text-blue-600' },
           { label: 'Inversión Realizada', value: `€${compras.reduce((acc, c) => acc + (parseFloat(c.costo) * c.cantidad), 0).toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
           { label: 'Unidades Recibidas', value: compras.reduce((acc, c) => acc + c.cantidad, 0), icon: Boxes, color: 'bg-amber-50 text-amber-600' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <div className={`${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
                 <stat.icon size={28} />
              </div>
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
           </div>
         ))}
      </div>

      {/* List Section */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden p-8">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <History size={24} className="text-slate-400" /> Historial de Movimientos
            </h2>
            <div className="relative group flex-1 md:max-w-md">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Search size={20} />
               </div>
               <input 
                 type="text"
                 placeholder="Buscar por producto..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium"
               />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-50">
                     <th className="px-4 py-4 text-xs font-black text-slate-400 uppercase tracking-widest italic">Producto</th>
                     <th className="px-4 py-4 text-xs font-black text-slate-400 uppercase tracking-widest italic text-center">Cantidad</th>
                     <th className="px-4 py-4 text-xs font-black text-slate-400 uppercase tracking-widest italic text-center">Costo Unit.</th>
                     <th className="px-4 py-4 text-xs font-black text-slate-400 uppercase tracking-widest italic text-center">Inversión</th>
                     <th className="px-4 py-4 text-xs font-black text-slate-400 uppercase tracking-widest italic text-right">Fecha</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredCompras.length === 0 ? (
                    <tr>
                       <td colSpan="5" className="py-20 text-center">
                          <div className="flex flex-col items-center opacity-30">
                             <Package size={64} className="mb-4" />
                             <p className="font-bold uppercase tracking-widest text-xs">Sin registros que mostrar</p>
                          </div>
                       </td>
                    </tr>
                  ) : (
                    filteredCompras.map((c) => (
                      <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-[14px] flex items-center justify-center text-slate-400 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shadow-sm">
                                 {c.productos?.nombre?.charAt(0) || 'P'}
                              </div>
                              <div className="flex flex-col">
                                 <span className="font-bold text-slate-800 text-base">{c.productos?.nombre}</span>
                                 {c.fecha_vencimiento && (
                                   <span className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1 mt-1">
                                      <Calendar size={10} /> Exp: {c.fecha_vencimiento}
                                   </span>
                                 )}
                              </div>
                           </div>
                        </td>
                        <td className="px-4 py-6 text-center">
                           <span className="px-4 py-1.5 bg-slate-100 rounded-full text-sm font-black text-slate-600 border border-slate-200">
                             x{c.cantidad}
                           </span>
                        </td>
                        <td className="px-4 py-6 text-center font-bold text-slate-500">
                           €{parseFloat(c.costo).toFixed(2)}
                        </td>
                        <td className="px-4 py-6 text-center">
                            <span className="font-black text-emerald-600 text-base leading-none">
                              €{(parseFloat(c.costo) * c.cantidad).toFixed(2)}
                            </span>
                        </td>
                        <td className="px-4 py-6 text-right">
                           <div className="flex flex-col items-end">
                              <span className="text-sm font-bold text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                              <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                        </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Premium Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowForm(false)}></div>
          
          <div className="relative bg-white w-full max-w-3xl rounded-[48px] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
             
             {/* Modal Left Info */}
             <div className="hidden lg:flex w-72 bg-slate-900 p-12 flex-col justify-between text-white">
                <div>
                   <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20">
                      <ShoppingBag size={32} />
                   </div>
                   <h2 className="text-3xl font-black leading-tight mb-4">Nueva Entrada</h2>
                   <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      El stock del producto seleccionado se incrementará automáticamente después de guardar.
                   </p>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                       <CheckCircle2 size={16} /> Cálculo automático
                    </div>
                </div>
             </div>

             {/* Modal Form Area */}
             <form onSubmit={handleSaveCompra} className="flex-1 p-8 md:p-14 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-10 md:hidden">
                   <h2 className="text-2xl font-black">Nueva Entrada</h2>
                   <button type="button" onClick={() => setShowForm(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
                </div>

                <div className="space-y-8">
                   
                   {/* Product Select */}
                   <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Producto a abastecer</label>
                         <button 
                           type="button" 
                           onClick={() => setIsNewProduct(!isNewProduct)}
                           className={`text-[10px] font-black px-4 py-1.5 rounded-full transition-all uppercase tracking-tighter ${
                             isNewProduct ? 'bg-amber-100 text-amber-700' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                           }`}
                         >
                           {isNewProduct ? 'Cerrar Registro' : '¿Producto No Existe?'}
                         </button>
                      </div>

                      {!isNewProduct ? (
                        <div className="relative group">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                              <Boxes size={22} />
                           </div>
                           <select 
                             required
                             value={productoId}
                             onChange={(e) => setProductoId(e.target.value)}
                             className="w-full pl-14 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-700 appearance-none shadow-inner"
                           >
                             <option value="">Selecciona un producto...</option>
                             {productos.map(p => (
                               <option key={p.id} value={p.id}>{p.nombre} (Stock actual: {p.stock})</option>
                             ))}
                           </select>
                           <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                              <ChevronRight size={20} className="rotate-90" />
                           </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-6 animate-in slide-in-from-top-2">
                           <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                              <input 
                                required
                                type="text"
                                value={newNombre}
                                onChange={(e) => setNewNombre(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-bold"
                                placeholder="..."
                              />
                           </div>
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-xs font-bold text-slate-500 uppercase">Precio Venta</label>
                                 <input 
                                   required
                                   type="number"
                                   step="0.01"
                                   value={newPrecio}
                                   onChange={(e) => setNewPrecio(e.target.value)}
                                   className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-black text-blue-600"
                                   placeholder="0.00"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
                                    <button type="button" onClick={() => setShowCatInput(!showCatInput)} className="text-[10px] font-black text-blue-500 uppercase">{showCatInput ? 'Lista' : '+ Nueva'}</button>
                                 </div>
                                 {showCatInput ? (
                                    <div className="flex gap-2">
                                       <input 
                                         type="text"
                                         value={newCatName}
                                         onChange={(e) => setNewCatName(e.target.value)}
                                         className="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-200 bg-white outline-none font-bold"
                                         placeholder="..."
                                       />
                                       <button type="button" onClick={handleCreateCat} disabled={creatingCat} className="bg-slate-900 text-white p-3 rounded-xl disabled:opacity-50"><Save size={16} /></button>
                                    </div>
                                 ) : (
                                    <select 
                                      value={newCategoriaId}
                                      onChange={(e) => setNewCategoriaId(e.target.value)}
                                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white outline-none font-bold text-sm"
                                    >
                                      <option value="">Sin categoría</option>
                                      {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                 )}
                              </div>
                           </div>
                        </div>
                      )}
                   </div>

                   {/* Quantities & Costs */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <PlusCircle size={14} className="text-blue-500" /> Cantidad Entrada
                         </label>
                         <input 
                           required
                           type="number"
                           value={cantidad}
                           onChange={(e) => setCantidad(e.target.value)}
                           className="w-full px-6 py-5 rounded-[24px] border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-black text-2xl text-center shadow-inner"
                           placeholder="0"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <DollarSign size={14} className="text-emerald-500" /> Costo Unitario
                         </label>
                         <input 
                           required
                           type="number"
                           step="0.01"
                           value={costo}
                           onChange={(e) => setCosto(e.target.value)}
                           className="w-full px-6 py-5 rounded-[24px] border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-black text-2xl text-center text-emerald-600 shadow-inner"
                           placeholder="0.00"
                         />
                      </div>
                   </div>

                   {/* Expiry */}
                   <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <Calendar size={14} className="text-amber-500" /> Fecha de Vencimiento
                      </label>
                      <input 
                        type="date"
                        value={vencimiento}
                        onChange={(e) => setVencimiento(e.target.value)}
                        className="w-full px-6 py-5 rounded-[24px] border border-slate-100 bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 shadow-inner"
                      />
                   </div>

                   <div className="pt-6">
                      <button 
                        disabled={saving}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-[30px] font-black text-xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95 shadow-2xl shadow-slate-900/10"
                      >
                        {saving ? <Loader2 className="animate-spin" size={24} /> : (
                          <>
                            <Save size={24} /> Registrar Movimiento
                          </>
                        )}
                      </button>
                   </div>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}

