'use client'

import { useState, useEffect } from 'react'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'
import { Settings, User, Store, Bell, ShieldCheck, Loader2, Save, CheckCircle2, Copy, ExternalLink, Image as ImageIcon, LayoutGrid, List, Smartphone, Info } from 'lucide-react'
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
  const [colorPrincipal, setColorPrincipal] = useState('#3B82F6')
  
  // Nuevos campos "Catálogo Online"
  const [modoCatalogo, setModoCatalogo] = useState('cuadricula')
  const [aceptarPedidos, setAceptarPedidos] = useState(true)
  const [enviarWhatsapp, setEnviarWhatsapp] = useState(true)
  const [mensajePostPedido, setMensajePostPedido] = useState('Pronto nos pondremos en contacto para confirmar los detalles de tu compra. ¡Gracias por elegirnos!')

  const THEME_COLORS = [
    { name: 'Kyte Blue', hex: '#3B82F6' },
    { name: 'Emerald Green', hex: '#10B981' },
    { name: 'Ruby Red', hex: '#EF4444' },
    { name: 'Amethyst Purple', hex: '#8B5CF6' },
    { name: 'Midnight Black', hex: '#1F2937' },
    { name: 'Sunset Orange', hex: '#F97316' },
  ]

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
        setColorPrincipal(data.color_principal || '#3B82F6')
        
        setModoCatalogo(data.modo_catalogo || 'cuadricula')
        setAceptarPedidos(data.aceptar_pedidos ?? true)
        setEnviarWhatsapp(data.enviar_whatsapp ?? true)
        if(data.mensaje_post_pedido) setMensajePostPedido(data.mensaje_post_pedido)
      }
    } catch (err) {
      console.error('Error fetching store info:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e) {
    if(e) e.preventDefault()
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
        body: JSON.stringify({ 
          nombre, descripcion, whatsapp, emoji, color_principal: colorPrincipal,
          modo_catalogo: modoCatalogo,
          aceptar_pedidos: aceptarPedidos,
          enviar_whatsapp: enviarWhatsapp,
          mensaje_post_pedido: mensajePostPedido
        })
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

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${subdominio}.tiendaonline.it`)
    alert('¡Enlace copiado!')
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 animate-in fade-in">
       <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  )

  const storeUrl = `https://${subdominio}.tiendaonline.it`;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Modal-like Kyte */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Catálogo Online</h1>
        <button 
           onClick={handleSave}
           disabled={saving}
           className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar Cambios
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-6">
          
          {/* Card: Link del Catálogo */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row items-center justify-between p-5 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <Store size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Link del catálogo</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500 font-mono">{storeUrl}</span>
                  <button onClick={copyLink} className="text-emerald-500 font-bold text-[11px] flex items-center gap-1 hover:text-emerald-600">
                    <Copy size={12}/> Copiar enlace
                  </button>
                </div>
              </div>
            </div>
            <a href={`/store/${subdominio}`} target="_blank" className="flex items-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-lg font-bold text-sm transition-colors w-full sm:w-auto justify-center">
               <ExternalLink size={16}/> Ver tienda
            </a>
          </div>

          {/* Card: Diseño y Versión */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Diseño del Catálogo</h3>
            <p className="text-sm text-slate-500 mb-6">Elige el tema de color y cómo visualizar tus productos.</p>

            <div className="space-y-6">
              {/* Colores */}
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase mb-3">Color Principal</p>
                <div className="flex flex-wrap gap-3">
                  {THEME_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c.hex}
                      onClick={() => setColorPrincipal(c.hex)}
                      className={`w-10 h-10 rounded-full border-2 transition-transform ${colorPrincipal === c.hex ? 'scale-110 shadow-md ring-2 ring-emerald-500 ring-offset-2' : 'hover:scale-105 border-transparent'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Modos Visuales */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700 uppercase mb-3">Estilo Visual</p>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setModoCatalogo('lista')}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${modoCatalogo === 'lista' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <List size={24} className={`mb-2 ${modoCatalogo === 'lista' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <p className="text-sm font-bold text-slate-800">Modo Lista</p>
                    <p className="text-xs text-slate-500 mt-1">Navegación más rápida, ideal para grandes cantidades.</p>
                  </div>
                  <div 
                    onClick={() => setModoCatalogo('cuadricula')}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${modoCatalogo === 'cuadricula' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <LayoutGrid size={24} className={`mb-2 ${modoCatalogo === 'cuadricula' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <p className="text-sm font-bold text-slate-800">Modo Cuadrícula</p>
                    <p className="text-xs text-slate-500 mt-1">Ideal para visualizar fotos grandes simultáneamente.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Datos de la Tienda */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Datos de la tienda</h3>
            <p className="text-sm text-slate-500 mb-6">Completa los datos de tu tienda y deja tu catálogo profesional.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nombre del Comercio</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Número de WhatsApp</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Sobre el Negocio (Bio)</label>
                <textarea
                  rows="2"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                ></textarea>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">
          
          {/* Card: Pedidos Toggle Settings */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Pedidos y Comunicación</h3>
            
            <div className="space-y-6">
              {/* Item 1 */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">Aceptar pedidos en línea</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">Tus pedidos aparecerán como Pendientes hasta que los aceptes en el panel.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setAceptarPedidos(!aceptarPedidos)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none transition-colors ${aceptarPedidos ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`pointer-events-none absolute left-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${aceptarPedidos ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Item 2 */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">Recibir resumen del pedido por WhatsApp</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">Además de crear su pedido, sus clientes serán dirigidos a enviar el resumen a tu WhatsApp.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setEnviarWhatsapp(!enviarWhatsapp)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none transition-colors ${enviarWhatsapp ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <span className={`pointer-events-none absolute left-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${enviarWhatsapp ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Card: Instrucciones Posteriores (WhatsApp Mensaje) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Instrucciones posteriores al pedido</h3>
            <p className="text-xs text-slate-500 mb-6">Personaliza el mensaje que verán tus clientes después de completar su pedido.</p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center mb-6">
               <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                 <CheckCircle2 size={32} />
               </div>
               <p className="font-bold text-emerald-500 text-sm mb-1">¡Pedido enviado!</p>
               <p className="text-xs text-slate-600 text-center max-w-[200px]">
                 {mensajePostPedido || 'Pronto nos pondremos en contacto...'}
               </p>
            </div>

            <div className="relative">
              <textarea
                value={mensajePostPedido}
                onChange={(e) => setMensajePostPedido(e.target.value.slice(0, 200))}
                rows="4"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none text-slate-700 bg-white shadow-sm"
              ></textarea>
              <span className="absolute bottom-3 right-3 text-xs text-slate-400 font-mono">
                {mensajePostPedido.length}/200
              </span>
            </div>
          </div>

        </div>

      </div>

      {saved && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-xl shadow-slate-200 flex items-center gap-3 animate-in slide-in-from-bottom-5">
           <CheckCircle2 className="text-emerald-400" size={20} />
           <span className="font-bold text-sm">Cambios guardados correctamente</span>
        </div>
      )}
    </div>
  )
}
