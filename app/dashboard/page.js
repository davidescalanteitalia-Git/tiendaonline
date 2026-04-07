'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../components/LanguageProvider'
import { DICTIONARY } from '../../lib/dictionaries'
import { Eye, Smartphone, Package as PackageIcon, Copy, ExternalLink, MessageCircle, CheckCircle, Store } from 'lucide-react'

export default function DashboardPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']

  const [tienda, setTienda] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const json = await res.json()
        setTienda(json.tienda || null)
      }
      setLoading(false)
    }
    load()
  }, [])

  const storeUrl = tienda?.subdominio
    ? `https://${tienda.subdominio}.tiendaonline.it`
    : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/40 rounded-full"></div>
          <div className="w-4 h-4 bg-primary/40 rounded-full animation-delay-200"></div>
          <div className="w-4 h-4 bg-primary/40 rounded-full animation-delay-400"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
          {dict.bienvenido}{tienda?.nombre ? `, ${tienda.nombre}` : ''} 👋
        </h1>
        <p className="text-slate-500">
          {dict.resumenGeneral}
        </p>
      </div>

      {/* Store URL Banner */}
      {storeUrl && (
        <div className="bg-white/80 backdrop-blur-lg border border-primary/20 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 font-semibold text-primary mb-1">
              <Store size={18} />
              {dict.tiendaOnline}
            </div>
            <div className="text-slate-800 font-mono text-lg font-medium">
              {tienda.subdominio}.tiendaonline.it
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(storeUrl)
                alert(dict.enlaceCopiado)
              }}
              className="px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
            >
              <Copy size={16} /> {dict.copiar}
            </button>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <ExternalLink size={16} /> {dict.abrir}
            </a>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: dict.visitasHoy,      value: '—', icon: Eye,         color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100'   },
          { label: dict.pedidosNuevos,   value: '—', icon: Smartphone,  color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100'  },
          { label: dict.productosActivos,value: '—', icon: PackageIcon, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${stat.bg} ${stat.color} ${stat.border}`}>
                <Icon size={24} />
              </div>
              <div className="text-slate-500 text-sm font-medium mb-1">{stat.label}</div>
              <div className="text-3xl font-bold text-slate-800 font-mono tracking-tight">{stat.value}</div>
            </div>
          )
        })}
      </div>

      {/* Next steps */}
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-6">{dict.proximosPasos}</h2>

        <div className="flex items-start gap-4 pb-6 border-b border-slate-100 mb-6">
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle size={18} />
          </div>
          <div>
            <div className="font-semibold text-slate-800 mb-1">{dict.creatuCuenta}</div>
            <div className="text-slate-500 text-sm">{dict.cuentaRegistrada}</div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 text-slate-400 flex items-center justify-center font-bold text-sm shrink-0">
            2
          </div>
          <div>
            <div className="font-semibold text-slate-800 mb-1">{dict.añadePrimerProducto}</div>
            <div className="text-slate-500 text-sm mb-4">{dict.añadePrimerProductoDesc}</div>
            <a
              href="/dashboard/productos"
              className="inline-flex items-center bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {dict.nuevoProducto}
            </a>
          </div>
        </div>
      </div>

      {/* WhatsApp share */}
      {storeUrl && (
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
          <div className="absolute -right-8 -top-8 text-white/10">
            <MessageCircle size={120} />
          </div>
          <div className="relative z-10">
            <div className="font-bold text-xl mb-2 flex items-center gap-2">
              <MessageCircle size={24} />
              {dict.comparteTienda}
            </div>
            <div className="text-emerald-50 mb-6 max-w-md">
              {dict.comparteTiendaDesc}
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${dict.ordenarEnMiTienda} ${storeUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-emerald-600 hover:bg-emerald-50 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] transform hover:-translate-y-0.5"
            >
              <MessageCircle size={18} /> {dict.enviarMensaje}
            </a>
          </div>
        </div>
      )}

    </div>
  )
}
