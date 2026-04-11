'use client'

import React, { useState, useEffect } from 'react'
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
  Loader2,
  X,
  User,
  Calculator,
  ScanLine
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function PosPage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('all')

  const [cart, setCart] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  // Payment State
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [clienteNombre, setClienteNombre] = useState('Cliente Local')

  useEffect(() => {
    loadCatalog()
  }, [])

  async function loadCatalog() {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const [resProd, resCat] = await Promise.all([
        fetch('/api/productos', { headers: { 'Authorization': `Bearer ${session.access_token}` } }),
        fetch('/api/categorias', { headers: { 'Authorization': `Bearer ${session.access_token}` } })
      ])

      if (resProd.ok) setProductos(await resProd.json())
      if (resCat.ok) setCategorias(await resCat.json())
    } catch (err) {
      console.error('Error loading POS catalog:', err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (prod) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === prod.id)
      if (existing) {
        if (existing.quantity >= prod.stock && prod.stock > 0) {
          showError('No hay más stock disponible')
          return prev
        }
        return prev.map(i => i.id === prod.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      if (prod.stock === 0) {
        showError('Producto sin stock')
        return prev
      }
      return [...prev, { ...prod, quantity: 1 }]
    })
  }

  const adjustQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQ = i.quantity + delta
        if (newQ > i.stock && delta > 0 && i.stock > 0) {
           showError('Límite de stock alcanzado')
           return i
        }
        return { ...i, quantity: Math.max(1, newQ) }
      }
      return i
    }))
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))

  const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.precio || item.price) * item.quantity), 0)
  
  const showError = (msg) => {
    setErrorMsg(msg)
    setTimeout(() => setErrorMsg(null), 3000)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setIsProcessing(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Simulamos la creación de un pedido directo como completado
      const items = [
        ...cart,
        {
          id: 'ORDER_META',
          metodo_pago: metodoPago,
          metodo_envio: 'retiro', // POS es físico
          tipo_venta: 'POS',
          shipping_cost: 0
        }
      ]

      const res = await fetch('/api/pos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          clienteNombre: clienteNombre,
          items: items,
          total: subtotal,
          estado: 'confirmado' // Venta de caja se asume cobrada y confirmada
        })
      })

      if (res.ok) {
        setSuccessMsg('Venta registrada con éxito')
        setCart([])
        setClienteNombre('Cliente Local')
        loadCatalog() // recargar para actualizar stock
        setTimeout(() => setSuccessMsg(null), 3000)
      } else {
        throw new Error('Error al registrar venta')
      }

    } catch (err) {
      showError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredProds = productos.filter(p => {
    const mSearch = p.nombre.toLowerCase().includes(search.toLowerCase())
    const mCat = selectedCat === 'all' || p.categoria_id === selectedCat
    return mSearch && mCat
  })

  return (
    <div className="h-[calc(100vh-64px)] -m-4 md:-m-8 flex flex-col lg:flex-row bg-slate-100/50 overflow-hidden font-sans">
      
      {/* Toasts */}
      {errorMsg && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <X size={18} /> <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={18} /> <span className="text-sm font-bold">{successMsg}</span>
        </div>
      )}

      {/* LEFT PANEL: CATALOG */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100/50">
         {/* Top Bar Catalog */}
         <div className="p-6 bg-white border-b border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between z-10 sticky top-0">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
               <Calculator size={28} className="text-blue-600" /> Caja / POS
            </h1>
            <div className="flex-1 max-w-md w-full relative group">
               <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
               <input 
                 type="text"
                 placeholder="Buscar productos (o escanear)..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-12 pr-12 py-3 bg-slate-100 border-transparent border-2 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
               />
               <ScanLine size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-blue-600" />
            </div>
         </div>

         {/* Categories Track */}
         <div className="bg-white border-b border-slate-200 px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative z-0">
            <button 
              onClick={() => setSelectedCat('all')}
              className={`px-5 py-2.5 rounded-[14px] font-bold text-sm transition-all flexshrink-0 whitespace-nowrap ${selectedCat === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Todos
            </button>
            {categorias.map(c => (
              <button 
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-5 py-2.5 rounded-[14px] font-bold text-sm transition-all flexshrink-0 whitespace-nowrap ${selectedCat === c.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {c.nombre}
              </button>
            ))}
         </div>

         {/* Products Grid */}
         <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                  <Loader2 size={40} className="animate-spin text-blue-500" />
                  <span className="font-bold">Cargando inventario...</span>
               </div>
            ) : filteredProds.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 opacity-50">
                  <ShoppingBag size={64} />
                  <span className="font-bold text-lg uppercase tracking-widest">Sin productos</span>
               </div>
            ) : (
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {filteredProds.map(p => {
                     const isOutOfStock = p.stock === 0;
                     return (
                     <div 
                       key={p.id}
                       onClick={() => !isOutOfStock && addToCart(p)}
                       className={`bg-white rounded-[24px] border border-slate-200 p-4 flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 group select-none ${isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                     >
                        <div className="w-16 h-16 bg-slate-100 rounded-[18px] flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                           {p.emoji || '📦'}
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{p.nombre}</h3>
                           <div className="flex items-end justify-between mt-3">
                              <span className="font-black text-blue-600">€{parseFloat(p.precio).toFixed(2)}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-md">
                                 {p.stock} uni
                              </span>
                           </div>
                        </div>
                     </div>
                     )
                  })}
               </div>
            )}
         </div>
      </div>

      {/* RIGHT PANEL: CART TICKET */}
      <div className="w-full lg:w-[420px] bg-white border-l border-slate-200 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-20 h-full">
         
         {/* Cart Header */}
         <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center justify-between">
               <span>Ticket Actual</span>
               <span className="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full">{cart.reduce((a,c) => a + c.quantity, 0)} items</span>
            </h2>
            <div className="relative group">
               <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 value={clienteNombre}
                 onChange={(e) => setClienteNombre(e.target.value)}
                 className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700 shadow-sm"
                 placeholder="Nombre del Cliente (Opcional)"
               />
            </div>
         </div>

         {/* Cart Items */}
         <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FDFDFF]">
            {cart.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4">
                  <ShoppingCart size={48} className="opacity-20" />
                  <p className="font-bold text-sm text-center">Ticket vacío.<br/>Toca productos para añadir.</p>
               </div>
            ) : (
               cart.map(item => (
                 <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg">{item.emoji || '📦'}</div>
                    <div className="flex-1 min-w-0">
                       <p className="font-bold text-slate-800 text-sm truncate">{item.nombre}</p>
                       <p className="text-xs font-bold text-blue-600">€{parseFloat(item.precio || item.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
                       <button onClick={() => adjustQty(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-blue-600"><Minus size={14}/></button>
                       <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                       <button onClick={() => adjustQty(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-blue-600"><Plus size={14}/></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                       <Trash2 size={16} />
                    </button>
                 </div>
               ))
            )}
         </div>

         {/* Checkout Section */}
         <div className="border-t border-slate-200 bg-white p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
            
            <div className="mb-4 space-y-3">
               <div className="flex items-center justify-between text-sm py-1">
                  <span className="font-bold text-slate-400">Subtotal</span>
                  <span className="font-bold text-slate-800">€{subtotal.toFixed(2)}</span>
               </div>
               <div className="w-full h-px bg-slate-100 my-2 border-dashed border-b border-t-0"></div>
               <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-slate-800">Total</span>
                  <span className="text-3xl font-black text-blue-600">€{subtotal.toFixed(2)}</span>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
               <button 
                 onClick={() => setMetodoPago('efectivo')}
                 className={`py-3 rounded-xl flex flex-col items-center gap-1 border-2 transition-all ${metodoPago === 'efectivo' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
               >
                  <Banknote size={20} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Efectivo</span>
               </button>
               <button 
                 onClick={() => setMetodoPago('tarjeta')}
                 className={`py-3 rounded-xl flex flex-col items-center gap-1 border-2 transition-all ${metodoPago === 'tarjeta' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
               >
                  <CreditCard size={20} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Tarjeta</span>
               </button>
               <button 
                 onClick={() => setMetodoPago('transferencia')}
                 className={`py-3 rounded-xl flex flex-col items-center gap-1 border-2 transition-all ${metodoPago === 'transferencia' ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
               >
                  <Smartphone size={20} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Transf.</span>
               </button>
            </div>

            <button 
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCheckout}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-[24px] py-5 font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-900/10"
            >
               {isProcessing ? <Loader2 className="animate-spin" size={24} /> : (
                 <>
                   Cobrar <ArrowRight size={20}/> €{subtotal.toFixed(2)}
                 </>
               )}
            </button>
         </div>
      </div>
      
      {/* Scrollbar hide */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

function ArrowRight(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  )
}
