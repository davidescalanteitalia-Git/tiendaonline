'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CheckCircle2, ChevronDown, ChevronUp, Image as ImageIcon, MessageSquare, 
  PackagePlus, ShoppingCart, UserPlus, Image as BannerIcon, CreditCard, 
  Truck, Clock, AtSign, Palette, Tag, Share2, Layers, Star, MapPin 
} from 'lucide-react'

export default function DashboardChecklist({ tienda, productos, pedidos, clientes }) {
  const [isOpen, setIsOpen] = useState(true)
  const [manualChecks, setManualChecks] = useState({})

  // Cargar checks manuales
  useEffect(() => {
    const saved = localStorage.getItem('checklist_manual_' + tienda?.id)
    if (saved) {
      try { setManualChecks(JSON.parse(saved)) } catch(e) {}
    }
  }, [tienda?.id])

  const toggleManualCheck = (id) => {
    const newChecks = { ...manualChecks, [id]: !manualChecks[id] }
    setManualChecks(newChecks)
    localStorage.setItem('checklist_manual_' + tienda?.id, JSON.stringify(newChecks))
  }

  const config = tienda?.config_diseno || {}

  // Validaciones automáticas (Inteligentes)
  const hasPedidos = pedidos && pedidos.length > 0
  const hasProductos = productos && productos.length > 0
  const hasClientes = clientes && clientes.length > 0
  
  const hasLogo = !!tienda?.logo_url
  const hasHorarios = !!tienda?.horario
  const hasInstagram = !!tienda?.instagram
  const hasBio = !!tienda?.descripcion
  const hasPagos = !!config.pagos && Object.keys(config.pagos).length > 0
  const hasEnvios = !!config.envios && Object.keys(config.envios).length > 0
  const hasStockControl = productos?.some(p => p.stock !== null && p.stock !== undefined && p.stock !== '')
  const hasDestacado = productos?.some(p => p.destacado === true)
  const hasColores = !!config.color_principal && config.color_principal !== '#2563EB' // Si lo cambió del azul por defecto
  
  const copyLink = () => {
    navigator.clipboard.writeText(`https://${tienda?.subdominio}.tiendaonline.it`)
    toggleManualCheck('compartir')
    alert('¡Enlace de tu tienda copiado al portapapeles!')
  }

  const tasks = [
    // ⚙️ Configuración Básica
    {
      id: 'metodo_pago',
      title: 'Configurar un Método de Cobro',
      desc: 'Activa la forma en que quieres que te paguen (Efectivo, Transferencia, Tarjeta o Acuerdo por WhatsApp).',
      status: hasPagos,
      icon: <CreditCard size={20} />,
      href: '/dashboard/diseno?tab=pagos'
    },
    {
      id: 'envio',
      title: 'Definir Zonas de Envío',
      desc: 'Añade al menos un costo de envío o configura la opción de "Retiro en Local".',
      status: hasEnvios,
      icon: <Truck size={20} />,
      href: '/dashboard/diseno?tab=envios'
    },
    {
      id: 'horarios',
      title: 'Establecer Horarios de Atención',
      desc: 'Dile a tus clientes en qué horarios estás disponible para responder o entregar pedidos.',
      status: hasHorarios,
      icon: <Clock size={20} />,
      href: '/dashboard/ajustes'
    },

    // 🎨 Diseño y Branding
    {
      id: 'logo',
      title: 'Sube el logo de tu tienda',
      desc: 'Dale identidad a tu marca para que tus clientes te reconozcan rápidamente.',
      status: hasLogo,
      icon: <ImageIcon size={20} />,
      href: '/dashboard/ajustes'
    },
    {
      id: 'banner',
      title: 'Pon un banner para la página web',
      desc: 'Añade una portada atractiva que resalte sobre el resto en tu tienda online.',
      status: !!config.banner || manualChecks['banner'], // Pendiente desarrollo backend
      icon: <BannerIcon size={20} />,
      href: '/dashboard/diseno?tab=branding'
    },
    {
      id: 'mensaje',
      title: 'Coloca un mensaje de bienvenida',
      desc: 'Saluda a tus clientes (escribe tu Biografía o Descripción) apenas entren a tu catálogo.',
      status: hasBio,
      icon: <MessageSquare size={20} />,
      href: '/dashboard/ajustes'
    },
    {
      id: 'color_marca',
      title: 'Personalizar Colores de la Marca',
      desc: 'Sal del azul clásico. Escoge el color principal que represente a tu marca.',
      status: hasColores || manualChecks['color_marca'],
      icon: <Palette size={20} />,
      href: '/dashboard/diseno?tab=branding'
    },

    // 🚀 Marketing y Retención
    {
      id: 'redes_sociales',
      title: 'Conectar tus Redes Sociales',
      desc: 'Añade el link de tu Instagram para que tus clientes te sigan.',
      status: hasInstagram,
      icon: <AtSign size={20} />,
      href: '/dashboard/ajustes'
    },
    {
      id: 'compartir',
      title: 'Probar el botón de Compartir',
      desc: '¡Copia el enlace de tu tienda y mándaselo a un amigo por WhatsApp!',
      status: manualChecks['compartir'],
      icon: <Share2 size={20} />,
      action: copyLink, // Llama a una función en lugar de un href
      buttonText: 'Copiar mi link'
    },
    {
      id: 'cupon',
      title: 'Crear un Cupón de Descuento',
      desc: 'Crea un código como BIENVENIDO10 para animar a tus primeros visitantes a comprar.',
      status: manualChecks['cupon'], // Aún no hay backend, se marca manual
      icon: <Tag size={20} />,
      href: '/dashboard/diseno',
      buttonText: 'Marcar como hecho',
      manual: true
    },

    // 📦 Gestión de Inventario Avanzada
    {
      id: 'producto',
      title: 'Crear un producto (y categoría)',
      desc: 'Tu tienda necesita cosas para vender. Sube tu primer producto de inmediato.',
      status: hasProductos,
      icon: <PackagePlus size={20} />,
      href: '/dashboard/productos/nuevo'
    },
    {
      id: 'control_stock',
      title: 'Asignar Control de Stock',
      desc: 'Edita un producto y ponle un límite de cantidad para probar cómo el sistema te avisa cuando se agote.',
      status: hasProductos && hasStockControl,
      icon: <Layers size={20} />,
      href: '/dashboard/productos'
    },
    {
      id: 'producto_destacado',
      title: 'Destacar un Producto',
      desc: 'Marca tu producto favorito como "Destacado" para que aparezca gigantesco en la vitrina principal.',
      status: hasProductos && hasDestacado,
      icon: <Star size={20} />,
      href: '/dashboard/productos'
    },

    // ⚖️ Ventas y Operaciones
    {
      id: 'compra',
      title: 'Ingresar una compra',
      desc: 'Crea tu primer pedido manualmente en el sistema para entender el proceso de confirmación.',
      status: hasPedidos,
      icon: <ShoppingCart size={20} />,
      href: '/dashboard/pedidos'
    },
    {
      id: 'cliente',
      title: 'Crear un cliente manualmente',
      desc: 'Puedes registrar a los clientes a quienes les haces ventas presenciales.',
      status: hasClientes,
      icon: <UserPlus size={20} />,
      href: '/dashboard/clientes'
    },
    {
      id: 'contacto',
      title: 'Revisar Información de Contacto',
      desc: 'Asegúrale a tus clientes que eres real validando tu número de WhatsApp.',
      status: !!tienda?.whatsapp,
      icon: <MapPin size={20} />,
      href: '/dashboard/ajustes'
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
    <div className={`rounded-2xl border ${borderColor} overflow-hidden bg-white shadow-md transition-all duration-300`}>
      {/* Header Desplegable */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 flex flex-col gap-3 transition-colors hover:${lightBgColor} focus:outline-none text-left bg-gradient-to-br from-white to-slate-50/50`}
      >
        <div className="flex justify-between items-start w-full">
           <h3 className="text-sm font-black text-slate-800 tracking-tight leading-snug">Onboarding:<br/>Tu Tienda 🚀</h3>
           <div className="text-slate-400 p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
        
        <div className="flex flex-col w-full gap-1.5 mt-1">
          <div className="flex justify-between items-center w-full">
             <span className={`text-[10px] font-black uppercase tracking-widest ${textColor}`}>Progreso</span>
             <span className={`text-[11px] font-black ${textColor}`}>{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${barColor} transition-all duration-1000 ease-out`} 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </button>

      {/* Listado de Tareas (Desplegable) */}
      <div 
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] border-t border-slate-100' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="divide-y divide-slate-100 max-h-[50vh] overflow-y-auto no-scrollbar">
            {tasks.map((task) => (
               <div key={task.id} className="group flex flex-col px-4 py-3 hover:bg-slate-50 transition-colors gap-2">
                  <div className="flex gap-3 items-start">
                    <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      task.status 
                        ? 'bg-emerald-100 text-emerald-600 shadow-sm shadow-emerald-200/50' 
                        : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}>
                      {task.status ? <CheckCircle2 size={16} /> : task.icon}
                    </div>
                    <div className="flex-1 mt-0.5">
                      <h4 className={`text-xs font-bold leading-tight ${task.status ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {task.title}
                      </h4>
                    </div>
                  </div>
                  
                  {!task.status && (
                    <div className="pl-11 pr-1 mt-1">
                      {task.action ? (
                        <button 
                          onClick={task.action}
                          className="w-full py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                        >
                          {task.buttonText || 'Hacer ahora'}
                        </button>
                      ) : task.manual ? (
                        <button 
                          onClick={() => toggleManualCheck(task.id)}
                          className="w-full py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                        >
                          {task.buttonText || 'Marcar hecho'}
                        </button>
                      ) : (
                        <Link 
                          href={task.href}
                          className="w-full inline-flex justify-center py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                        >
                          Hacer ahora
                        </Link>
                      )}
                    </div>
                  )}
               </div>
            ))}
          </div>
          
          {progressPercent === 100 && (
            <div className="p-4 bg-emerald-50 border-t border-emerald-100 text-emerald-800 flex flex-col gap-3 text-center">
              <div>
                <h4 className="text-sm font-black tracking-tight text-emerald-700">¡Felicidades, eres un experto! 🏆</h4>
                <p className="text-[10px] font-medium opacity-80 mt-1">Ya dominas las herramientas.</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all"
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
