'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../components/LanguageProvider'
import { DICTIONARY } from '../../lib/dictionaries'
import LanguageSelector from '../../components/LanguageSelector'
import UniversalFooter from '../../components/UniversalFooter'
import { Home, Package, FolderTree, ShoppingCart, Paintbrush, Settings, LogOut, Globe, Store, ShoppingBag, Menu, X } from 'lucide-react'

async function fetchTienda() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const res = await fetch('/api/me', {
    headers: { Authorization: `Bearer ${session.access_token}` },
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.tienda || null
}

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['it']

  const [tienda, setTienda] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      const t = await fetchTienda()
      setTienda(t)
      setLoading(false)
    }
    init()
  }, [router])

  // Cerrar sidebar al cambiar de ruta
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const menuItems = [
    { icon: Home, label: dict.home || 'Inicio', href: '/dashboard' },
    { icon: Package, label: dict.prodotti || 'Productos', href: '/dashboard/productos' },
    { icon: ShoppingBag, label: dict.compras || 'Compras', href: '/dashboard/compras' },
    { icon: FolderTree, label: dict.categorie || 'Categorías', href: '/dashboard/categorias' },
    { icon: ShoppingCart, label: dict.ordini || 'Pedidos', href: '/dashboard/pedidos' },
    { icon: Paintbrush, label: dict.design || 'Diseño', href: '/dashboard/diseno' },
    { icon: Settings, label: dict.impostazioni || 'Ajustes', href: '/dashboard/ajustes' },
  ]

  // Para "visitar tienda" usamos la ruta interna /store/ (funciona sin DNS wildcard).
  // La URL con subdominio (prueba5.tiendaonline.it) es solo para compartir con clientes.
  const storeUrl = tienda?.subdominio
    ? `/store/${tienda.subdominio}`
    : null

  const inicial = tienda?.nombre ? tienda.nombre.charAt(0).toUpperCase() : '?'

  // ── Sidebar content (shared between desktop and mobile drawer) ──
  const SidebarContent = () => (
    <>
      <div className="p-6 pb-2">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 cursor-default">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/30">
            <ShoppingBag size={20} />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">TIENDAONLINE</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer w-full text-left
                  ${isActive
                    ? 'bg-primary/10 text-primary border border-primary/10 shadow-[0_2px_10px_rgba(37,99,235,0.05)]'
                    : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-primary' : 'text-slate-400'} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom: store info + logout */}
      <div className="mt-auto p-4 border-t border-slate-200/50 bg-white/40">
        {loading ? (
          <div className="text-slate-400 text-sm text-center py-4">{dict.caricamento}</div>
        ) : (
          <>
            {/* Store card */}
            <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                {inicial}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="font-semibold text-sm text-slate-800 truncate" title={tienda?.nombre}>
                  {tienda?.nombre || '—'}
                </div>
                {tienda?.subdominio && (
                  <div className="text-xs text-slate-500 truncate" title={`${tienda.subdominio}.tiendaonline.it`}>
                    {tienda.subdominio}.tiendaonline.it
                  </div>
                )}
              </div>
            </div>

            {/* Visit store */}
            {storeUrl && (
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 mb-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors cursor-pointer"
              >
                <Globe size={16} /> {dict.visitarSitio}
              </a>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-100 hover:bg-red-50 text-sm font-medium transition-colors cursor-pointer"
            >
              <LogOut size={16} /> {dict.salir}
            </button>
          </>
        )}
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">

      {/* ───── SIDEBAR DESKTOP (oculto en móvil) ───── */}
      <aside className="hidden md:flex w-64 bg-white/60 backdrop-blur-xl border-r border-slate-200/50 flex-col sticky top-0 h-screen box-border shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent />
      </aside>

      {/* ───── SIDEBAR MÓVIL (drawer) ───── */}
      {/* Overlay oscuro */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 md:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Botón cerrar */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* ───── MAIN ───── */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Topbar */}
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            {/* Botón hamburguesa - solo en móvil */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="font-semibold text-slate-800 flex items-center gap-2">
              <Store size={18} className="text-slate-400 hidden md:block" />
              {loading ? '...' : (tienda?.nombre || dict.dashboard)}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col">
          <div className="flex-1 max-w-5xl w-full mx-auto">
            {children}
          </div>
          <div className="mt-12 max-w-5xl w-full mx-auto">
            <UniversalFooter />
          </div>
        </div>
      </main>
    </div>
  )
}
