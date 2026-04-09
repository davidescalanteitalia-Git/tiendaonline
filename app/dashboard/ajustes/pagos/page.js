'use client'

import { useState, useEffect } from 'react'
import { useLang } from '../../../../components/LanguageProvider'
import { DICTIONARY } from '../../../../lib/dictionaries'
import { 
  CreditCard, 
  ChevronLeft, 
  Loader2, 
  Save, 
  CheckCircle2, 
  Banknote, 
  AlertCircle,
  Building2,
  Info
} from 'lucide-react'
import { supabase } from '../../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function PaginasPago() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Payment Config State
  const [config, setConfig] = useState({
    transferencia: {
      habilitado: false,
      alias: '',
      cbu: '',
      titular: '',
      banco: '',
      instrucciones: ''
    },
    efectivo: {
      habilitado: true,
      instrucciones: ''
    },
    mercado_pago: {
      habilitado: false,
      link: ''
    }
  })

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
      
      if (data.config_diseno?.pagos) {
        setConfig(data.config_diseno.pagos)
      }
    } catch (err) {
      console.error('Error fetching payment config:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Get current config_diseno to avoid overwriting visual settings
      const resGet = await fetch('/api/tienda', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      const currentData = await resGet.json()
      
      const newFullConfig = {
        ...(currentData.config_diseno || {}),
        pagos: config
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
      console.error('Error saving payment settings:', err)
    } finally {
      setSaving(false)
    }
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{dict.metodosDePago}</h1>
            <p className="text-slate-500 text-sm font-medium">Configura cómo tus clientes pagan sus pedidos.</p>
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

      <div className="grid grid-cols-1 gap-8">
        
        {/* 1. Transferencia Bancaria */}
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
                    <Building2 size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-800">{dict.transferenciaBancaria}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Directo a tu cuenta</p>
                 </div>
              </div>
              <button 
                onClick={() => setConfig({...config, transferencia: {...config.transferencia, habilitado: !config.transferencia.habilitado}})}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${config.transferencia.habilitado ? 'bg-blue-500' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out ${config.transferencia.habilitado ? 'translate-x-[26px]' : 'translate-x-1'}`} />
              </button>
           </div>
           
           {config.transferencia.habilitado && (
             <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{dict.aliasCbu}</label>
                      <input 
                        type="text" 
                        value={config.transferencia.cbu}
                        onChange={(e) => setConfig({...config, transferencia: {...config.transferencia, cbu: e.target.value}})}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold"
                        placeholder="CBU / IBAN / Alias"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Titular de la cuenta</label>
                      <input 
                        type="text" 
                        value={config.transferencia.titular}
                        onChange={(e) => setConfig({...config, transferencia: {...config.transferencia, titular: e.target.value}})}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold"
                        placeholder="Nombre completo"
                      />
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Banco</label>
                      <input 
                        type="text" 
                        value={config.transferencia.banco}
                        onChange={(e) => setConfig({...config, transferencia: {...config.transferencia, banco: e.target.value}})}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold"
                        placeholder="Nombre del banco"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{dict.instruccionesPago}</label>
                      <textarea 
                        rows="3"
                        value={config.transferencia.instrucciones}
                        onChange={(e) => setConfig({...config, transferencia: {...config.transferencia, instrucciones: e.target.value}})}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium resize-none text-sm"
                        placeholder="Escribe qué debe hacer el cliente luego de transferir..."
                      />
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* 2. Efectivo / Checkout */}
        <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
                    <Banknote size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-slate-800">{dict.pagosEnEfectivo}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Ideal para entregas locales</p>
                 </div>
              </div>
              <button 
                onClick={() => setConfig({...config, efectivo: {...config.efectivo, habilitado: !config.efectivo.habilitado}})}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${config.efectivo.habilitado ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition duration-300 ease-in-out ${config.efectivo.habilitado ? 'translate-x-[26px]' : 'translate-x-1'}`} />
              </button>
           </div>
           
           {config.efectivo.habilitado && (
             <div className="px-8 pb-8 animate-in slide-in-from-top-2">
                <div className="bg-slate-50 rounded-[28px] p-6 border border-slate-100">
                   <div className="flex gap-4 mb-4">
                      <Info className="text-blue-500 shrink-0" size={20} />
                      <p className="text-xs text-slate-500 leading-relaxed">
                         Al habilitar esta opción, el cliente podrá finalizar el pedido sin realizar un pago online previo. El acuerdo del pago se realizará en el momento de la entrega o retiro.
                      </p>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{dict.instruccionesPago}</label>
                      <input 
                        type="text" 
                        value={config.efectivo.instrucciones}
                        onChange={(e) => setConfig({...config, efectivo: {...config.efectivo, instrucciones: e.target.value}})}
                        className="w-full px-5 py-4 rounded-2xl border border-white bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-bold"
                        placeholder="Ej: Pago al recibir el pedido o al retirar en local"
                      />
                   </div>
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
