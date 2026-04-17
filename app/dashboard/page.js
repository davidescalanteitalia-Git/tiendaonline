'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../components/LanguageProvider'
import { DICTIONARY } from '../../lib/dictionaries'
import {
  ShoppingCart, Package, CheckCircle2, Clock, XCircle,
  TrendingUp, Copy, ExternalLink, ArrowRight, Plus,
  ShoppingBag, Store, Zap, Users, ChevronRight,
  ShieldCheck, Settings, Palette, CreditCard, Truck, Loader2
} from 'lucide-react'
import Link from 'next/link'
import OnboardingWizard from '../../components/OnboardingWizard'
import DashboardChecklist from '../../components/DashboardChecklist'

export default function DashboardPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']

  const [tienda, setTienda] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [productos, setProductos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const headers = { Authorization: `Bearer ${session.access_token}` }

        // Fetch en paralelo
        const [meRes, pedidosRes, productosRes, clientesRes] = await Promise.all([
          fetch('/api/me', { headers }),
          fetch('/api/pedidos', { headers }),
          fetch('/api/productos', { headers }),
          fetch('/api/clientes', { headers }),
        ])

        let loadedTienda = null
        let loadedProductos = []

        if (meRes.ok) {
          const json = await meRes.json()
          loadedTienda = json.tienda || null
          setTienda(loadedTienda)
        }
        if (pedidosRes.ok) {
          const json = await pedidosRes.json()
          setPedidos(json.pedidos || [])
        }
        if (productosRes.ok) {
          const json = await productosRes.json()
          loadedProductos = Array.isArray(json) ? json : []
          setProductos(loadedProductos)
        }
        if (clientesRes.ok) {
          const json = await clientesRes.json()
          setClientes(Array.isArray(json) ? json : [])
        }

        // Mostrar wizard si algún paso de onboarding no está completado
        // y el usuario no lo ha descartado en esta sesión
        const wizardDismissed = sessionStorage.getItem('onboarding_dismissed')
        if (!wizardDismissed) {
          const cfg = loadedTienda?.config_diseno || {}
          const hasPayment = !!cfg.pagos && Object.keys(cfg.pagos).some(k => cfg.pagos[k]?.habilitado)
          const hasProduct = loadedProductos.length > 0
          if (!hasPayment || !hasProduct) {
            setShowWizard(true)
          }
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Siempre usamos el subdominio real — funciona en producción y en desarrollo vía /store/
  const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('tiendaonline.it')
  const storeUrl = tienda?.subdominio
    ? isProduction
      ? `https://${tienda.subdominio}.tiendaonline.it`
      : `/store/${tienda.subdominio}`
    : null
  // URL pública siempre con HTTPS para copiar y compartir con clientes
  const storePublicUrl = tienda?.subdominio
    ? `https://${tienda.subdominio}.tiendaonline.it`
    : null

  const copyLink = () => {
    if (!storePublicUrl) return
    navigator.clipboard.writeText(storePublicUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // ─── Stats calculadas ───
  const pendientes = pedidos.filter(p => p.estado === 'pendiente').length
  const totalVentas = pedidos
    .filter(p => p.estado !== 'cancelado')
    .reduce((acc, p) => acc + (parseFloat(p.total) || 0), 0)
  const productosActivos = productos.filter(p => p.estado === 'activo').length
  const recentPedidos = pedidos.slice(0, 4)

  // KPI Clientes: porcentaje de clientes sin deuda pendiente (al día)
  const totalClientes = clientes.length
  const clientesAlDia = clientes.filter(c => parseFloat(c.deuda_actual || 0) === 0).length
  const lealtadPct = totalClientes > 0 ? Math.round((clientesAlDia / totalClientes) * 100) : 0

  // ─── Operational Checklist ───
  const config = tienda?.config_diseno || {}

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Inizializzazione Command Center...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-700">

      {/* ── Onboarding Wizard ── */}
      {showWizard && (
        <OnboardingWizard
          tienda={tienda}
          productos={productos}
          onDismiss={() => {
            sessionStorage.setItem('onboarding_dismissed', '1')
            setShowWizard(false)
          }}
        />
      )}

      {/* ── 1. Hero / Header ── */}
      <div className="max-w-7xl mx-auto">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-2">
                 <Store className="text-blue-500" size={32} /> Centro de Comando
               </h1>
               <p className="text-slate-500 font-medium">Gestione operativa di {tienda?.nombre || 'la tua attività'}</p>
            </div>
            
            <div className="flex items-center gap-4">
               {/* Store Link Card */}
               <div className="bg-white rounded-3xl border border-slate-200 p-2 pl-4 pr-2 flex items-center gap-4 shadow-sm">
                  <span className="text-xs font-mono font-bold text-slate-400">{tienda?.subdominio}.tiendaonline...</span>
                  <button 
                    onClick={copyLink}
                    className={`p-2.5 rounded-2xl transition-all ${copiedLink ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                     {copiedLink ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  </button>
                  <a
                    href={storeUrl || '#'}
                    target="_blank"
                    className="p-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                     <ExternalLink size={18} />
                  </a>
               </div>
            </div>
         </div>

         {/* Stats Row */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
               <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ventas Totales</p>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">€{totalVentas.toFixed(2)}</h3>
               </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
               <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pedidos Pendientes</p>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{pendientes}</h3>
               </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Package size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Activo</p>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{productosActivos} items</h3>
               </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
               <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clientes al Día</p>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                    {totalClientes === 0 ? '—' : `${lealtadPct}%`}
                  </h3>
                  {totalClientes > 0 && (
                    <p className="text-[10px] text-slate-400 font-bold mt-1">{clientesAlDia} de {totalClientes}</p>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* ── 2. Content Sections ── */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
         
         {/* Left Side: Analytics & Support */}
         <div className="lg:col-span-1 space-y-10">
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
               <div className="relative">
                  <h3 className="text-lg font-black text-slate-800 mb-2">Ayuda & Soporte</h3>
                  <p className="text-slate-400 text-sm font-medium mb-6">¿Tienes dudas con tu configuración o necesitas funciones extra?</p>
                  <a 
                    href="https://wa.me/393751239515" 
                    target="_blank"
                    className="flex justify-center items-center gap-2 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-sm transition-all active:scale-95"
                  >
                     Hablar con un experto
                  </a>
               </div>
            </div>
         </div>

         {/* Right Side: Recent Activity & Orders */}
         <div className="lg:col-span-2 space-y-10">
            {/* Quick Actions Bar */}
            <div className="bg-white rounded-[40px] p-4 border border-slate-100 shadow-sm flex items-center gap-4 overflow-x-auto no-scrollbar">
               <Link href="/dashboard/productos" className="flex items-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-700 rounded-[28px] font-black text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all shrink-0">
                  <Plus size={18} /> Nuevo Producto
               </Link>
               <Link href="/dashboard/pedidos" className="flex items-center gap-3 px-6 py-4 bg-blue-50 text-blue-700 rounded-[28px] font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all shrink-0">
                  <ShoppingCart size={18} /> Ver Pedidos
               </Link>
               <Link href="/dashboard/diseno" className="flex items-center gap-3 px-6 py-4 bg-slate-50 text-slate-700 rounded-[28px] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shrink-0">
                  <Settings size={18} /> Panel Ajustes
               </Link>
            </div>

            {/* Recent Orders List */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
               <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between">
                  <div>
                     <h3 className="text-xl font-black text-slate-800 tracking-tight">Actividad Reciente</h3>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Últimas 4 Órdenes</p>
                  </div>
                  <Link href="/dashboard/pedidos" className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all">
                     <ArrowRight size={20} />
                  </Link>
               </div>

               {recentPedidos.length === 0 ? (
                 <div className="py-20 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-[28px] bg-slate-50 text-slate-200 flex items-center justify-center mb-4">
                       <ShoppingBag size={32} />
                    </div>
                    <p className="text-slate-400 font-bold text-sm">Esperando tu primer venta...</p>
                 </div>
               ) : (
                 <div className="divide-y divide-slate-50">
                    {recentPedidos.map((p, idx) => (
                      <Link 
                        key={p.id} 
                        href="/dashboard/pedidos"
                        className="flex items-center justify-between p-8 hover:bg-blue-50/20 transition-all group"
                      >
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-xs group-hover:from-blue-100 group-hover:to-blue-600 group-hover:text-white transition-all">
                               {p.codigo.replace('#', '')}
                            </div>
                            <div>
                               <h4 className="font-black text-slate-800 text-sm mb-1">{p.cliente_nombre}</h4>
                               <div className="flex items-center gap-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    p.estado === 'confirmado' 
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                    : 'bg-amber-50 border-amber-100 text-amber-600'
                                  }`}>
                                     {p.estado}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                     {new Date(p.created_at).toLocaleDateString()}
                                  </span>
                               </div>
                            </div>
                         </div>

                         <div className="text-right">
                            <p className="font-black text-slate-800 tracking-tight">€{parseFloat(p.total).toFixed(2)}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Detalles</span>
                               <ChevronRight size={12} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                            </div>
                         </div>
                      </Link>
                    ))}
                 </div>
               )}

               {/* Footer with Banner */}
               <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full"></div>
                  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div>
                        <h4 className="text-lg font-black tracking-tight mb-1">¡Impulsa tus Ventas! 🚀</h4>
                        <p className="text-blue-100 text-sm opacity-80 max-w-sm font-medium">Conecta tu catálogo con Instagram y WhatsApp para automatizar tus pedidos al 100%.</p>
                     </div>
                     <button className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/20">
                        Tutorial Pro
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
