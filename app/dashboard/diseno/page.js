'use client'

import { useState, useEffect, useRef } from 'react'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'
import Link from 'next/link'
import { 
  Paintbrush, 
  LayoutTemplate, 
  Palette, 
  Type, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  X,
  CreditCard,
  Truck,
  Share2,
  Settings2,
  CheckCircle2,
  ChevronRight,
  Monitor,
  MessageCircle,
  Smartphone,
  Info,
  Loader2,
  Camera,
  Tag
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function DisenoPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [tienda, setTienda] = useState(null)
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  
  // Coupons State
  const [showCuponModal, setShowCuponModal] = useState(false)
  const [newCupon, setNewCupon] = useState({ codigo: '', tipo: 'porcentaje', valor: '' })

  // Design Configuration State
  const [config, setConfig] = useState({
    publicado: true,
    color_principal: '#2563EB',
    version_catalogo: 'nuevo',
    modo_exhibicion: 'cuadricula',
    mostrar_sin_stock: 'normal',
    banner_url: null,
    cupones: [],
  })

  const bannerInputRef = useRef(null)
  const colorInputRef = useRef(null)

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
      setTienda(data)
      if (data.config_diseno) {
        setConfig(prev => ({ ...prev, ...data.config_diseno }))
      }
    } catch (err) {
      console.error('Error fetching tienda:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateConfig = (key, value) => {
    const newConfig = { ...config, [key]: value }
    setConfig(newConfig)
    saveChanges(newConfig)
  }

  const saveChanges = async (configToSave) => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/tienda', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ config_diseno: configToSave })
      })
    } catch (err) {
      console.error('Error saving config:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCupon = () => {
    if (!newCupon.codigo || !newCupon.valor) {
      setErrorMsg('Debes llenar el código y el valor.');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    const cuponGuardar = { ...newCupon, codigo: newCupon.codigo.toUpperCase().trim() };
    const currentCupones = config.cupones || [];
    const newConfig = { ...config, cupones: [...currentCupones, cuponGuardar] };
    setConfig(newConfig);
    saveChanges(newConfig);
    setShowCuponModal(false);
    setNewCupon({ codigo: '', tipo: 'porcentaje', valor: '' });
  };

  const handleDeleteCupon = (idx) => {
    const currentCupones = [...(config.cupones || [])];
    currentCupones.splice(idx, 1);
    const newConfig = { ...config, cupones: currentCupones };
    setConfig(newConfig);
    saveChanges(newConfig);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const MAX = 1200 // Banners can be larger
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

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingBanner(true)
    try {
      const compressed = await compressImage(file)
      const fileName = `banner-${Date.now()}.jpg`
      const filePath = `banners/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filePath, compressed, { contentType: 'image/jpeg', upsert: true })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath)

      handleUpdateConfig('banner_url', publicUrlData.publicUrl)
    } catch (error) {
      console.error('Error uploading banner:', error)
      setErrorMsg('Error al subir imagen: ' + error.message)
      setTimeout(() => setErrorMsg(null), 4000)
    } finally {
      setUploadingBanner(false)
    }
  }

  const copyLink = () => {
    const url = `https://${tienda?.subdominio}.tiendaonline.it`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const colorPresets = [
    '#2563EB', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#6366F1', '#111827', '#64748B'
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  // En producción usamos el subdominio real; en desarrollo la ruta interna /store/
  const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('tiendaonline.it')
  const storeVisitUrl = isProduction
    ? `https://${tienda?.subdominio}.tiendaonline.it`
    : `/store/${tienda?.subdominio}`
  // URL pública siempre con HTTPS para copiar y compartir con clientes
  const storeUrl = `https://${tienda?.subdominio}.tiendaonline.it`

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans">

      {showCuponModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4">
           <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
              <button 
                onClick={() => setShowCuponModal(false)} 
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
               >
                <X size={20} />
              </button>
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Tag size={24} className="text-purple-500" /> Cupones Activos
              </h2>
              
              <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 no-scrollbar mb-6">
                {(!config.cupones || config.cupones.length === 0) ? (
                   <div className="text-center text-slate-400 py-6 border-2 border-dashed border-slate-100 rounded-2xl">
                      <p className="text-sm font-medium">Aún no tienes cupones. Crea el primero.</p>
                   </div>
                ) : (
                   config.cupones.map((c, i) => (
                     <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div>
                           <div className="font-black text-slate-800 tracking-wider text-sm">{c.codigo}</div>
                           <div className="font-medium text-purple-600 text-xs">Descuento: {c.tipo === 'porcentaje' ? `${c.valor}%` : `€${c.valor}`}</div>
                        </div>
                        <button onClick={() => handleDeleteCupon(i)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors">
                           <Trash2 size={18} />
                        </button>
                     </div>
                   ))
                )}
              </div>

              <div className="border-t border-slate-100 pt-6">
                 <h3 className="font-bold text-slate-600 mb-4 text-sm">Añadir Nuevo Cupón</h3>
                 <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Código (ej. VERANO24)" 
                      value={newCupon.codigo}
                      onChange={e => setNewCupon({...newCupon, codigo: e.target.value.toUpperCase()})}
                      className="w-full bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-xl outline-none focus:border-purple-500 font-bold uppercase transition-colors text-sm"
                    />
                    <div className="flex gap-3">
                       <select 
                         value={newCupon.tipo} 
                         onChange={e => setNewCupon({...newCupon, tipo: e.target.value})}
                         className="bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-xl outline-none focus:border-purple-500 font-bold transition-colors text-sm w-1/2"
                       >
                         <option value="porcentaje">Porcentaje (%)</option>
                         <option value="monto">Descuento (fijo)</option>
                       </select>
                       <input 
                         type="number"
                         placeholder="Valor"
                         value={newCupon.valor}
                         onChange={e => setNewCupon({...newCupon, valor: e.target.value})}
                         className="w-1/2 bg-slate-50 border-2 border-slate-100 px-4 py-3 rounded-xl outline-none focus:border-purple-500 font-bold transition-colors text-sm"
                       />
                    </div>
                    <button 
                      onClick={handleSaveCupon}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 active:scale-95 mt-2"
                    >
                      Añadir Cupón
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <X size={18} className="shrink-0" />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Paintbrush className="text-blue-500" size={32} /> {dict.design || 'Diseño'}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">{dict.personalizaAspecto || 'Personaliza el aspecto de tu tienda pública.'}</p>
        </div>
        <a
          href={storeVisitUrl}
          target="_blank"
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 shrink-0"
        >
          <ExternalLink size={18} /> {dict.verEnOtraPestana || 'Ver Tienda'}
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Aesthetics */}
        <div className="lg:col-span-12 space-y-10">
          
          {/* 1. Publicar Catálogo Card */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 transition-all hover:shadow-md">
             <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className="text-blue-500 bg-blue-50 p-4 rounded-3xl">
                      <Share2 size={28} />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-800">{dict.publicarCatalogo || 'Publicar Tienda'}</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {config.publicado ? 'Tu catálogo está visible al público.' : 'Tu catálogo está oculto al público.'}
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-black uppercase tracking-widest ${config.publicado ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {config.publicado ? 'Online' : 'Offline'}
                  </span>
                  <button
                    onClick={() => handleUpdateConfig('publicado', !config.publicado)}
                    className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${config.publicado ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out ${config.publicado ? 'translate-x-[26px]' : 'translate-x-1'}`} />
                  </button>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* 2. Color Principal */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-2">
                 <Palette className="text-slate-400" size={24} />
                 <h3 className="text-xl font-bold text-slate-800">{dict.colorPrincipal || 'Color de Marca'}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-8">Elige el color que definirá la identidad visual de tu tienda.</p>
              
              <div className="flex flex-wrap gap-4 mb-auto">
                {colorPresets.map(color => (
                  <button 
                    key={color}
                    onClick={() => handleUpdateConfig('color_principal', color)}
                    style={{ backgroundColor: color }}
                    className={`w-12 h-12 rounded-2xl border-4 transition-all transform hover:scale-110 flex items-center justify-center ${config.color_principal === color ? 'border-slate-900 shadow-xl scale-110' : 'border-white hover:border-slate-100'}`}
                  >
                    {config.color_principal === color && <Check className="text-white" size={20} strokeWidth={3} />}
                  </button>
                ))}
                <button 
                  onClick={() => colorInputRef.current?.click()}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-400 via-indigo-500 to-emerald-400 p-[3px] transform hover:scale-110 transition-all shadow-md"
                >
                   <div className="bg-white w-full h-full rounded-[13px] flex items-center justify-center text-slate-400 font-black">+</div>
                </button>
                <input 
                  type="color" 
                  ref={colorInputRef}
                  className="hidden"
                  value={config.color_principal}
                  onChange={(e) => handleUpdateConfig('color_principal', e.target.value)}
                />
              </div>

              {/* Preview Box */}
              <div className="mt-10 bg-slate-50 rounded-[24px] p-8 border border-slate-100 relative overflow-hidden flex justify-center">
                 <div className="w-56 bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 space-y-4 relative z-10">
                    <div className="flex items-center gap-2">
                       <div className="w-4 h-4 rounded-full" style={{ background: config.color_principal }}></div>
                       <div className="w-16 h-3 rounded-full bg-slate-100"></div>
                    </div>
                    <div className="h-24 rounded-2xl w-full" style={{ backgroundColor: config.color_principal + '15' }}>
                       <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={40} style={{ color: config.color_principal + '50' }} />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="w-full h-2.5 rounded-full" style={{ background: config.color_principal + '20' }}></div>
                       <div className="w-3/4 h-2.5 rounded-full bg-slate-50"></div>
                    </div>
                    <div className="py-3 rounded-2xl text-center shadow-lg transition-colors" style={{ backgroundColor: config.color_principal }}>
                       <div className="w-12 h-2 bg-white/40 rounded-full mx-auto"></div>
                    </div>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: config.color_principal }}></div>
              </div>
            </div>

            {/* 3. Banner de Tienda */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-10 flex flex-col h-full">
               <div className="flex items-center gap-3 mb-2">
                  <ImageIcon className="text-slate-400" size={24} />
                  <h3 className="text-xl font-bold text-slate-800">{dict.bannerTienda || 'Banner Promocional'}</h3>
               </div>
               <p className="text-sm text-slate-500 mb-8">Sube una imagen impactante para la parte superior de tu tienda.</p>

               <div 
                 onClick={() => bannerInputRef.current?.click()}
                 className="relative aspect-[21/9] bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 group cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all overflow-hidden"
               >
                  {uploadingBanner ? (
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                  ) : config.banner_url ? (
                    <>
                      <img src={config.banner_url} className="w-full h-full object-cover" alt="Banner" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Camera className="text-white" size={32} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:text-blue-500 transition-colors">
                         <Upload size={24} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">{dict.subirFoto || 'Subir Foto'}</span>
                    </div>
                  )}
               </div>
               
               <input 
                 type="file" 
                 ref={bannerInputRef}
                 className="hidden" 
                 accept="image/*" 
                 onChange={handleBannerUpload} 
               />

               <div className="mt-6 flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Sujerido: 1200x500px (JPG/PNG)</p>
                  {config.banner_url && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUpdateConfig('banner_url', null); }}
                      className="text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-2"
                    >
                       <Trash2 size={14} /> {dict.borrarBanner || 'Eliminar'}
                    </button>
                  )}
               </div>
            </div>
          </div>

          {/* Catalog Layout & Behavior */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* 4. Modo de Exhibición */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-10">
              <div className="flex items-center gap-3 mb-2">
                 <LayoutTemplate className="text-slate-400" size={24} />
                 <h3 className="text-xl font-bold text-slate-800">{dict.modoExhibicion || 'Diseño de Productos'}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-8">Elige cómo se presentarán tus productos a los clientes.</p>
              
              <div className="space-y-3">
                {[
                  { id: 'lista', title: dict.modoLista, icon: Smartphone, color: 'bg-emerald-50 text-emerald-600' },
                  { id: 'cuadricula', title: dict.modoCuadricula, icon: Monitor, color: 'bg-blue-50 text-blue-600' },
                  { id: 'instaview', title: dict.modoInstaview, icon: Eye, color: 'bg-indigo-50 text-indigo-600' }
                ].map(mode => (
                  <button 
                    key={mode.id}
                    onClick={() => handleUpdateConfig('modo_exhibicion', mode.id)}
                    className={`w-full p-5 rounded-[24px] border-2 text-left transition-all flex items-center gap-5 group ${config.modo_exhibicion === mode.id ? 'border-slate-900 bg-slate-900 text-white shadow-xl' : 'border-slate-50 bg-slate-50 hover:border-slate-200'}`}
                  >
                    <div className={`p-3 rounded-2xl transition-colors ${config.modo_exhibicion === mode.id ? 'bg-white/10 text-white' : mode.color}`}>
                       <mode.icon size={24} />
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-base">{mode.title}</h4>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center ${config.modo_exhibicion === mode.id ? 'border-white/20' : 'border-slate-200'}`}>
                       {config.modo_exhibicion === mode.id && <div className="w-2 rounded-full bg-white h-2" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Comportamiento de Stock */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-10">
               <div className="flex items-center gap-3 mb-2">
                  <Settings2 className="text-slate-400" size={24} />
                  <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{dict.productosSinStock || 'Gestión de Agotados'}</h3>
               </div>
               <p className="text-sm text-slate-500 mb-8">Configura qué sucede cuando un producto no tiene stock disponible.</p>

               <div className="space-y-6">
                  {[
                    { id: 'ocultar', label: dict.noMostrarCatalogo, desc: 'Ocultar producto automáticamente.' },
                    { id: 'no_disponible', label: dict.mostrarNoDisponible, desc: 'Mostrar con badge de "Agotado".' },
                    { id: 'normal', label: dict.exhibirNormalmente, desc: 'Mostrar sin cambios (manual).' }
                  ].map(opt => (
                    <label key={opt.id} className="flex items-center justify-between cursor-pointer group bg-slate-50 p-6 rounded-3xl border border-transparent hover:border-slate-200 transition-all">
                      <div>
                        <span className={`text-base font-bold transition-colors ${config.mostrar_sin_stock === opt.id ? 'text-slate-900' : 'text-slate-500'}`}>
                           {opt.label}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                      </div>
                      <input 
                         type="radio" 
                         name="stock_behavior" 
                         checked={config.mostrar_sin_stock === opt.id}
                         onChange={() => handleUpdateConfig('mostrar_sin_stock', opt.id)}
                         className="w-6 h-6 text-blue-600 focus:ring-blue-500 border-slate-300 transition-all"
                      />
                    </label>
                  ))}
               </div>
            </div>

          </div>

          {/* 6. Otras Configuraciones Operativas */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-10">
              <div className="flex items-center gap-3 mb-2">
                <Settings2 className="text-slate-400" size={24} />
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{dict.otrasConfiguraciones || 'Configuraciones Operativas'}</h3>
              </div>
              <p className="text-sm text-slate-500 mb-8">Administra los pagos, envíos y canales de venta de tu negocio.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <Link href="/dashboard/ajustes/pagos" className="bg-slate-50 rounded-3xl p-6 border border-transparent hover:border-blue-500 hover:bg-blue-50/30 transition-all group cursor-pointer">
                  <div className="flex flex-col gap-4">
                    <div className="bg-white w-12 h-12 rounded-2xl shadow-sm text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{dict.opcionesPago || 'Opciones de Pago'}</h4>
                      <p className="text-[10px] font-medium text-slate-400 mt-1">Configura CBU, Alias o Efectivo.</p>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/ajustes/envios" className="bg-slate-50 rounded-3xl p-6 border border-transparent hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group cursor-pointer">
                  <div className="flex flex-col gap-4">
                    <div className="bg-white w-12 h-12 rounded-2xl shadow-sm text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Truck size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{dict.entregaRetirada || 'Entrega y Retiro'}</h4>
                      <p className="text-[10px] font-medium text-slate-400 mt-1">Zonas de envío y retiro en local.</p>
                    </div>
                  </div>
                </Link>

                <div 
                  onClick={() => setShowCuponModal(true)}
                  className="bg-slate-50 rounded-3xl p-6 border border-transparent hover:border-purple-500 hover:bg-purple-50/30 transition-all group cursor-pointer"
                >
                  <div className="flex flex-col gap-4">
                    <div className="bg-white w-12 h-12 rounded-2xl shadow-sm text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors relative">
                      <Tag size={24} />
                      {config.cupones?.length > 0 && (
                        <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
                          {config.cupones.length}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors">Cupones</h4>
                      <p className="text-[10px] font-medium text-slate-400 mt-1">Crea códigos de descuento.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 border border-transparent opacity-60 flex flex-col gap-4 grayscale">
                   <div className="bg-white w-12 h-12 rounded-2xl shadow-sm text-slate-400 flex items-center justify-center">
                    <Monitor size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-400">{dict.tarifasEstado || 'Tarifas y Estado'}</h4>
                    <p className="text-[10px] font-medium text-slate-300 mt-1">Estados de pedido personalizados.</p>
                  </div>
                </div>

              </div>
          </div>

          {/* Versions & More */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            
            {/* 6. Versión - Mini Card */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{dict.versionCatalogo || 'Versión'}</h3>
                  <p className="text-xs text-slate-400 mb-6">Optimización y rendimiento.</p>
                </div>
                
                <div className="flex p-1 bg-slate-100 rounded-2xl">
                   <button 
                     onClick={() => handleUpdateConfig('version_catalogo', 'nuevo')}
                     className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${config.version_catalogo === 'nuevo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     V. NUEVA
                   </button>
                   <button 
                     onClick={() => handleUpdateConfig('version_catalogo', 'clasico')}
                     className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${config.version_catalogo === 'clasico' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     V. CLÁSICA
                   </button>
                </div>
            </div>

            {/* Support Links */}
            <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl">
               <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Info size={24} /> {dict.precisaAjuda || '¿Necesitas ayuda con el diseño?'}
                  </h3>
                  <p className="text-blue-100 text-sm mb-6 max-w-sm">Si quieres una personalización avanzada o tu propio dominio, contacta con nuestro equipo.</p>
                  <button className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95">
                     Contactar Soporte
                  </button>
               </div>
               <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            </div>

          </div>

        </div>

      </div>

      {/* Floating Save Status */}
      {saving && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-300">
           <Loader2 className="animate-spin text-blue-400" size={24} />
           <span className="text-sm font-black uppercase tracking-widest">{dict.caricamento || 'Cargando...'}</span>
        </div>
      )}
    </div>
  )
}
