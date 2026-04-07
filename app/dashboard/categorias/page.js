import { FolderTree, Plus, GripVertical, Edit2, Trash2 } from 'lucide-react'

export default function CategoriasPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <FolderTree className="text-primary" size={28} />
            Categorías
          </h1>
          <p className="text-slate-500 mt-1">Organiza tus productos para facilitar la compra a tus clientes.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
          <Plus size={18} /> Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder tarjeta de categoría */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-40 border-dashed bg-slate-50 cursor-pointer flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/50 hover:bg-blue-50/50">
           <Plus size={32} className="mb-2" />
           <span className="font-medium">Crear Categoría</span>
        </div>
      </div>
    </div>
  )
}
