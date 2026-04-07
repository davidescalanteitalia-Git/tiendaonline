'use client'

import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'
import { Package, Plus, Search } from 'lucide-react'

export default function ProductosPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Package className="text-primary" size={28} />
            {dict.prodotti}
          </h1>
          <p className="text-slate-500 mt-1">{dict.gestionaCatalogo}</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] transform hover:-translate-y-0.5">
          <Plus size={18} /> {dict.añadirProducto}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={dict.buscarProductos}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">{dict.producto}</th>
                <th className="px-6 py-4 font-semibold">{dict.precio}</th>
                <th className="px-6 py-4 font-semibold">{dict.estado}</th>
                <th className="px-6 py-4 font-semibold text-right">{dict.acciones}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Package size={48} className="mb-4 text-slate-200" />
                    <p className="font-medium text-slate-600 mb-1">{dict.sinProductos}</p>
                    <p className="text-sm">{dict.sinProductosDesc}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
