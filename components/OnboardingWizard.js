'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Globe,
  CreditCard,
  Package,
  CheckCircle2,
  ChevronRight,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react'

/**
 * OnboardingWizard — Flujo forzoso de 3 pasos para nuevos usuarios.
 * Se muestra como overlay sobre el dashboard hasta que los 3 pasos
 * estén completados o el usuario lo descarte (solo para usuarios avanzados).
 *
 * Props:
 *   tienda       — objeto de la tienda actual
 *   productos    — array de productos actuales
 *   onDismiss    — callback cuando el usuario cierra el wizard manualmente
 */
export default function OnboardingWizard({ tienda, productos, onDismiss }) {
  const config = tienda?.config_diseno || {}
  const subdominio = tienda?.subdominio || ''

  // ── Calcular estado de cada paso ──────────────────────────────────────────
  const steps = [
    {
      id: 'dominio',
      number: 1,
      icon: Globe,
      color: 'blue',
      title: 'Conecta tu tienda',
      desc: 'Tu tienda ya tiene una URL pública con subdominio. Cópiala y compártela con tus clientes.',
      completedDesc: `Tu tienda está en línea en ${subdominio}.tiendaonline.it`,
      action: null, // informativo — se completa automáticamente si existe subdominio
      actionLabel: null,
      done: !!subdominio,
    },
    {
      id: 'pago',
      number: 2,
      icon: CreditCard,
      color: 'emerald',
      title: 'Configura un método de pago',
      desc: 'Agrega al menos un método (Transferencia, Efectivo, etc.) para que tus clientes puedan pagar.',
      completedDesc: 'Métodos de pago configurados correctamente.',
      action: '/dashboard/ajustes/pagos',
      actionLabel: 'Configurar pago →',
      done: !!config.pagos && Object.keys(config.pagos).some(k => config.pagos[k]),
    },
    {
      id: 'producto',
      number: 3,
      icon: Package,
      color: 'indigo',
      title: 'Sube tu primer producto',
      desc: 'Añade al menos un producto con nombre, precio y foto para que tu catálogo esté listo.',
      completedDesc: `${productos.length} producto${productos.length !== 1 ? 's' : ''} en tu catálogo.`,
      action: '/dashboard/productos',
      actionLabel: 'Agregar producto →',
      done: productos.length > 0,
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const allDone = completedCount === steps.length
  const [activeStep, setActiveStep] = useState(() => {
    // Auto-avanzar al primer paso incompleto
    const first = steps.findIndex(s => !s.done)
    return first === -1 ? 0 : first
  })

  const colorMap = {
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200',    ring: 'ring-blue-500/20',    dot: 'bg-blue-500'    },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', ring: 'ring-emerald-500/20', dot: 'bg-emerald-500' },
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-200',  ring: 'ring-indigo-500/20',  dot: 'bg-indigo-500'  },
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl shadow-slate-900/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-400 overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-blue-400" />
                <span className="text-xs font-black uppercase tracking-widest text-blue-400">
                  Configuración inicial
                </span>
              </div>
              {completedCount > 0 && (
                <button
                  onClick={onDismiss}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-all"
                  title="Cerrar (puedes volver más tarde)"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-1">
              {allDone ? '¡Tu tienda está lista! 🎉' : '3 pasos para lanzar tu tienda'}
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              {allDone
                ? 'Todo configurado. Empieza a recibir pedidos.'
                : `${completedCount} de ${steps.length} completados`}
            </p>

            {/* Progress bar */}
            <div className="mt-5 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${(completedCount / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Steps ── */}
        <div className="p-6 space-y-3">
          {steps.map((step, idx) => {
            const c = colorMap[step.color]
            const isActive = activeStep === idx
            const Icon = step.icon

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-5 rounded-3xl border-2 transition-all duration-200 ${
                  step.done
                    ? 'border-emerald-100 bg-emerald-50/50'
                    : isActive
                      ? `${c.border} ${c.bg} ring-4 ${c.ring}`
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Step indicator */}
                  <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    step.done
                      ? 'bg-emerald-500 text-white'
                      : isActive
                        ? `${c.bg} ${c.text} border-2 ${c.border}`
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}>
                    {step.done
                      ? <CheckCircle2 size={20} />
                      : <Icon size={20} />
                    }
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        step.done ? 'text-emerald-500' : isActive ? c.text : 'text-slate-400'
                      }`}>
                        Paso {step.number}
                      </span>
                      {step.done && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                          · Completado ✓
                        </span>
                      )}
                    </div>
                    <h3 className={`font-black text-base transition-colors ${
                      step.done ? 'text-slate-600' : isActive ? 'text-slate-900' : 'text-slate-500'
                    }`}>
                      {step.title}
                    </h3>

                    {/* Expanded detail when active */}
                    {isActive && (
                      <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">
                          {step.done ? step.completedDesc : step.desc}
                        </p>

                        {/* Action buttons */}
                        {!step.done && step.action && (
                          <Link
                            href={step.action}
                            className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm text-white shadow-lg transition-all active:scale-95 hover:opacity-90 ${
                              step.color === 'blue' ? 'bg-blue-600 shadow-blue-200' :
                              step.color === 'emerald' ? 'bg-emerald-600 shadow-emerald-200' :
                              'bg-indigo-600 shadow-indigo-200'
                            }`}
                          >
                            {step.actionLabel} <ArrowRight size={16} />
                          </Link>
                        )}

                        {/* Paso 1 especial: mostrar URL */}
                        {step.id === 'dominio' && subdominio && (
                          <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
                            <span className="text-sm font-mono font-bold text-slate-600">
                              {subdominio}.tiendaonline.it
                            </span>
                            <span className="ml-auto text-xs font-black text-emerald-600 uppercase tracking-widest">
                              Online ✓
                            </span>
                          </div>
                        )}

                        {/* Avanzar al siguiente paso si está completo */}
                        {step.done && idx < steps.length - 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveStep(idx + 1) }}
                            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mt-1"
                          >
                            Ver siguiente paso <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6">
          {allDone ? (
            <button
              onClick={onDismiss}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} /> Ir al Dashboard
            </button>
          ) : (
            <p className="text-center text-xs text-slate-400 font-medium">
              Completa los 3 pasos para empezar a recibir pedidos sin soporte.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
