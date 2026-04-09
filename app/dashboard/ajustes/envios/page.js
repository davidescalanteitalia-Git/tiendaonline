'use client'

import { useState, useEffect } from 'react'
import { useLang } from '../../../../components/LanguageProvider'
import { DICTIONARY } from '../../../../lib/dictionaries'
import { 
  Truck, 
  ChevronLeft, 
  Loader2, 
  Save, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  Trash2,
  Store,
  Info
} from 'lucide-react'
import { supabase } from '../../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function PaginasEnvio() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Shipping Config State
  const [config, setConfig] = useState({
    retiro: {
      habilitado: true,
      direccion: '',
      instrucciones: ''
    },
    domicilio: {
      habilitado: false,
      zonas: [] // Array of { nombre: '', costo: 0 }
    }
  })

  // Local state for new zone
  const [newZoneName, setNewZoneName] = useState('')
  const [newZoneCost, setNewZoneCost] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [])

  async function fetchConfig() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/tienda', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      const data = await res.json()
      
      if (data.config_diseno?.envios) {
        setConfig(data.config_diseno.envios)
      }
    } catch (err) {
      console.error('Error fetching shipping config:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const resGet = await fetch('/api/tienda', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      const currentData = await resGet.json()
      
      const newFullConfig = {
        ...(currentData.config_diseno || {}),
        envios: config
      }

      const res = await fetch('/api/tienda', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ config_diseno: newFullConfig })
      })

      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error('Error saving shipping settings:', err)
    } finally {
      setSaving(false)
    }
  }

  const addZone = () => {
    if (!newZoneName.trim() || !newZoneCost) return
    const newZone = { 
      id: Date.now(),
      nombre: newZoneName, 
      costo: parseFloat(newZoneCost) 
    }
    setConfig({
      ...config,
      domicilio: {
        ...config.domicilio,
        zonas: [...config.domicilio.zonas, newZone]
      }
    })
    setNewZoneName('')
    setNewZoneCost('')
  }

  const removeZone = (id) => {
    setConfig({
      ...config,
      domicilio: {
        ...config.domicilio,
        zonas: config.domicilio.zonas.filter(z => z.id !== id)
      }
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
       <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  )

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8 font-sans animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-500"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{dict.configuraEnvios}</h1>
            <p className="text-slate-500 text-sm font-medium">Gestiona cómo entregas tus productos a los clientes.</p>
          </div>
        </div>
        <button 
           onClick={handleSave}
           disabled={saving}
           className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl active:scale-95 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
          {dict.salvare}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10">
        
        {/* 1. Retiro en Local */}
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
                    <Store size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-800">{dict.retiroEnLocal}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Sin costo para el cliente</p>
                 </div>
              </div>
              <button 
                onClick={() => setConfig({...config, retiro: {...config.retiro, habilitado: !config.retiro.habilitado}})}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${config.retiro.habilitado ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out ${config.retiro.habilitado ? 'translate-x-[26px]' : 'translate-x-1'}`} />
              </button>
           </div>
           
           {config.retiro.habilitado && (
             <div className="p-8 space-y-6 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Dirección de retiro</label>
                   <input 
                     type="text" 
                     value={config.retiro.direccion}
                     onChange={(e) => setConfig({...config, retiro: {...config.retiro, direccion: e.target.value}})}
                     className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-bold"
                     placeholder="Ej: Calle Falsa 123, Ciudad"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Instrucciones / Horarios</label>
                   <textarea 
                     rows="2"
                     value={config.retiro.instrucciones}
                     onChange={(e) => setConfig({...config, retiro: {...config.retiro, instrucciones: e.target.value}})}
                     className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-medium resize-none text-sm"
                     placeholder="Escribe los horarios en los que el cliente puede retirar..."
                   />
                </div>
             </div>
           )}
        </div>

        {/* 2. Envío a Domicilio */}
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
                    <Truck size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-800">{dict.envioADomicilio}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Añade costos por zona</p>
                 </div>
              </div>
              <button 
                onClick={() => setConfig({...config, domicilio: {...config.domicilio, habilitado: !config.domicilio.habilitado}})}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${config.domicilio.habilitado ? 'bg-blue-500' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out ${config.domicilio.habilitado ? 'translate-x-[26px]' : 'translate-x-1'}`} />
              </button>
           </div>
           
           {config.domicilio.habilitado && (
             <div className="p-8 space-y-8 animate-in slide-in-from-top-2">
                
                {/* Add Zone area */}
                <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Añadir Nueva Zona</p>
                   <div className="flex flex-col md:flex-row gap-4">
                      <input 
                        type="text" 
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                        className="flex-[2] px-5 py-3.5 rounded-2xl border border-white bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-sm"
                        placeholder="Nombre de la zona (ej: Microcentro)"
                      />
                      <input 
                        type="number" 
                        value={newZoneCost}
                        onChange={(e) => setNewZoneCost(e.target.value)}
                        className="flex-1 px-5 py-3.5 rounded-2xl border border-white bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-black text-sm text-center"
                        placeholder="Costo €"
                      />
                      <button 
                        onClick={addZone}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-3.5 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                      >
                         <Plus size={24} />
                      </button>
                   </div>
                </div>

                {/* Zones List */}
                <div className="space-y-4">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Zonas Configuradas</p>
                   {config.domicilio.zonas.length === 0 ? (
                     <div className="py-10 border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center opacity-40">
                        <MapPin size={32} className="text-slate-200 mb-2" />
                        <p className="text-xs font-bold uppercase tracking-tight">No hay zonas configuradas</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {config.domicilio.zonas.map((zona) => (
                           <div key={zona.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between group hover:border-blue-200 transition-colors">
                              <div className="flex items-center gap-4">
                                 <div className="bg-blue-50 text-blue-500 p-2.5 rounded-xl">
                                    <MapPin size={18} />
                                 </div>
                                 <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{zona.nombre}</h4>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase">Costo: €{zona.costo.toFixed(2)}</p>
                                 </div>
                              </div>
                              <button 
                                onClick={() => removeZone(zona.id)}
                                className="text-slate-300 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 transition-all"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        ))}
                     </div>
                   )}
                </div>

             </div>
           )}
        </div>

      </div>

      {saved && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-8 duration-300">
           <div className="bg-emerald-500 p-1 rounded-full">
            <CheckCircle2 size={16} />
           </div>
           <span className="font-bold text-sm tracking-wide">{dict.configuracionGuardada}</span>
        </div>
      )}
    </div>
  )
}
