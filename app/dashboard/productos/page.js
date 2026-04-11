'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Package, Plus, Search, Pencil, Trash2, X, Save, 
  Loader2, Camera, Upload, Image as ImageIcon, 
  Filter, FolderClosed, ArrowUpToLine, Download, 
  Star, Check, LayoutGrid, List, ChevronRight,
  MoreVertical, Eye, EyeOff, Tag
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'

export default function ProductosPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']
  
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // grid | list
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Slide-over state
  const [isSlideOpen, setIsSlideOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // Form state
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [costo, setCosto] = useState('')
  const [emoji, setEmoji] = useState('📦')
  const [categoriaId, setCategoriaId] = useState('')
  const [estado, setEstado] = useState('activo')
  const [imagenUrl, setImagenUrl] = useState('')
  const [stock, setStock] = useState('0')
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const headers = { 'Authorization': `Bearer ${session.access_token}` }
      const [resProd, resCat] = await Promise.all([
        fetch('/api/productos', { headers }),
        fetch('/api/categorias', { headers })
      ])

      const prodData = await resProd.json()
      const catData = await resCat.json()

      setProductos(Array.isArray(prodData) ? prodData : [])
      setCategorias(Array.isArray(catData) ? catData : [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const MAX = 800
          let w = img.width
          let h = img.height
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * MAX / w); w = MAX }
            else        { w = Math.round(w * MAX / h); h = MAX }
          }
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          canvas.getContext('2d').drawImage(img, 0, 0, w, h)
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.jpg`
      const filePath = `product-images/${fileName}`
      const { error } = await supabase.storage.from('productos').upload(filePath, compressed, { contentType: 'image/jpeg' })
      if (error) throw error
      const { data } = supabase.storage.from('productos').getPublicUrl(filePath)
      setImagenUrl(data.publicUrl)
    } catch (error) {
      setErrorMsg('Error al subir imagen: ' + error.message)
      setTimeout(() => setErrorMsg(null), 4000)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e) {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const body = { 
        nombre, descripcion, precio: parseFloat(precio) || 0, costo: parseFloat(costo) || 0, emoji, 
        categoria_id: categoriaId || null, estado, imagen_url: imagenUrl,
        stock: parseInt(stock) || 0, fecha_vencimiento: fechaVencimiento || null
      }
      if (editingId) body.id = editingId

      const res = await fetch('/api/productos', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setIsSlideOpen(false)
        resetForm()
        fetchData()
      }
    } catch (err) {
      console.error('Error saving product:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm(dict.confirmarEliminar)) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/productos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ id })
      })
      fetchData()
    } catch (err) {
      console.error('Error deleting product:', err)
    }
  }

  function openEdit(p) {
    setEditingId(p.id)
    setNombre(p.nombre)
    setDescripcion(p.descripcion || '')
    setPrecio(p.precio)
    setCosto(p.costo || '')
    setEmoji(p.emoji || '📦')
    setCategoriaId(p.categoria_id || '')
    setEstado(p.estado || 'activo')
    setImagenUrl(p.imagen_url || '')
    setStock(p.stock || 0)
    setFechaVencimiento(p.fecha_vencimiento || '')
    setIsSlideOpen(true)
  }

  function resetForm() {
    setEditingId(null)
    setNombre('')
    setDescripcion('')
    setPrecio('')
    setCosto('')
    setEmoji('📦')
    setCategoriaId('')
    setEstado('activo')
    setImagenUrl('')
    setStock('0')
    setFechaVencimiento('')
    setShowNewCategoryInput(false)
  }

  const filteredProducts = productos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) || p.descripcion?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.categoria_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  // UI Components
  const CategoryPill = ({ id, label }) => (
    <button 
      onClick={() => setSelectedCategory(id)}
      className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
        selectedCategory === id 
        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
        : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-800">

      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <X size={18} className="shrink-0" />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      {/* 1. Header & Quick Actions */}
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
               <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Catálogo</h1>
               <p className="text-slate-500 font-medium">Gestiona tus productos y existencias de forma profesional.</p>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="bg-white p-1 rounded-2xl border border-slate-200 flex shadow-sm">
                  <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                     <LayoutGrid size={20} />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
                     <List size={20} />
                  </button>
               </div>
               <button 
                 onClick={() => { resetForm(); setIsSlideOpen(true); }}
                 className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-100 active:scale-95"
               >
                  <Plus size={20} /> Nuevo Producto
               </button>
            </div>
         </div>

         {/* 2. Filters & Categories Sidebar/Bar */}
         <div className="flex flex-col gap-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
               <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                  <CategoryPill id="all" label="Todos" />
                  {categorias.map(c => (
                    <CategoryPill key={c.id} id={c.id} label={c.nombre} />
                  ))}
               </div>
               
               <div className="relative group max-w-sm w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 focus:border-emerald-100 rounded-3xl outline-none transition-all font-medium text-slate-700 shadow-sm"
                  />
               </div>
            </div>

            {/* 3. Products Area */}
            {loading ? (
               <div className="py-20 flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Cargando Catálogo...</p>
               </div>
            ) : filteredProducts.length === 0 ? (
               <div className="py-20 bg-white rounded-[48px] border border-slate-100 flex flex-col items-center justify-center text-center p-10">
                  <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-200 mb-6">
                     <Package size={48} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">No hay productos aquí</h3>
                  <p className="text-slate-400 max-w-xs mx-auto">Parece que aún no tienes productos en esta categoría o con este nombre.</p>
               </div>
            ) : (
               <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-4"}>
                  {filteredProducts.map((p) => {
                    const isLowStock = p.stock <= 5;
                    const isPausado = p.estado === 'pausado';
                    
                    if (viewMode === 'list') {
                       return (
                         <div 
                           key={p.id} 
                           onClick={() => openEdit(p)}
                           className="bg-white rounded-[32px] p-6 border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all cursor-pointer group flex items-center gap-6"
                         >
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden relative border border-slate-100">
                               {p.imagen_url ? (
                                  <img src={p.imagen_url} className="w-full h-full object-cover" />
                               ) : (
                                  <span className="text-3xl">{p.emoji}</span>
                               )}
                               {isPausado && <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center"><EyeOff size={16} className="text-white" /></div>}
                            </div>
                            <div className="flex-1">
                               <h4 className="font-black text-slate-800 text-lg mb-1 group-hover:text-emerald-600 transition-colors">{p.nombre}</h4>
                               <div className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">€{parseFloat(p.precio).toFixed(2)}</span>
                                  <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${isLowStock ? 'text-rose-500' : 'text-slate-400'}`}>Stock: {p.stock}</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                               <button onClick={(e) => { e.stopPropagation(); openEdit(p); }} className="p-3 bg-slate-50 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all">
                                  <Pencil size={18} />
                               </button>
                               <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                  <Trash2 size={18} />
                               </button>
                            </div>
                         </div>
                       )
                    }

                    return (
                      <div 
                        key={p.id} 
                        onClick={() => openEdit(p)}
                        className="bg-white rounded-[40px] border border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-pointer group overflow-hidden relative"
                      >
                         <div className="aspect-square bg-slate-50 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                            {p.imagen_url ? (
                               <img src={p.imagen_url} className="w-full h-full object-cover" />
                            ) : (
                               <div className="w-full h-full flex items-center justify-center text-7xl select-none">
                                  {p.emoji}
                               </div>
                            )}
                            
                            {/* Badges Overlay */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                               {isPausado && (
                                 <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-2">
                                    <EyeOff size={10} /> Pausado
                                 </span>
                               )}
                               {isLowStock && (
                                 <span className="bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-rose-500/20">
                                    Low Stock
                                 </span>
                               )}
                            </div>
                         </div>

                         <div className="p-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                               {categorias.find(c => c.id === p.categoria_id)?.nombre || 'General'}
                            </p>
                            <h4 className="text-xl font-black text-slate-800 mb-4 truncate group-hover:text-emerald-600 transition-colors">
                               {p.nombre}
                            </h4>
                            <div className="flex items-center justify-between mt-auto">
                               <span className="text-2xl font-black text-slate-900 tracking-tight">€{parseFloat(p.precio).toFixed(2)}</span>
                               <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                  <ChevronRight size={20} />
                               </div>
                            </div>
                         </div>
                      </div>
                    )
                  })}
               </div>
            )}
         </div>
      </div>

      {/* 4. Slide-over Editor */}
      {isSlideOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsSlideOpen(false)} />
           <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              
              <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                 <div>
                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</div>
                    <h2 className="text-2xl font-black text-slate-800">{editingId ? nombre : 'Crear Artículo'}</h2>
                 </div>
                 <button onClick={() => setIsSlideOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                    <X size={24} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-[#FDFDFF]">
                 
                 {/* Photo Selector */}
                 <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Identidad del Producto</h3>
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center gap-6">
                       <div className="relative group">
                          <div className="w-40 h-40 rounded-[48px] bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden transition-all group-hover:scale-95">
                             {uploading ? (
                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                             ) : imagenUrl ? (
                                <img src={imagenUrl} className="w-full h-full object-cover" />
                             ) : (
                                <span className="text-7xl">{emoji}</span>
                             )}
                          </div>
                          <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-2 right-2 p-4 bg-emerald-500 text-white rounded-[24px] shadow-xl hover:bg-emerald-600 transition-all active:scale-90"
                          >
                             <Camera size={24} />
                          </button>
                       </div>
                       
                       {!imagenUrl && (
                          <div className="flex flex-wrap items-center justify-center gap-2">
                             {['📦', '🍕', '🍔', '🥗', '🥤', '🍰', '🍣', '🍷'].map(e => (
                               <button 
                                 key={e} 
                                 onClick={() => setEmoji(e)}
                                 className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${emoji === e ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-50 text-xl grayscale hover:grayscale-0'}`}
                               >
                                 {e}
                               </button>
                             ))}
                          </div>
                       )}
                       <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    </div>
                 </div>

                  {/* Basic Info */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nombre del producto</label>
                       <input 
                         required
                         value={nombre}
                         onChange={(e) => setNombre(e.target.value)}
                         className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-100 focus:border-emerald-500 outline-none font-bold text-slate-700 shadow-sm transition-all"
                         placeholder="Ej: Pizza Napolitana..."
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2">P. Venta</label>
                       <input 
                         required
                         type="number"
                         step="0.01"
                         value={precio}
                         onChange={(e) => setPrecio(e.target.value)}
                         className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-100 focus:border-emerald-500 outline-none font-black text-slate-900 shadow-sm transition-all"
                         placeholder="0.00"
                       />
                    </div>
                    <div className="space-y-2 relative">
                       <label className="text-[10px] font-black text-emerald-600 uppercase ml-2 flex items-center justify-between">
                         Costo Neto
                         {parseFloat(precio) > 0 && parseFloat(costo) > 0 && (
                           <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">
                             {(((parseFloat(precio) - parseFloat(costo)) / parseFloat(costo)) * 100).toFixed(0)}% Utilidad
                           </span>
                         )}
                       </label>
                       <input 
                         type="number"
                         step="0.01"
                         value={costo}
                         onChange={(e) => setCosto(e.target.value)}
                         className="w-full px-6 py-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 focus:border-emerald-500 outline-none font-black text-emerald-900 shadow-sm transition-all"
                         placeholder="0.00"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Descripción</label>
                    <textarea 
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      rows={3}
                      className="w-full px-6 py-4 rounded-3xl bg-white border border-slate-100 focus:border-emerald-500 outline-none font-medium text-slate-600 shadow-sm transition-all resize-none"
                      placeholder="Ingredientes, medidas, detalles..."
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Category Selector UI */}
                    <div className="space-y-2">
                       <div className="flex items-center justify-between px-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase">Categoría</label>
                          <button onClick={() => setShowNewCategoryInput(!showNewCategoryInput)} className="text-[10px] font-black text-emerald-600 uppercase hover:underline">
                             {showNewCategoryInput ? 'Cerrar' : '+ Nueva'}
                          </button>
                       </div>
                       {showNewCategoryInput ? (
                          <div className="flex gap-2">
                            <input 
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm"
                              placeholder="Nombre categoría..."
                            />
                            {/* logic for inline create same as current... */}
                          </div>
                       ) : (
                          <select 
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-100 outline-none font-bold text-slate-600 shadow-sm transition-all cursor-pointer"
                          >
                             <option value="">Sin Categoría</option>
                             {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                          </select>
                       )}
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Stock Disponible</label>
                       <div className="relative">
                          <Package size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input 
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-slate-100 outline-none font-black text-slate-700 shadow-sm transition-all"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl shadow-slate-200">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Estado y Visibilidad</h4>
                    <div className="flex gap-4">
                       <button 
                         type="button"
                         onClick={() => setEstado('activo')}
                         className={`flex-1 p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${estado === 'activo' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-white/5 text-white/40'}`}
                       >
                          <Eye size={24} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Activo</span>
                       </button>
                       <button 
                         type="button"
                         onClick={() => setEstado('pausado')}
                         className={`flex-1 p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${estado === 'pausado' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/5 bg-white/5 text-white/40'}`}
                       >
                          <EyeOff size={24} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Oculto</span>
                       </button>
                    </div>
                 </div>

              </div>

              <div className="p-8 border-t border-slate-100 bg-white grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => setIsSlideOpen(false)}
                   className="py-4 rounded-2xl border border-slate-200 font-bold text-slate-400 hover:bg-slate-50 transition-all"
                 >
                    Cancelar
                 </button>
                 <button 
                   onClick={handleSave}
                   disabled={saving || uploading}
                   className="py-4 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-3 transition-all transform active:scale-95"
                 >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                    Guardar Cambios
                 </button>
              </div>

           </div>
        </div>
      )}

      {/* Global Style */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-in { animation-duration: 0.3s; animation-fill-mode: both; }
        .slide-in-from-right { animation-name: slideInRight; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  )
}
