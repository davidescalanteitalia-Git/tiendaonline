'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../components/LanguageProvider'
import { DICTIONARY } from '../../lib/dictionaries'
import LanguageSelector from '../../components/LanguageSelector'
import UniversalFooter from '../../components/UniversalFooter'
import OnboardingWizard from '../../components/OnboardingWizard'
import DashboardChecklist from '../../components/DashboardChecklist'
import { Home, Package, FolderTree, ShoppingCart, Paintbrush, Settings, LogOut, Globe, Store, ShoppingBag, Menu, X, Users, Calculator, PieChart, UserCircle, CheckCircle2, Circle, ChevronDown, CreditCard, Wallet, ClipboardList, BookUser, TrendingUp } from 'lucide-react'
import PlanBanner from '../../components/PlanBanner'
import { identificarDueno, resetearIdentidad } from '../../components/PostHogProvider'

async function fetchTienda(access_token) {
  const res = await fetch('/api/me', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.tienda || null
}

async function fetchProductosCount(access_token, tienda_id) {
  const res = await fetch('/api/productos', { 
    headers: { Authorization: `Bearer ${access_token}` }
  })
  if (!res.ok) return 0
  const data = await res.json()
  return data.productos ? data.productos.length : 0
}

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']

  const [tienda, setTienda] = useState(null)
  const [productosCount, setProductosCount] = useState(0)
  const [productos, setProductos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [openGroups, setOpenGroups] = useState({ secondary: true })

  const toggleGroup = (key) => setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }))

  useEffect(() => {
    let channel = null
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      const t = await fetchTienda(session.access_token)
      setTienda(t)
      // Identificar al dueño en PostHog para analytics personalizados
      if (t) identificarDueno(session.user.id, t)

      if (t?.id) {
        // Fetch resources in parallel for the sidebar checklist
        const headers = { Authorization: `Bearer ${session.access_token}` }
        const [pedidosRes, productosRes, clientesRes] = await Promise.all([
          fetch('/api/pedidos', { headers }),
          fetch('/api/productos', { headers }),
          fetch('/api/clientes', { headers })
        ])

        if (pedidosRes.ok) {
          const data = await pedidosRes.json()
          setPedidos(data.pedidos || [])
          setPendingCount((data.pedidos || []).filter(p => p.estado === 'pendiente').length)
        }
        let count = 0
        if (productosRes.ok) {
          const data = await productosRes.json()
          const prods = Array.isArray(data) ? data : []
          setProductos(prods)
          count = prods.length
          setProductosCount(count)
        }
        if (clientesRes.ok) {
          const data = await clientesRes.json()
          setClientes(Array.isArray(data) ? data : [])
        }
        
        // Suscribir a cambios en tiempo real
        channel = supabase
          .channel(`layout-pedidos-${t.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos', filter: `tienda_id=eq.${t.id}` },
            async () => {
              const { data: { session: s } } = await supabase.auth.getSession()
              if (!s) return
              const r = await fetch('/api/pedidos', { headers: { Authorization: `Bearer ${s.access_token}` } })
              if (r.ok) {
                const d = await r.json()
                setPendingCount((d.pedidos || []).filter(p => p.estado === 'pendiente').length)
              }
            }
          )
          .subscribe()

        // Mostrar Onboarding Welcome Modal
        const config = t.config_diseno || {}
        const isPagosConfigured = !!config.pagos && Object.keys(config.pagos).some(k => config.pagos[k]?.habilitado)
        const isDone = !!t.subdominio && isPagosConfigured && count > 0

        // Si no está listo y no ha sido descartado, mostramos el Welcome modal
        if (!isDone && typeof window !== 'undefined' && !sessionStorage.getItem('welcome_dismissed')) {
          setShowWelcomeModal(true)
        }
      }
      setLoading(false)
    }
    init()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [router])

  // Cerrar sidebar al cambiar de ruta
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    resetearIdentidad()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  // ── Nav structure: primary actions flat, secondary grouped ──
  // Order based on Square/Shopify UX research: most-used first
  const primaryNav = [
    {
      key: 'pos',
      icon: Wallet,
      label: lang === 'it' ? 'Cassa (POS)' : lang === 'en' ? 'POS / Checkout' : 'Cobrar (POS)',
      href: '/dashboard/pos',
      highlight: true, // CTA principal
    },
    {
      key: 'pedidos',
      icon: ClipboardList,
      label: lang === 'it' ? 'Ordini' : lang === 'en' ? 'Orders' : 'Pedidos',
      href: '/dashboard/pedidos',
      badge: pendingCount,
    },
    {
      key: 'productos',
      icon: Package,
      label: lang === 'it' ? 'Prodotti' : lang === 'en' ? 'Products' : 'Productos',
      href: '/dashboard/productos',
    },
    {
      key: 'clientes',
      icon: BookUser,
      label: lang === 'it' ? 'Clienti & Fidi' : lang === 'en' ? 'Customers' : 'Clientes & Fiados',
      href: '/dashboard/clientes',
    },
    {
      key: 'reportes',
      icon: TrendingUp,
      label: lang === 'it' ? 'Analitiche' : lang === 'en' ? 'Reports' : 'Reportes',
      href: '/dashboard/reportes',
    },
  ]

  const secondaryNav = [
    { icon: Home, label: lang === 'it' ? 'Home' : lang === 'en' ? 'Home' : 'Inicio', href: '/dashboard' },
    { icon: FolderTree, label: lang === 'it' ? 'Categorie' : lang === 'en' ? 'Categories' : 'Categorías', href: '/dashboard/categorias' },
    { icon: ShoppingBag, label: lang === 'it' ? 'Acquisti' : lang === 'en' ? 'Purchases' : 'Compras', href: '/dashboard/compras' },
    { icon: Paintbrush, label: lang === 'it' ? 'Design' : lang === 'en' ? 'Design' : 'Diseño', href: '/dashboard/diseno' },
  ]

  const settingsNav = [
    { icon: Settings, label: lang === 'it' ? 'Impostazioni' : lang === 'en' ? 'Settings' : 'Ajustes', href: '/dashboard/ajustes' },
    { icon: UserCircle, label: lang === 'it' ? 'Il mio account' : lang === 'en' ? 'My Account' : 'Mi Cuenta', href: '/dashboard/cuenta' },
    { icon: CreditCard, label: lang === 'it' ? 'Piani' : lang === 'en' ? 'Plans' : 'Planes', href: '/dashboard/planes' },
  ]

  // En producción usamos el subdominio real; en desarrollo la ruta interna /store/
  const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('tiendaonline.it')
  const storeUrl = tienda?.subdominio
    ? isProduction
      ? `https://${tienda.subdominio}.tiendaonline.it`
      : `/store/${tienda.subdominio}`
    : null

  const inicial = tienda?.nombre ? tienda.nombre.charAt(0).toUpperCase() : '?'

  // ── Sidebar content (shared between desktop and mobile drawer) ──
  const SidebarContent = () => (
    <>
      <div className="p-5 pb-2 relative z-10 flex-1 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 cursor-default">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/30 shrink-0">
            <ShoppingBag size={20} />
          </div>
          <span className="font-black text-slate-900 tracking-tight text-base">TIENDAONLINE</span>
        </div>

        {/* ── Gamification Checklist ── */}
        {!loading && tienda && (
          <div className="mb-5 -mx-1">
            <DashboardChecklist
              tienda={tienda}
              productos={productos}
              pedidos={pedidos}
              clientes={clientes}
            />
          </div>
        )}

        {/* ── PRIMARY NAV: Top 5 most-used actions — always flat, always visible ── */}
        <nav aria-label="Navegación principal" className="flex flex-col gap-1 mb-4">
          {primaryNav.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <button
                key={item.key}
                onClick={() => router.push(item.href)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer w-full text-left
                  min-h-[48px]
                  ${item.highlight && !isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary/90 border border-primary/0'
                    : isActive
                      ? 'bg-primary/10 text-primary border border-primary/15'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                  }`}
              >
                <Icon size={18} className={item.highlight && !isActive ? 'text-white' : isActive ? 'text-primary' : 'text-slate-400'} />
                <span className="flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full min-w-[20px] text-center ${
                    isActive ? 'bg-primary/20 text-primary' : 'bg-emerald-500 text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* ── DIVIDER ── */}
        <div className="border-t border-slate-100 my-3" />

        {/* ── SECONDARY NAV: Less-used actions, collapsible ── */}
        <div>
          <button
            onClick={() => toggleGroup('secondary')}
            className="flex items-center gap-2 w-full px-2 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            <span className="flex-1 text-left">{lang === 'it' ? 'Altro' : lang === 'en' ? 'More' : 'Más'}</span>
            <ChevronDown
              size={12}
              className={`text-slate-400 transition-transform duration-200 ${openGroups.secondary !== false ? 'rotate-180' : ''}`}
            />
          </button>
          {openGroups.secondary !== false && (
            <nav aria-label="Navegación secundaria" className="flex flex-col gap-0.5 mt-1">
              {secondaryNav.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 px-3.5 min-h-[44px] rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer w-full text-left
                      ${isActive
                        ? 'bg-primary/10 text-primary border border-primary/15'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                      }`}
                  >
                    <Icon size={16} className={isActive ? 'text-primary' : 'text-slate-400'} />
                    <span className="flex-1">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          )}
        </div>
      </div>

      {/* Bottom: settings + store info + logout */}
      <div className="p-4 border-t border-slate-200/50 bg-white/40 shrink-0">
        {loading ? (
          <div className="text-slate-400 text-sm text-center py-4">{dict.caricamento}</div>
        ) : (
          <>
            {/* Store card */}
            <div className="flex items-center gap-3 mb-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
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

            {/* Settings nav items */}
            <nav aria-label="Configuración" className="flex flex-col gap-0.5 mb-3">
              {settingsNav.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-2.5 px-3 min-h-[40px] rounded-lg font-medium text-xs transition-all cursor-pointer w-full text-left
                      ${isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                  >
                    <Icon size={15} className={isActive ? 'text-primary' : 'text-slate-400'} />
                    <span className="flex-1">{item.label}</span>
                  </button>
                )
              })}
            </nav>

            {/* Visit store */}
            {storeUrl && (
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full min-h-[40px] mb-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                <Globe size={15} /> {dict.visitarSitio || 'Ver Tienda'}
              </a>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full min-h-[40px] rounded-xl border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-100 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut size={15} /> {dict.salir || 'Cerrar Sesión'}
            </button>
          </>
        )}
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">

      {/* ── Welcome Video Modal ── */}
      {showWelcomeModal && tienda && (
        <OnboardingWizard 
          tienda={tienda} 
          onDismiss={() => {
            sessionStorage.setItem('welcome_dismissed', 'true')
            setShowWelcomeModal(false)
          }} 
        />
      )}

      {/* ───── SIDEBAR DESKTOP (oculto en móvil) ───── */}
      <aside className="hidden md:flex w-64 bg-white/60 backdrop-blur-xl border-r border-slate-200/50 flex-col sticky top-0 h-screen box-border shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent />
      </aside>

      {/* ───── SIDEBAR MÓVIL (drawer) ───── */}
      {/* Overlay oscuro */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal móvil"
        aria-hidden={!sidebarOpen}
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 md:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Botón cerrar */}
        <button
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 z-20"
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* ───── MAIN ───── */}
      <main id="main-content" className="flex-1 flex flex-col min-w-0 bg-slate-50" tabIndex="-1">
        {/* Topbar */}
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            {/* Botón hamburguesa - solo en móvil */}
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={sidebarOpen}
              aria-controls="mobile-sidebar"
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="font-semibold text-slate-800 flex items-center gap-2">
              <Store size={18} className="text-slate-500 hidden md:block" />
              {loading ? '...' : (tienda?.nombre || dict.dashboard || 'Dashboard')}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <PlanBanner tienda={tienda} />
          {children}
        </div>

        <UniversalFooter />
      </main>
    </div>
  )
}