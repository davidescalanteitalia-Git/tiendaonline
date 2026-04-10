'use client'

import { useState, useEffect } from 'react'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'
import { FolderTree, Plus, Pencil, Trash2, X, Save, Loader2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function CategoriasPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']

  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Form state
  const [nombre, setNombre] = useState('')
  const [orden, setOrden] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCategorias()
  }, [])

  async function fetchCategorias() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/categorias', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      const data = await res.json()
      setCategorias(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const method = editingId ? 'PATCH' : 'POST'
      const body = { nombre, orden: parseInt(orden) }
      if (editingId) body.id = editingId

      const res = await fetch('/api/categorias', {
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
        fetchCategorias()
      }
    } catch (err) {
      console.error('Error saving category:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm(dict.confirmarEliminar)) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/categorias', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id })
      })
      fetchCategorias()
    } catch (err) {
      console.error('Error deleting category:', err)
    }
  }

  function openEdit(cat) {
    setEditingId(cat.id)
    setNombre(cat.nombre)
    setOrden(cat.orden)
    setIsModalOpen(true)
  }

  function resetForm() {
    setEditingId(null)
    setNombre('')
    setOrden(0)
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans">

      {/* Header — aligned with diseno schema */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FolderTree className="text-blue-500" size={32} />
            {dict.categorie}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">{dict.organizaTusProductos}</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-95"
        >
          <Plus size={20} /> {dict.nuevaCategoria}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : categorias.length === 0 ? (
        <div className="bg-white rounded-[32px] p-16 border-2 border-dashed border-slate-200 text-center shadow-sm">
          <FolderTree size={52} className="mx-auto mb-4 text-slate-200" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">{dict.sinCategorias}</h3>
          <p className="text-slate-400 mb-8 font-medium">{dict.sinCategoriasDesc}</p>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} /> {dict.crearCategoria}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorias.map(cat => (
            <div
              key={cat.id}
              className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-50 text-blue-500 p-3 rounded-2xl">
                    <FolderTree size={22} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">{cat.nombre}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Orden: {cat.orden}
                </p>
              </div>
            </div>
          ))}

          {/* Quick create button */}
          <div
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-slate-50 rounded-[32px] p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group min-h-[160px]"
          >
            <Plus size={32} className="mb-3 transition-transform group-hover:scale-110" />
            <span className="text-sm font-bold">{dict.crearCategoria}</span>
          </div>
        </div>
      )}

      {/* Modal — aligned with diseno shadow/blur style */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-800">
                {editingId ? dict.editare : dict.crearCategoria}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  {dict.nombreCategoria}
                </label>
                <input
                  required
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700"
                  placeholder="Es: Pizze, Bevande, Dessert..."
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  {dict.ordenCategoria}
                </label>
                <input
                  type="number"
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  {dict.cerrar}
                </button>
                <button
                  disabled={saving}
                  type="submit"
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
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
