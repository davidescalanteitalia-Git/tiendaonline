import { Paintbrush, LayoutTemplate, Palette, Type } from 'lucide-react'

export default function DisenoPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Paintbrush className="text-primary" size={28} />
            Diseño
          </h1>
          <p className="text-slate-500 mt-1">Personaliza el aspecto de tu tienda pública.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] transform hover:-translate-y-0.5">
          <LayoutTemplate size={18} /> Previsualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Palette className="text-primary" size={20} /> Colores de la Marca
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Color Principal</label>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-600 shadow-inner border border-slate-200"></div>
                <div className="flex-1">
                  <input type="text" value="#2563EB" readOnly className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-600 focus:outline-none" />
                </div>
              </div>
            </div>
            
            <div>
               <button className="w-full inline-flex items-center justify-center gap-2 bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm">
                 Cambiar Colores
               </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <Type className="text-primary" size={20} /> Tipografía
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 hover:border-primary/30 transition-colors cursor-pointer flex items-center justify-between">
              <div>
                <div className="font-sans font-semibold text-slate-800">Inter / Roboto</div>
                <div className="text-xs text-slate-500 mt-1">Estilo Moderno y Limpio</div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                 <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
              </div>
            </div>
            
            <div className="p-4 border border-slate-100 rounded-xl hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-between">
              <div>
                <div className="font-serif font-semibold text-slate-800">Playfair / Lora</div>
                <div className="text-xs text-slate-500 mt-1">Estilo Elegante y Clásico</div>
              </div>
              <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
