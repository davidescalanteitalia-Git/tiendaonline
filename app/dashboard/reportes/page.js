'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Loader2,
  PieChart,
  BarChart3,
  CreditCard,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

// --- Rangos de fecha predefinidos ---
const RANGOS = [
  { label: 'Hoy',         key: 'hoy' },
  { label: 'Esta semana', key: 'semana' },
  { label: 'Este mes',    key: 'mes' },
  { label: 'Este año',    key: 'anio' },
  { label: 'Todo',        key: 'todo' },
]

function getRangoDates(key) {
  const now = new Date()
  const hoy = now.toISOString().slice(0, 10)

  if (key === 'hoy') return { desde: hoy, hasta: hoy }

  if (key === 'semana') {
    const d = new Date(now)
    d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1)) // Lunes
    return { desde: d.toISOString().slice(0, 10), hasta: hoy }
  }

  if (key === 'mes') {
    const d = new Date(now.getFullYear(), now.getMonth(), 1)
    return { desde: d.toISOString().slice(0, 10), hasta: hoy }
  }

  if (key === 'anio') {
    const d = new Date(now.getFullYear(), 0, 1)
    return { desde: d.toISOString().slice(0, 10), hasta: hoy }
  }

  return { desde: null, hasta: null }
}

// --- Componente Gráfico de Barras (sin librerías externas) ---
function GraficoBarras({ datos }) {
  if (!datos || datos.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm font-medium">
        No hay datos para mostrar en este período.
      </div>
    )
  }

  const maxVal = Math.max(...datos.map(d => d.total), 1)

  const formatFecha = (fecha) => {
    const [, mes, dia] = fecha.split('-')
    return `${dia}/${mes}`
  }

  // Si hay muchos días, mostrar solo algunos labels
  const step = datos.length > 14 ? Math.ceil(datos.length / 7) : 1

  return (
    <div className="flex items-end gap-1 h-40 w-full pt-2">
      {datos.map((d, idx) => {
        const height = Math.max((d.total / maxVal) * 100, 2)
        const showLabel = idx % step === 0 || idx === datos.length - 1
        return (
          <div key={d.fecha} className="flex flex-col items-center flex-1 group relative" style={{ minWidth: 0 }}>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
              {formatFecha(d.fecha)}: €{d.total.toFixed(2)}
            </div>
            {/* Barra */}
            <div
              className="w-full rounded-t-md transition-all duration-500 group-hover:opacity-80"
              style={{
                height: `${height}%`,
                background: 'linear-gradient(to top, #2563EB, #60a5fa)',
                minHeight: '4px',
              }}
            />
            {/* Label fecha */}
            {showLabel && (
              <span className="text-[9px] text-slate-400 mt-1 font-medium truncate w-full text-center">
                {formatFecha(d.fecha)}
              </span>
            )}
            {!showLabel && <span className="text-[9px] mt-1 opacity-0">·</span>}
          </div>
        )
      })}
    </div>
  )
}

export default function ReportesPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rangoActivo, setRangoActivo] = useState('mes')

  const loadData = useCallback(async (rangoKey) => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { desde, hasta } = getRangoDates(rangoKey)
      let url = '/api/reportes'
      const params = new URLSearchParams()
      if (desde) params.set('desde', desde)
      if (hasta) params.set('hasta', hasta)
      if (params.toString()) url += `?${params.toString()}`

      const res = await fetch(url, {
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
  }, [])

  useEffect(() => {
    loadData(rangoActivo)
  }, [loadData, rangoActivo])

  const handleRango = (key) => {
    setRangoActivo(key)
  }

  const rangoLabel = RANGOS.find(r => r.key === rangoActivo)?.label || 'Este mes'

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">

      {/* Header con selector de rango */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight mb-1">
            <PieChart size={32} className="text-blue-600" /> Reportes y Finanzas
          </h1>
          <p className="text-slate-500 font-medium">Análisis de rentabilidad de tu negocio.</p>
        </div>

        {/* Selector de rango de fechas */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm flex-wrap">
          {RANGOS.map(rango => (
            <button
              key={rango.key}
              onClick={() => handleRango(rango.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                rangoActivo === rango.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {rango.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
          <Loader2 size={48} className="animate-spin text-blue-500" />
          <p className="font-bold">Calculando métricas…</p>
        </div>
      ) : !data ? null : (
        <>
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
                <p className="text-xs text-slate-400 mt-1 font-medium">{rangoLabel}</p>
              </div>
            </div>

            {/* Utilidad Neta */}
            <div className="bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 rounded-full blur-3xl group-hover:bg-emerald-100 transition-colors" />
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-[20px] flex items-center justify-center relative z-10">
                <TrendingUp size={24} />
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Utilidad Neta</p>
                <h3 className={`text-3xl font-black ${data.utilidadNeta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  €{data.utilidadNeta.toFixed(2)}
                </h3>
                <p className={`text-xs font-bold mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg ${
                  data.margen >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                }`}>
                  {data.margen >= 0
                    ? <ArrowUpRight size={12} />
                    : <ArrowDownRight size={12} />
                  }
                  {Math.abs(data.margen).toFixed(1)}% Margen
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

          {/* Gráfico de ventas por día */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Calendar size={22} className="text-blue-500" /> Evolución de Ventas
              </h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
                {rangoLabel}
              </span>
            </div>
            <div className="p-8">
              <GraficoBarras datos={data.graficoDias} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Productos */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-2 overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Package className="text-blue-500" /> Top Productos Vendidos
                </h2>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                  {data.topProductos.length} productos
                </span>
              </div>
              <div className="p-4">
                {data.topProductos.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 font-bold">
                    No hay ventas en este período.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.topProductos.map((prod, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform font-black text-slate-400">
                            {idx + 1}
                          </div>
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">
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

            {/* Resumen Operativo */}
            <div className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />

              <div className="relative z-10">
                <h2 className="text-2xl font-black mb-2 text-white">Resumen Operativo</h2>
                <p className="text-slate-400 font-medium">Volumen de trabajo registrado.</p>
              </div>

              <div className="relative z-10 mt-12 space-y-4">
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                  <ShoppingCart size={28} className="text-blue-400 mb-3" />
                  <p className="text-slate-300 font-bold text-sm uppercase tracking-widest mb-1">Pedidos Completados</p>
                  <h3 className="text-4xl font-black">{data.totalPedidos}</h3>
                </div>

                {data.totalPedidos > 0 && (
                  <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                    <DollarSign size={28} className="text-emerald-400 mb-3" />
                    <p className="text-slate-300 font-bold text-sm uppercase tracking-widest mb-1">Ticket Promedio</p>
                    <h3 className="text-4xl font-black">
                      €{(data.ventasTotales / data.totalPedidos).toFixed(2)}
                    </h3>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
