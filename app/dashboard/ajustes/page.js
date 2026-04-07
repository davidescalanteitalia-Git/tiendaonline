'use client'

import { useState, useEffect } from 'react'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'
import { Settings, User, Store, Bell, ShieldCheck, Loader2, Save, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function AjustesPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Tienda state
  const [nombre, setNombre] = useState('')
  const [subdominio, setSubdominio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [emoji, setEmoji] = useState('🏪')

  useEffect(() => {
    fetchTienda()
  }, [])

  async function fetchTienda() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/tienda', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      const data = await res.json()
      
      if (data) {
        setNombre(data.nombre || '')
        setSubdominio(data.subdominio || '')
        setDescripcion(data.descripcion || '')
        setWhatsapp(data.whatsapp || '')
        setEmoji(data.emoji || '🏪')
      }
    } catch (err) {
      console.error('Error fetching store info:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/tienda', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ nombre, descripcion, whatsapp, emoji })
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error('Error saving settings:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 animate-in fade-in">
       <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  )

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Settings className="text-primary" size={28} />
            {dict.impostazioni}
          </h1>
          <p className="text-slate-500 mt-1">{dict.configuracionesGenerales}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav Settings */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm transition-colors text-left border border-blue-100 shadow-sm">
            <Store size={18} /> {dict.perfilTienda}
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-500 font-medium text-sm transition-colors text-left">
            <User size={18} /> {dict.tuCuenta}
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-500 font-medium text-sm transition-colors text-left">
            <Bell size={18} /> {dict.notificaciones}
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-500 font-medium text-sm transition-colors text-left">
            <ShieldCheck size={18} /> {dict.privacidadLegal}
          </button>
        </div>

        {/* Content Settings */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black text-slate-800">{dict.perfilDeLaTienda}</h2>
               {saved && (
                 <div className="flex items-center gap-2 text-emerald-600 animate-in fade-in slide-in-from-right-4">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-bold">Modifiche salvate!</span>
                 </div>
               )}
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">{dict.nombreDeLaTienda}</label>
                  <input
                    required
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder={dict.placeholderNombreTienda}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">{dict.subdominio}</label>
                  <div className="relative group grayscale cursor-not-allowed">
                    <input
                      disabled
                      type="text"
                      value={subdominio}
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:outline-none transition-all font-mono text-xs text-slate-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      .tiendaonline.it
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tight">Non modificabile (Sottodominio unico)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-3">{dict.whatsappNegozio || 'WhatsApp'}</label>
                   <input
                     required
                     type="text"
                     value={whatsapp}
                     onChange={(e) => setWhatsapp(e.target.value)}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 font-medium"
                   />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-3">{dict.emojiProducto || 'Icona Negozio'}</label>
                   <select
                     value={emoji}
                     onChange={(e) => setEmoji(e.target.value)}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-800 font-medium"
                   >
                     <option value="🏪">🏪 Negozio</option>
                     <option value="🍕">🍕 Pizzeria / Food</option>
                     <option value="🍰">🍰 Pasticceria</option>
                     <option value="🛍️">🛍️ Boutique</option>
                     <option value="📦">📦 Logistica</option>
                     <option value="🏠">🏠 Casa / Arredo</option>
                     <option value="👕">👕 Abbigliamento</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">{dict.descripcionCorta}</label>
                <textarea
                  rows="4"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder={dict.placeholderDescripcion}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none text-slate-700 leading-relaxed"
                ></textarea>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  disabled={saving}
                  type="submit" 
                  className="bg-primary hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex items-center gap-3"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {dict.guardarCambios}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
