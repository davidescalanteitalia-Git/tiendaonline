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
  FolderTree
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { getDictionary } from '../../../lib/dictionaries'

export default function ComprasPage() {
  const [productos, setProductos] = useState([])
  const [compras, setCompras] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dict, setDict] = useState({})
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
  

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const d = await getDictionary(session?.user?.id)
      setDict(d)

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

  async function handleSaveCompra(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      let pId = productoId

      // 1. If it's a new product, create it first
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
            stock: 0 // Will be updated by the purchase
          })
        })
        if (!prodRes.ok) throw new Error('Error creating product')
        const newProd = await prodRes.json()
        pId = newProd[0].id
      }

      // 2. Record the purchase
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
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateCat = async () => {
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
        body: JSON.stringify({ nombre: newCatName })
      })
      if (res.ok) {
        const newCat = await res.json()
        setCategorias([...categorias, newCat])
        setNewCategoriaId(newCat.id)
        setShowCatInput(false)
        setNewCatName('')
      }
    } catch (err) {
      console.error('Error creating category:', err)
    } finally {
      setCreatingCat(false)
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <span className="text-slate-400 font-bold tracking-widest uppercase text-xs">Caricamento...</span>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <ShoppingBag className="text-primary" size={32} />
            {dict.compras || 'Compras'}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {dict.registroCompras || 'Registra tus nuevas adquisiciones y controla el stock.'}
          </p>
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
        >
          <Plus size={20} />
          {dict.nuevaCompra || 'Nueva Compra'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
            <History size={24} />
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{dict.compras || 'Compras'}</div>
          <div className="text-3xl font-black text-slate-800 mt-1">{compras.length}</div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
            <DollarSign size={24} />
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{dict.total || 'Inversión Total'}</div>
          <div className="text-3xl font-black text-slate-800 mt-1">
            €{compras.reduce((acc, c) => acc + (parseFloat(c.costo) * c.cantidad), 0).toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
            <Package size={24} />
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{dict.cantidad || 'Unidades'}</div>
          <div className="text-3xl font-black text-slate-800 mt-1">
            {compras.reduce((acc, c) => acc + c.cantidad, 0)}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <History size={20} className="text-slate-400" />
            {dict.registroCompras || 'Historial de Compras'}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{dict.producto || 'Producto'}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{dict.cantidad || 'Cantidad'}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{dict.costo || 'Costo Unit.'}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{dict.fechaVencimiento || 'Vencimiento'}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{dict.fecha || 'Fecha'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {compras.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <ShoppingBag size={40} />
                      </div>
                      <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                        {dict.sinCompras || 'No hay compras registradas'}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                compras.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold">
                          {c.productos?.nombre?.charAt(0) || 'P'}
                        </div>
                        <span className="font-bold text-slate-700">{c.productos?.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-black text-slate-600">
                        x{c.cantidad}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800">€{parseFloat(c.costo).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${c.fecha_vencimiento ? 'text-amber-600' : 'text-slate-300 italic'}`}>
                        {c.fecha_vencimiento || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-400">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowForm(false)}></div>
          
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                  <ShoppingBag size={28} className="text-primary" />
                  {dict.nuevaCompra || 'Nueva Compra'}
                </h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
                  {dict.completaDetalles || 'Completa los detalles para continuar'}
                </p>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-95"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveCompra} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest italic">{dict.producto || 'Producto'}</span>
                  <button 
                    type="button" 
                    onClick={() => setIsNewProduct(!isNewProduct)}
                    className={`text-xs font-bold px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                      isNewProduct ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {isNewProduct ? <X size={12}/> : <PlusCircle size={12}/>}
                    {isNewProduct ? dict.cancelar || 'Cancelar' : dict.productoNuevo || '¿Producto Nuevo?'}
                  </button>
                </div>

                {!isNewProduct ? (
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                      <Search size={20} />
                    </div>
                    <select 
                      required
                      value={productoId}
                      onChange={(e) => setProductoId(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-slate-50/50 appearance-none font-bold text-slate-700"
                    >
                      <option value="">{dict.seleccionaProducto || 'Seleccionar un producto...'}</option>
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock})</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                      <Plus size={20} />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-slate-700">{dict.nombreProducto}</label>
                       <input 
                         required
                         type="text"
                         value={newNombre}
                         onChange={(e) => setNewNombre(e.target.value)}
                         className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                         placeholder="Ej: Coca Cola, Pizza Margherita..."
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">{dict.precioProducto}</label>
                        <input 
                          required
                          type="number"
                          step="0.01"
                          value={newPrecio}
                          onChange={(e) => setNewPrecio(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-slate-700">{dict.categoriaProducto}</label>
                          <button 
                            type="button" 
                            onClick={() => setShowCatInput(!showCatInput)}
                            className="text-xs font-bold text-primary hover:underline"
                          >
                            {showCatInput ? dict.cerrar : `+ ${dict.nuevaCategoria}`}
                          </button>
                        </div>
                        
                        {showCatInput ? (
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={newCatName}
                              onChange={(e) => setNewCatName(e.target.value)}
                              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                              placeholder="Nueva categoría..."
                            />
                            <button 
                              type="button"
                              onClick={handleCreateCat}
                              disabled={creatingCat}
                              className="bg-primary text-white p-2 rounded-lg disabled:opacity-50"
                            >
                              {creatingCat ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            </button>
                          </div>
                        ) : (
                          <select 
                            value={newCategoriaId}
                            onChange={(e) => setNewCategoriaId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-primary/10 transition-all bg-white"
                          >
                            <option value="">{dict.sinCategoria}</option>
                            {categorias.map(c => (
                              <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Hash size={16} className="text-slate-400" />
                    {dict.cantidadComprada || 'Cantidad comprada'}
                  </label>
                  <input 
                    required
                    type="number"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-black text-xl text-center"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <DollarSign size={16} className="text-slate-400" />
                    {dict.costoProducto || 'Costo de compra (Unit)'}
                  </label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    value={costo}
                    onChange={(e) => setCosto(e.target.value)}
                    className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-black text-xl text-center text-emerald-600"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  {dict.fechaVencimiento || 'Vencimiento'}
                </label>
                <input 
                  type="date"
                  value={vencimiento}
                  onChange={(e) => setVencimiento(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                />
              </div>

              <div className="pt-4">
                <button 
                  disabled={saving}
                  className="w-full bg-slate-900 border-2 border-slate-900 hover:bg-white hover:text-slate-900 text-white py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 shadow-2xl shadow-slate-900/10"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Save size={24} />
                      {dict.salvare || 'Registrar Compra'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
