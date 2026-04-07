'use client'

import { useState, useEffect, useRef } from 'react'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'
import { Package, Plus, Search, Pencil, Trash2, X, Save, Loader2, Camera, Upload, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function ProductosPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']
  
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // Form state
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precio, setPrecio] = useState('')
  const [emoji, setEmoji] = useState('📦')
  const [categoriaId, setCategoriaId] = useState('')
  const [estado, setEstado] = useState('activo')
  const [imagenUrl, setImagenUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const [resProd, resCat] = await Promise.all([
        fetch('/api/productos', { headers: { 'Authorization': `Bearer ${session.access_token}` } }),
        fetch('/api/categorias', { headers: { 'Authorization': `Bearer ${session.access_token}` } })
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `product-images/${fileName}`

      const { data, error } = await supabase.storage
        .from('productos')
        .upload(filePath, file)

      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath)

      setImagenUrl(publicUrlData.publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Error: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const method = editingId ? 'PATCH' : 'POST'
      const body = { 
        nombre, 
        descripcion, 
        precio: parseFloat(precio) || 0, 
        emoji, 
        categoria_id: categoriaId || null, 
        estado,
        imagen_url: imagenUrl
      }
      if (editingId) body.id = editingId

      const res = await fetch('/api/productos', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        setIsModalOpen(false)
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
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
    setEmoji(p.emoji || '📦')
    setCategoriaId(p.categoria_id || '')
    setEstado(p.estado || 'activo')
    setImagenUrl(p.imagen_url || '')
    setIsModalOpen(true)
  }

  function resetForm() {
    setEditingId(null)
    setNombre('')
    setDescripcion('')
    setPrecio('')
    setEmoji('📦')
    setCategoriaId('')
    setEstado('activo')
    setImagenUrl('')
  }

  const filteredProducts = productos.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Package className="text-primary" size={28} />
            {dict.prodotti}
          </h1>
          <p className="text-slate-500 mt-1">{dict.gestionaCatalogo}</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Plus size={18} /> {dict.añadirProducto}
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dict.buscarProductos}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="px-6 py-20 text-center text-slate-400">
              <div className="flex flex-col items-center justify-center">
                <Package size={64} className="mb-4 text-slate-100" />
                <p className="font-bold text-slate-600 mb-1 text-lg">{dict.sinProductos}</p>
                <p className="text-sm">{dict.sinProductosDesc}</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">{dict.producto}</th>
                  <th className="px-6 py-4 font-semibold">{dict.categoriaProducto}</th>
                  <th className="px-6 py-4 font-semibold">{dict.precio}</th>
                  <th className="px-6 py-4 font-semibold">{dict.estado}</th>
                  <th className="px-6 py-4 font-semibold text-right">{dict.acciones}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl flex-shrink-0 relative overflow-hidden">
                          {p.imagen_url ? (
                             <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                          ) : p.emoji}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{p.nombre}</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-[200px] truncate">{p.descripcion}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {categorias.find(c => c.id === p.categoria_id)?.nombre || dict.sinCategoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      € {parseFloat(p.precio).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        p.estado === 'activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.estado === 'activo' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {p.estado === 'activo' ? dict.estadoActivo : dict.estadoPausado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-200">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-slate-200">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal - Añadir / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="bg-blue-50 text-primary p-3 rounded-2xl">
                      <Package size={24} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        {editingId ? dict.editare : dict.añadirProducto}
                      </h2>
                      <p className="text-slate-500 text-sm">{dict.completaDetalles || 'Completa i dettagli del prodotto.'}</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <X size={24} />
                </button>
             </div>

             <form onSubmit={handleSave} className="space-y-6">
                
                {/* Photo Upload Section */}
                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 text-center space-y-4">
                   <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">{dict.fotoProducto || 'Foto del Prodotto'}</label>
                   
                   <div className="relative mx-auto w-32 h-32 rounded-3xl bg-white shadow-md flex items-center justify-center overflow-hidden border-4 border-white group">
                      {uploading ? (
                         <div className="flex flex-col items-center gap-2">
                           <Loader2 className="animate-spin text-primary" size={24} />
                           <span className="text-[10px] uppercase font-black text-slate-400">Caricamento...</span>
                         </div>
                      ) : imagenUrl ? (
                         <>
                           <img src={imagenUrl} alt="Preview" className="w-full h-full object-cover" />
                           <button 
                             type="button" 
                             onClick={() => setImagenUrl('')}
                             className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs"
                           >
                             Rimuovi
                           </button>
                         </>
                      ) : (
                         <ImageIcon className="text-slate-200" size={48} />
                      )}
                   </div>

                   <div className="flex items-center justify-center gap-3">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        ref={fileInputRef} 
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-slate-600 font-bold text-sm shadow-sm hover:shadow-md transition-all border border-slate-200"
                      >
                         <Upload size={16} /> {dict.galeria || 'Galleria'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          fileInputRef.current.setAttribute('capture', 'environment')
                          fileInputRef.current.click()
                        }}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all"
                      >
                         <Camera size={16} /> {dict.camara || 'Fotocamera'}
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">{dict.nombreProducto}</label>
                      <input 
                        required
                        type="text" 
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        placeholder="Es: Margherita, Tiramisù..."
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">{dict.precioProducto}</label>
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        value={precio} 
                        onChange={(e) => setPrecio(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                        placeholder="0.00"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="block text-sm font-bold text-slate-700">{dict.descripcionProducto}</label>
                   <textarea 
                    value={descripcion} 
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                    placeholder="Descrivi gli ingredienti o i detalles del prodotto..."
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">{dict.categoriaProducto}</label>
                      <select 
                        value={categoriaId}
                        onChange={(e) => setCategoriaId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white"
                      >
                         <option value="">{dict.sinCategoria}</option>
                         {categorias.map(c => (
                           <option key={c.id} value={c.id}>{c.nombre}</option>
                         ))}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">{dict.emojiProducto}</label>
                      <select 
                        disabled={!!imagenUrl}
                        value={emoji}
                        onChange={(e) => setEmoji(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white disabled:opacity-50"
                      >
                         <option value="📦">📦 Prodotto</option>
                         <option value="🍕">🍕 Pizza</option>
                         <option value="🍔">🍔 Burger</option>
                         <option value="🍝">🍝 Pasta</option>
                         <option value="🥗">🥗 Insalata</option>
                         <option value="🍰">🍰 Dolce</option>
                         <option value="🥤">🥤 Bevanda</option>
                         <option value="☕">☕ Caffè</option>
                         <option value="🍺">🍺 Birra</option>
                         <option value="🍷">🍷 Vino</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="block text-sm font-bold text-slate-700">{dict.estado}</label>
                   <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setEstado('activo')}
                        className={`flex-1 py-3 px-4 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${
                          estado === 'activo' 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                          : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${estado === 'activo' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        {dict.estadoActivo}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEstado('pausado')}
                        className={`flex-1 py-3 px-4 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 ${
                          estado === 'pausado' 
                          ? 'bg-amber-50 border-amber-500 text-amber-700' 
                          : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${estado === 'pausado' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                        {dict.estadoPausado}
                      </button>
                   </div>
                </div>

                <div className="flex gap-3 pt-6">
                   <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                   >
                     {dict.cerrar}
                   </button>
                   <button 
                    disabled={saving || uploading}
                    type="submit"
                    className="flex-1 px-6 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                   >
                     {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                     {dict.salvare}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
