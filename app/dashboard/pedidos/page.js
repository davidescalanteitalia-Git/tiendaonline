'use client'

import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'
import { ShoppingCart, Search, Filter } from 'lucide-react'

export default function PedidosPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <ShoppingCart className="text-primary" size={28} />
            {dict.ordini}
          </h1>
          <p className="text-slate-500 mt-1">{dict.visualizaYProcesa}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={dict.buscarPedido}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-sm"
            />
          </div>
          <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Filter size={16} /> {dict.filtrar}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">{dict.nPedido}</th>
                <th className="px-6 py-4 font-semibold">{dict.cliente}</th>
                <th className="px-6 py-4 font-semibold">{dict.fecha}</th>
                <th className="px-6 py-4 font-semibold">{dict.total}</th>
                <th className="px-6 py-4 font-semibold">{dict.estado}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <ShoppingCart size={48} className="mb-4 text-slate-200" />
                    <p className="font-medium text-slate-600 mb-1">{dict.sinPedidos}</p>
                    <p className="text-sm">{dict.sinPedidosDesc}</p>
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
