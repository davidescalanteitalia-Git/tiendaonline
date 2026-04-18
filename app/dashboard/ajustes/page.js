'use client'

import { useState, useEffect, useRef } from 'react'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'
import {
  Settings, User, Store, Bell, ShieldCheck, Loader2, Save,
  CheckCircle2, Copy, ExternalLink, Image as ImageIcon,
  Smartphone, Info, Camera, Trash2, Globe, X, Clock,
  Music2, MessageCircle, Bird, PlayCircle, Link, AtSign, Star
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import AvatarUpload from '../../../components/AvatarUpload'

const REDES_CONFIG = [
  { key: 'facebook',  label: 'Facebook',  Icon: Link,            color: '#1877F2', placeholder: 'https://facebook.com/tu_tienda' },
  { key: 'instagram', label: 'Instagram', Icon: AtSign,          color: '#E1306C', placeholder: '@tu_tienda o URL completa' },
  { key: 'tiktok',    label: 'TikTok',    Icon: Music2,          color: '#010101', placeholder: '@tu_tienda' },
  { key: 'youtube',   label: 'YouTube',   Icon: PlayCircle,      color: '#FF0000', placeholder: 'https://youtube.com/@tu_canal' },
  { key: 'twitter',   label: 'X / Twitter', Icon: Bird,          color: '#1DA1F2', placeholder: 'https://x.com/tu_tienda' },
  { key: 'whatsapp',  label: 'WhatsApp Business', Icon: MessageCircle, color: '#25D366', placeholder: '+39...' },
]

export default function AjustesPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  
  // Tienda state
  const [nombre, setNombre] = useState('')
  const [subdominio, setSubdominio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [horario, setHorario] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [emoji, setEmoji] = useState('🏪')
  const [userId, setUserId] = useState(null)
  const [linkResenaGoogle, setLinkResenaGoogle] = useState('')

  // Redes sociales: { facebook: {url, visible}, instagram: {url, visible}, ... }
  const [redes, setRedes] = useState(() => {
    const init = {}
    REDES_CONFIG.forEach(r => { init[r.key] = { url: '', visible: false } })
    return init
  })

  const updateRed = (key, field, value) => {
    setRedes(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }
  
  // Operational Settings
  const [aceptarPedidos, setAceptarPedidos] = useState(true)
  const [enviarWhatsapp, setEnviarWhatsapp] = useState(true)
  const [mensajePostPedido, setMensajePostPedido] = useState('')

  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchTienda()
  }, [])

  async function fetchTienda() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUserId(session.user.id)

      const res = await fetch('/api/tienda', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      const data = await res.json()
      
      if (data) {
        setNombre(data.nombre || '')
        setSubdominio(data.subdominio || '')
        setDescripcion(data.descripcion || '')
        setWhatsapp(data.whatsapp || '')
        setHorario(data.horario || '')
        setLogoUrl(data.logo_url || '')
        setEmoji(data.emoji || '🏪')
        setAceptarPedidos(data.aceptar_pedidos ?? true)
        setEnviarWhatsapp(data.enviar_whatsapp ?? true)
        setMensajePostPedido(data.mensaje_post_pedido || '')
        setLinkResenaGoogle(data.link_resena_google || '')

        // Cargar redes sociales desde config_diseno
        const config = data.config_diseno || {}
        const savedRedes = config.redes_sociales || {}
        const instagram_legacy = data.instagram || ''
        setRedes(prev => {
          const merged = { ...prev }
          REDES_CONFIG.forEach(r => {
            merged[r.key] = {
              url: savedRedes[r.key]?.url ?? (r.key === 'instagram' ? instagram_legacy : ''),
              visible: savedRedes[r.key]?.visible ?? false,
            }
          })
          return merged
        })
      }
    } catch (err) {
      console.error('Error fetching store info:', err)
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
          const MAX = 400 // Logos don't need to be huge
          let w = img.width
          let h = img.height
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * MAX / w); w = MAX }
            else        { w = Math.round(w * MAX / h); h = MAX }
          }
          const canvas = document.createElement('canvas')
          canvas.width  = w
          canvas.height = h
          canvas.getContext('2d').drawImage(img, 0, 0, w, h)
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const compressed = await compressImage(file)
      const fileName = `logo-${Date.now()}.jpg`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('productos') // Using same bucket for simplicity or create 'tienda-assets'
        .upload(filePath, compressed, { contentType: 'image/jpeg', upsert: true })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath)

      setLogoUrl(publicUrlData.publicUrl)
    } catch (error) {
      console.error('Error uploading logo:', error)
      setErrorMsg('Error al subir logo: ' + error.message)
      setTimeout(() => setErrorMsg(null), 4000)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
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
          nombre, descripcion, whatsapp, horario,
          instagram: redes.instagram?.url || '',
          logo_url: logoUrl,
          aceptar_pedidos: aceptarPedidos,
          enviar_whatsapp: enviarWhatsapp,
          mensaje_post_pedido: mensajePostPedido,
          link_resena_google: linkResenaGoogle,
          config_diseno_patch: { redes_sociales: redes },
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
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 animate-in fade-in">
       <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  )

  const storeUrl = `${subdominio}.tiendaonline.it`;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <X size={18} className="shrink-0" />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Settings className="text-blue-500" size={32} /> {dict.impostazioni || 'Ajustes'}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">{dict.configuracionesGenerales || 'Gestiona tu negocio.'}</p>
        </div>
        <button 
           onClick={handleSave}
           disabled={saving}
           className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
          {dict.guardarCambios || 'Guardar'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Perfil y Logo */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card: Logo y Perfil */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Store className="text-blue-500" size={24} /> {dict.perfilTienda || 'Perfil de Tienda'}
            </h3>

            <div className="flex flex-col md:flex-row gap-8 items-start">
               {/* Logo Upload Section */}
               <div className="flex flex-col items-center gap-2">
                 <AvatarUpload
                   currentUrl={logoUrl}
                   userId={userId || 'tienda'}
                   bucket="avatars"
                   size={112}
                   shape="rounded"
                   label={dict.fotoLogo || 'Logo de tienda'}
                   onUploaded={(url) => setLogoUrl(url)}
                 />
                 {logoUrl && (
                   <button
                     onClick={() => setLogoUrl('')}
                     className="text-xs text-rose-400 hover:text-rose-600 font-semibold transition-colors"
                   >
                     Eliminar logo
                   </button>
                 )}
               </div>

               <div className="flex-1 w-full space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{dict.nombreDeLaTienda || 'Nombre'}</label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                        placeholder={dict.placeholderNombreTienda}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{dict.whatsappNegozio || 'WhatsApp'}</label>
                      <input
                        type="text"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                        placeholder="+39 ..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={13} /> Horario
                      </label>
                      <input
                        type="text"
                        value={horario}
                        onChange={(e) => setHorario(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                        placeholder="Lun–Vie 9:00–18:00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{dict.descripcionCorta || 'Bio'}</label>
                    <textarea
                      rows="3"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none"
                      placeholder={dict.placeholderDescripcion}
                    ></textarea>
                  </div>
               </div>
            </div>
          </div>

          {/* ─── Redes Sociales ─── */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Globe className="text-pink-500" size={22} /> Redes Sociales
            </h3>
            <p className="text-xs text-slate-500 mb-6">Activa las redes que quieres mostrar en tu tienda online. Los clientes verán los iconos y podrán seguirte.</p>

            <div className="space-y-4">
              {REDES_CONFIG.map(({ key, label, Icon, color, placeholder }) => (
                <div key={key} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + '18', border: `1.5px solid ${color}30` }}>
                    <Icon size={18} style={{ color }} />
                  </div>

                  {/* Label + URL input */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-600 mb-1">{label}</p>
                    <input
                      type="text"
                      value={redes[key]?.url || ''}
                      onChange={e => updateRed(key, 'url', e.target.value)}
                      placeholder={placeholder}
                      className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all"
                    />
                  </div>

                  {/* Toggle visible */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Mostrar</span>
                    <button
                      type="button"
                      onClick={() => updateRed(key, 'visible', !redes[key]?.visible)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        redes[key]?.visible ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        redes[key]?.visible ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* ─── Google Reviews ─── */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            {/* Header con fondo degradado sutil */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100 px-8 py-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-amber-100 flex items-center justify-center shrink-0">
                <Star className="text-yellow-400 fill-yellow-400" size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Google Reviews</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tus clientes podrán dejarte una reseña con un solo toque</p>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="p-8">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Enlace de tu perfil en Google
              </label>
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <ExternalLink size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  <input
                    type="url"
                    value={linkResenaGoogle}
                    onChange={e => setLinkResenaGoogle(e.target.value)}
                    placeholder="https://g.page/r/TU_CODIGO/review"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300/60 focus:border-slate-300 placeholder-slate-300 transition-all"
                  />
                </div>
                {linkResenaGoogle && (
                  <a
                    href={linkResenaGoogle}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-sm"
                  >
                    <ExternalLink size={14} /> Probar
                  </a>
                )}
              </div>

              {/* Instrucción visual */}
              <div className="mt-4 flex items-start gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <span className="text-base shrink-0">📍</span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">¿Cómo obtener tu link?</strong> Abre Google Maps en tu teléfono → busca tu negocio → toca <strong className="text-slate-700">Reseñas</strong> → icono de compartir → copia el link.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 text-white shadow-xl">
             <div className="flex items-center gap-4 mb-6">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <Globe className="text-blue-400" size={24} />
                </div>
                <div>
                   <h3 className="text-xl font-bold">{dict.subdominio || 'Dirección Web'}</h3>
                   <p className="text-slate-400 text-sm">Esta es la URL oficial de tu catálogo online.</p>
                </div>
             </div>

             <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">URL del Catálogo</p>
                <p className="text-base font-mono text-blue-400 mb-4 break-all">https://{storeUrl}</p>
                <div className="flex gap-3">
                   <button
                     onClick={copyLink}
                     className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-bold text-sm ${copiedLink ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                   >
                     {copiedLink ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                     {copiedLink ? (dict.enlaceCopiado || '¡Copiado!') : (dict.copiar || 'Copiar')}
                   </button>
                   <a
                     href={typeof window !== 'undefined' && window.location.hostname.includes('tiendaonline.it')
                       ? `https://${subdominio}.tiendaonline.it`
                       : `/store/${subdominio}`}
                     target="_blank"
                     className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-3 rounded-xl transition-all font-bold text-sm"
                   >
                     <ExternalLink size={16} /> {dict.abrir || 'Abrir'}
                   </a>
                </div>
             </div>
             <p className="mt-6 text-xs text-slate-500 flex items-center gap-2">
                <Info size={14} /> Para cambiar tu subdominio personalizado, contacta con soporte técnico.
             </p>
          </div>

        </div>

        {/* COLUMNA DERECHA: Pedidos y Post-Mensaje */}
        <div className="space-y-8">
          
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-8">{dict.pedidosYComunicacion || 'Operativa'}</h3>
            
            <div className="space-y-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{dict.aceptarPedidosOnline || 'Aceptar pedidos'}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Si está desactivado, el catálogo será solo informativo.</p>
                </div>
                <button 
                  onClick={() => setAceptarPedidos(!aceptarPedidos)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${aceptarPedidos ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${aceptarPedidos ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-start justify-between gap-4 pt-6 border-t border-slate-100">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{dict.recibirWhatsApp || 'Resumen WhatsApp'}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Redirige al cliente a WhatsApp después del pedido.</p>
                </div>
                <button 
                  onClick={() => setEnviarWhatsapp(!enviarWhatsapp)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enviarWhatsapp ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${enviarWhatsapp ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Finalización</h3>
            <p className="text-xs text-slate-500 mb-6">Mensaje que el cliente ve al terminar.</p>

            <div className="relative">
              <textarea
                value={mensajePostPedido}
                onChange={(e) => setMensajePostPedido(e.target.value.slice(0, 200))}
                rows="5"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none resize-none text-slate-700 font-medium"
                placeholder="..."
              ></textarea>
              <div className="absolute bottom-4 right-4 text-[10px] bg-white px-2 py-1 rounded-full border border-slate-100 text-slate-400 font-bold">
                {mensajePostPedido.length}/200
              </div>
            </div>
          </div>

        </div>

      </div>

      {saved && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300">
           <div className="bg-emerald-500 p-1 rounded-full">
            <CheckCircle2 size={16} />
           </div>
           <span className="font-bold text-sm tracking-wide">{dict.configuracionGuardada || '¡Cambios guardados!'}</span>
        </div>
      )}
    </div>
  )
}
