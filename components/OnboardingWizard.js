'use client'

import { useState } from 'react'
import { X, PlayCircle, Sparkles, ArrowRight } from 'lucide-react'

/**
 * OnboardingWizard — Renombrado conceptualmente a "Welcome Modal".
 * Este modal se muestra sobre el dashboard para usuarios nuevos.
 * Contiene el Video de Bienvenida del fundador y los primeros pasos.
 * El checklist en sí ahora vive en el Sidebar.
 *
 * Props:
 *   tienda       — objeto de la tienda actual
 *   onDismiss    — callback cuando el usuario cierra el wizard manualmente o le da "Empezar"
 */
export default function OnboardingWizard({ tienda, onDismiss }) {
  const [isPlaying, setIsPlaying] = useState(false)

  // Nombre de la tienda para hacerlo más personalizado
  const nombreTienda = tienda?.nombre || 'tu nueva tienda'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl shadow-slate-900/40 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 overflow-hidden relative">
        
        {/* Botón cerrar esquina */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur text-white flex items-center justify-center rounded-full transition-colors"
          title="Saltar video"
        >
          <X size={20} />
        </button>

        {/* ── Video Player Area ── */}
        <div className="relative w-full aspect-video bg-slate-900 overflow-hidden group">
          {isPlaying ? (
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1" 
              title="Video de Bienvenida" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 cursor-pointer" onClick={() => setIsPlaying(true)}>
              {/* Overlay Thumbnail Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 to-purple-900/60 mix-blend-multiply opacity-80 transition-opacity group-hover:opacity-60" />
              <img 
                src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=1200&h=600" 
                alt="Thumbnail"
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
              />
              
              <div className="relative z-10 flex flex-col items-center transform transition-transform group-hover:scale-105">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                  <PlayCircle size={32} className="ml-1" />
                </div>
                <h3 className="text-2xl font-black text-center text-white drop-shadow-md">
                  ¡Bienvenido a TIENDAONLINE!
                </h3>
                <p className="font-medium text-blue-100 mt-2 drop-shadow flex items-center gap-2">
                  <Sparkles size={16} /> Mira este corto video del fundador
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Copy / Action Area ── */}
        <div className="p-8 md:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-3">
            ¡Ya casi estamos, {nombreTienda}!
          </h2>
          <p className="text-slate-500 text-base md:text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Hemos preparado una <strong className="text-slate-700">Lista de Tareas (Checklist)</strong> especial para ti en el menú lateral. Sigue los pasos para configurar tus pagos y subir tus primeros productos.
          </p>
          
          <button
            onClick={onDismiss}
            className="group w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[1.05rem] shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
          >
            Empezar a configurar mi tienda
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  )
}
