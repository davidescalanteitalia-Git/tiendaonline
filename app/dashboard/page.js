'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../components/LanguageProvider'
import { DICTIONARY } from '../../lib/dictionaries'
import {
  ShoppingCart, Package, CheckCircle2, Clock, XCircle,
  TrendingUp, Copy, ExternalLink, ArrowRight, Plus,
  ShoppingBag, Store, Zap, Users, ChevronRight
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']

  const [tienda, setTienda] = useState(null)
  const [pedidos, setPedidos] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const headers = { Authorization: `Bearer ${session.access_token}` }

      // Fetch en paralelo
      const [meRes, pedidosRes, productosRes] = await Promise.all([
        fetch('/api/me', { headers }),
        fetch('/api/pedidos', { headers }),
        fetch('/api/productos', { headers }),
      ])

      if (meRes.ok) {
        const json = await meRes.json()
        setTienda(json.tienda || null)
      }
      if (pedidosRes.ok) {
        const json = await pedidosRes.json()
        setPedidos(json.pedidos || [])
      }
      if (productosRes.ok) {
        const json = await productosRes.json()
        setProductos(Array.isArray(json) ? json : [])
      }

      setLoading(false)
    }
    load()
  }, [])

  const storeUrl = tienda?.subdominio
    ? `https://${tienda.subdominio}.tiendaonline.it`
    : null

  const copyLink = () => {
    if (!storeUrl) return
    navigator.clipboard.writeText(storeUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // ─── Stats calculadas en tiempo real ───
  const pendientes = pedidos.filter(p => p.estado === 'pendiente').length
  const confirmados = pedidos.filter(p => p.estado === 'confirmado').length
  const cancelados = pedidos.filter(p => p.estado === 'cancelado').length
  const totalVentas = pedidos
    .filter(p => p.estado !== 'cancelado')
    .reduce((acc, p) => acc + (parseFloat(p.total) || 0), 0)
  const productosActivos = productos.filter(p => p.activo !== false).length
  const recentPedidos = pedidos.slice(0, 5)

  const aceptarPedidos = tienda?.aceptar_pedidos ?? true

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-emerald-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  const STATS = [
    {
      label: 'Pedidos pendientes',
      value: pendientes,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      ring: 'ring-amber-200',
      href: '/dashboard/pedidos',
    },
    {
      label: 'Confirmados hoy',
      value: confirmados,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      ring: 'ring-emerald-200',
      href: '/dashboard/pedidos',
    },
    {
      label: 'Ingresos totales',
      value: `€${totalVentas.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      ring: 'ring-blue-200',
      href: '/dashboard/pedidos',
    },
    {
      label: 'Productos activos',
      value: productosActivos,
      icon: Package,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      ring: 'ring-violet-200',
      href: '/dashboard/productos',
    },
  ]

  const STATUS_CONFIG = {
    pendiente:   { label: 'Pendiente',   color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
    confirmado:  { label: 'Confirmado',  color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    cancelado:   { label: 'Cancelado',   color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200' },
  }

  const ACCIONES_RAPIDAS = [
    { icon: Plus,          label: 'Nuevo producto',  href: '/dashboard/productos',  color: 'bg-slate-900 text-white hover:bg-slate-700' },
    { icon: ShoppingCart,  label: 'Ver pedidos',     href: '/dashboard/pedidos',    color: 'bg-emerald-500 text-white hover:bg-emerald-600' },
    { icon: Store,         label: 'Abrir mi tienda', href: storeUrl || '#', external: true, color: 'bg-blue-500 text-white hover:bg-blue-600' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">

      {/* ── Greeting Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            ¡Hola, {tienda?.nombre || 'bienvenido'} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Resumen de tu negocio en tiempo real
          </p>
        </div>

        {/* Estado de tienda */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border shadow-sm
          ${aceptarPedidos
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
          <span className={`w-2 h-2 rounded-full ${aceptarPedidos ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          {aceptarPedidos ? 'Tienda abierta' : 'Tienda cerrada'}
        </div>
      </div>

      {/* ── Link de la Tienda ── */}
      {storeUrl && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Store size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tu tienda online</p>
              <p className="text-sm font-mono font-medium text-slate-800">{tienda.subdominio}.tiendaonline.it</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                ${copiedLink
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
            >
              {copiedLink ? <CheckCircle2 size={15} /> : <Copy size={15} />}
              {copiedLink ? '¡Copiado!' : 'Copiar link'}
            </button>
            <a
              href={`/store/${tienda.subdominio}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-blue-200"
            >
              <ExternalLink size={15} /> Ver tienda
            </a>
          </div>
        </div>
      )}

      {/* ── Stats en tiempo real ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Link
              key={i}
              href={stat.href}
              className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm hover:shadow-md transition-all group cursor-pointer`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color} ${stat.border} border`}>
                <Icon size={20} />
              </div>
              <div className="text-2xl font-bold text-slate-800 font-mono mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
                {stat.label}
                <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* ── Acciones Rápidas + Pedidos Recientes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
            <Zap size={16} className="text-amber-500" /> Acciones rápidas
          </h2>
          <div className="flex flex-col gap-3">
            {ACCIONES_RAPIDAS.map((accion, i) => {
              const Icon = accion.icon
              return accion.external ? (
                <a
                  key={i}
                  href={accion.href}
                  target="_blank"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${accion.color}`}
                >
                  <Icon size={18} /> {accion.label}
                  <ArrowRight size={14} className="ml-auto" />
                </a>
              ) : (
                <Link
                  key={i}
                  href={accion.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${accion.color}`}
                >
                  <Icon size={18} /> {accion.label}
                  <ArrowRight size={14} className="ml-auto" />
                </Link>
              )
            })}
          </div>

          {/* Separator + Tip */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
              <Users size={13} /> {pedidos.length} {pedidos.length === 1 ? 'pedido total' : 'pedidos totales'}
            </p>
            {!aceptarPedidos && (
              <p className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1">
                ⚠️ Tu tienda no acepta pedidos. Actívala en Ajustes.
              </p>
            )}
          </div>
        </div>

        {/* Pedidos Recientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart size={16} className="text-blue-500" /> Pedidos recientes
            </h2>
            <Link
              href="/dashboard/pedidos"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Ver todos <ChevronRight size={13} />
            </Link>
          </div>

          {recentPedidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <ShoppingBag size={36} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">Todavía no tienes pedidos</p>
              <p className="text-xs mt-1">¡Comparte tu tienda para recibir el primero!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentPedidos.map((pedido) => {
                const status = STATUS_CONFIG[pedido.estado] || STATUS_CONFIG.pendiente
                const fecha = new Date(pedido.created_at)
                const hoy = new Date()
                const esHoy = fecha.toDateString() === hoy.toDateString()
                const fechaLabel = esHoy
                  ? `Hoy ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
                  : fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })

                return (
                  <Link
                    key={pedido.id}
                    href="/dashboard/pedidos"
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar inicial */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(pedido.cliente_nombre || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{pedido.cliente_nombre || 'Cliente'}</p>
                        <p className="text-xs text-slate-400 font-mono">{pedido.codigo} · {fechaLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color} ${status.bg} ${status.border}`}>
                        {status.label}
                      </span>
                      <span className="text-sm font-bold text-slate-800 font-mono">
                        €{parseFloat(pedido.total).toFixed(2)}
                      </span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Banner compartir por WhatsApp ── */}
      {storeUrl && (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-100">
          {/* Decorative bubbles */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute right-10 -bottom-8 w-20 h-20 bg-white/10 rounded-full" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-lg">¡Comparte tu tienda! 🚀</p>
              <p className="text-emerald-100 text-sm mt-1 max-w-sm">
                Compártela en WhatsApp o redes sociales y empieza a recibir pedidos.
              </p>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`¡Haz tu pedido en mi tienda online! 🛍️ ${storeUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-emerald-600 hover:bg-emerald-50 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm shrink-0"
            >
              <ShoppingCart size={16} /> Compartir por WhatsApp
            </a>
          </div>
        </div>
      )}

    </div>
  )
}
