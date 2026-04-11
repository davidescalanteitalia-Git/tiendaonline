'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Loader2,
  PieChart,
  BarChart3,
  CreditCard
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function ReportesPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const res = await fetch('/api/reportes', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      if (res.ok) {
         setData(await res.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 mt-20">
           <Loader2 size={48} className="animate-spin text-blue-500" />
           <p className="font-bold">Calculando métricas y finanzas...</p>
        </div>
     )
  }

  if (!data) return null

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div>
         <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight mb-2">
            <PieChart size={32} className="text-blue-600" /> Reportes y Finanzas
         </h1>
         <p className="text-slate-500 font-medium">Análisis en tiempo real de la rentabilidad de tu negocio.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {/* Ventas Totales */}
         <div className="bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-[20px] flex items-center justify-center">
               <DollarSign size={24} />
            </div>
            <div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Ventas Brutas</p>
               <h3 className="text-3xl font-black text-slate-800">€{data.ventasTotales.toFixed(2)}</h3>
            </div>
         </div>

         {/* Utilidad Neta */}
         <div className="bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 rounded-full blur-3xl group-hover:bg-emerald-100 transition-colors"></div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-[20px] flex items-center justify-center relative z-10">
               <TrendingUp size={24} />
            </div>
            <div className="relative z-10">
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Utilidad Neta</p>
               <h3 className="text-3xl font-black text-emerald-500">€{data.utilidadNeta.toFixed(2)}</h3>
               <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-50 inline-block px-2 py-1 rounded-lg">
                 {data.margen.toFixed(1)}% Margen
               </p>
            </div>
         </div>

         {/* Costos */}
         <div className="bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-[20px] flex items-center justify-center">
               <BarChart3 size={24} />
            </div>
            <div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Costo de Inversión</p>
               <h3 className="text-3xl font-black text-rose-500">€{data.costoTotal.toFixed(2)}</h3>
            </div>
         </div>

         {/* Fiado Total */}
         <div className="bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-[20px] flex items-center justify-center">
               <CreditCard size={24} />
            </div>
            <div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Ventas en Fiado</p>
               <h3 className="text-3xl font-black text-amber-500">€{data.fiadoTotal.toFixed(2)}</h3>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Top Productos */}
         <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-2 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                 <Package className="text-blue-500" /> Top Productos Vendidos
               </h2>
               <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{data.topProductos.length} encontrados</span>
            </div>
            <div className="p-4">
               {data.topProductos.length === 0 ? (
                 <div className="p-8 text-center text-slate-400 font-bold">No hay suficientes datos.</div>
               ) : (
                 <div className="space-y-2">
                    {data.topProductos.map((prod, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                               {prod.emoji || '📦'}
                            </div>
                            <div>
                               <h4 className="font-bold text-slate-800">{prod.nombre}</h4>
                               <p className="text-sm font-medium text-slate-500">{prod.qty} unidades vendidas</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos</p>
                            <p className="text-lg font-black text-slate-800">€{prod.ingresos.toFixed(2)}</p>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
         </div>

         {/* Resumen extra */}
         <div className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="relative z-10">
               <h2 className="text-2xl font-black mb-2 text-white">Resumen Operativo</h2>
               <p className="text-slate-400 font-medium">Volumen de trabajo registrado en el sistema.</p>
            </div>

            <div className="relative z-10 mt-12 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
               <ShoppingCart size={32} className="text-blue-400 mb-4" />
               <p className="text-slate-300 font-bold text-sm uppercase tracking-widest mb-1">Total Pedidos Completados</p>
               <h3 className="text-5xl font-black">{data.totalPedidos}</h3>
            </div>
         </div>
      </div>

    </div>
  )
}
