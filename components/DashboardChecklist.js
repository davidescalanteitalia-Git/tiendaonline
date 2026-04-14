'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ChevronDown, ChevronUp, Image as ImageIcon, MessageSquare, PackagePlus, ShoppingCart, UserPlus, Image as BannerIcon } from 'lucide-react'

export default function DashboardChecklist({ tienda, productos, pedidos, clientes }) {
  const [isOpen, setIsOpen] = useState(true)

  const config = tienda?.config_diseno || {}

  const tasks = [
    {
      id: 'logo',
      title: 'Sube el logo de tu tienda',
      desc: 'Dale identidad a tu marca para que tus clientes te reconozcan rápidamente.',
      status: !!config.logo,
      icon: <ImageIcon size={20} />,
      href: '/dashboard/diseno?tab=branding'
    },
    {
      id: 'banner',
      title: 'Pon un banner para la página web',
      desc: 'Añade una portada atractiva que resalte sobre el resto en tu tienda online.',
      status: !!config.banner,
      icon: <BannerIcon size={20} />,
      href: '/dashboard/diseno?tab=branding'
    },
    {
      id: 'mensaje',
      title: 'Coloca un mensaje para la página',
      desc: 'Saluda a tus clientes y diles qué vendes apenas entren a tu catálogo.',
      status: !!config.mensaje_bienvenida || !!config.mensaje_portada, // Múltiples posibles nombres en la DB futura
      icon: <MessageSquare size={20} />,
      href: '/dashboard/diseno?tab=branding'
    },
    {
      id: 'producto',
      title: 'Crear un producto (y categoría)',
      desc: 'Tu tienda necesita cosas para vender. Sube tu primer producto de inmediato.',
      status: productos && productos.length > 0,
      icon: <PackagePlus size={20} />,
      href: '/dashboard/productos/nuevo'
    },
    {
      id: 'cliente',
      title: 'Crear un cliente manualmente',
      desc: 'Puedes registrar a los clientes a quienes les haces ventas presenciales o directas.',
      status: clientes && clientes.length > 0,
      icon: <UserPlus size={20} />,
      href: '/dashboard/clientes'
    },
    {
      id: 'compra',
      title: 'Ingresar una compra',
      desc: 'Crea tu primer pedido manualmente en el sistema para entender el proceso.',
      status: pedidos && pedidos.length > 0,
      icon: <ShoppingCart size={20} />,
      href: '/dashboard/pedidos'
    }
  ]

  const completedCount = tasks.filter((t) => t.status).length
  const totalCount = tasks.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  // Determinar color de la barra (Rojo -> Amarillo -> Verde)
  let barColor = 'bg-rose-500' // 0% al 33%
  let lightBgColor = 'bg-rose-50'
  let textColor = 'text-rose-700'
  let borderColor = 'border-rose-200'

  if (progressPercent === 100) {
    barColor = 'bg-emerald-500'
    lightBgColor = 'bg-emerald-50'
    textColor = 'text-emerald-700'
    borderColor = 'border-emerald-200'
  } else if (progressPercent > 33) {
    barColor = 'bg-amber-400'
    lightBgColor = 'bg-amber-50'
    textColor = 'text-amber-800'
    borderColor = 'border-amber-200'
  }

  return (
    <div className={`rounded-[32px] border ${borderColor} overflow-hidden bg-white shadow-xl shadow-slate-200/50 transition-all duration-300`}>
      {/* Header Desplegable */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:${lightBgColor} focus:outline-none`}
      >
        <div className="flex flex-col text-left">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Onboarding: Transforma tu Tienda 🚀</h3>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {progressPercent === 100 
              ? '¡Excelente! Has completado todas las tareas básicas de tu tienda.' 
              : 'Domina la plataforma paso a paso completando estas simples tareas.'}
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-2 flex-grow sm:flex-grow-0">
            <span className={`text-sm font-black ${textColor}`}>
              {completedCount} de {totalCount} ({progressPercent}%)
            </span>
            <div className="w-32 sm:w-48 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full ${barColor} transition-all duration-1000 ease-out`} 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="text-slate-400 hover:text-slate-700 transition-colors p-2 bg-white rounded-2xl shadow-sm border border-slate-100">
            {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
        </div>
      </button>

      {/* Listado de Tareas (Desplegable) */}
      <div 
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] border-t border-slate-100' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="divide-y divide-slate-50">
            {tasks.map((task) => (
               <div key={task.id} className="group flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 sm:px-8 hover:bg-slate-50 transition-colors gap-4">
                  <div className="flex gap-4 items-start sm:items-center">
                    <div className={`mt-1 sm:mt-0 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-sm ${
                      task.status 
                        ? 'bg-emerald-100 text-emerald-600 shadow-emerald-200' 
                        : 'bg-white border border-slate-200 text-slate-400 group-hover:border-blue-200 group-hover:text-blue-500'
                    }`}>
                      {task.status ? <CheckCircle2 size={24} /> : task.icon}
                    </div>
                    <div>
                      <h4 className={`text-base font-bold ${task.status ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-blue-600 transition-colors'}`}>
                        {task.title}
                      </h4>
                      <p className={`text-sm mt-0.5 max-w-md ${task.status ? 'text-slate-300' : 'text-slate-500'}`}>
                        {task.desc}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pl-16 sm:pl-0 shrink-0">
                    {task.status ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-[11px] uppercase tracking-wider">
                        Completado ✅
                      </span>
                    ) : (
                      <Link 
                        href={task.href}
                        className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                      >
                        Hacer ahora
                      </Link>
                    )}
                  </div>
               </div>
            ))}
          </div>
          
          {progressPercent === 100 && (
            <div className="p-6 sm:p-8 bg-emerald-50 text-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <span className="text-2xl animate-bounce">🏆</span>
                </div>
                <div>
                  <h4 className="text-lg font-black tracking-tight">¡Felicidades, tu tienda está lista!</h4>
                  <p className="text-sm font-medium opacity-90">Ya dominas las bases y herramientas principales del sistema.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
              >
                Ocultar panel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
