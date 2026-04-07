import { Settings, User, Store, Bell, ShieldCheck } from 'lucide-react'

export default function AjustesPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Settings className="text-primary" size={28} />
            Ajustes
          </h1>
          <p className="text-slate-500 mt-1">Configuraciones generales de tu negocio y cuenta.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav Settings */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-primary font-semibold text-sm transition-colors text-left border border-blue-100">
            <Store size={18} /> Perfil de Tienda
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-600 font-medium text-sm transition-colors text-left">
            <User size={18} /> Tu Cuenta
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-600 font-medium text-sm transition-colors text-left">
            <Bell size={18} /> Notificaciones
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 text-slate-600 font-medium text-sm transition-colors text-left">
            <ShieldCheck size={18} /> Privacidad y Legal
          </button>
        </div>

        {/* Content Settings */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Perfil de la Tienda</h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre de la Tienda</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Tienda Hermosa"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Subdominio</label>
                  <div className="flex">
                    <input 
                      type="text" 
                      placeholder="tienda"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-mono text-sm"
                    />
                    <span className="inline-flex items-center px-4 rounded-r-xl border border-l-0 border-slate-200 bg-slate-100 text-slate-500 font-mono text-sm">
                      .tiendaonline.it
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción Corta</label>
                <textarea 
                  rows="3"
                  placeholder="¿Qué vendes en tu tienda?"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none text-sm"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button type="button" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
