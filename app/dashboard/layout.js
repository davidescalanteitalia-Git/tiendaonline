'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

import { C } from '../../lib/theme'
import LanguageSelector from '../../components/LanguageSelector'
import UniversalFooter from '../../components/UniversalFooter'

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
  const [tienda,  setTienda]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeItem, setActiveItem] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/dashboard'
  )

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const menuItems = [
    { icon: '🏠', label: 'Home',         href: '/dashboard' },
    { icon: '📦', label: 'Prodotti',     href: '/dashboard/productos' },
    { icon: '📁', label: 'Categorie',    href: '/dashboard/categorias' },
    { icon: '🛒', label: 'Ordini',       href: '/dashboard/pedidos' },
    { icon: '🎨', label: 'Design',       href: '/dashboard/diseno' },
    { icon: '⚙️', label: 'Impostazioni', href: '/dashboard/ajustes' },
  ]

  const storeUrl = tienda?.subdominio
    ? `https://${tienda.subdominio}.tiendaonline.it`
    : null

  const inicial = tienda?.nombre
    ? tienda.nombre.charAt(0).toUpperCase()
    : '?'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.grayBg, fontFamily: "'Inter', sans-serif" }}>

      {/* ───── SIDEBAR ───── */}
      <aside style={{
        width: '260px',
        background: C.white,
        borderRight: `1px solid ${C.grayBorder}`,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <span style={{ fontSize: '1.4rem' }}>🛍️</span>
          <span style={{ fontWeight: 900, color: C.green, fontSize: '1.05rem', letterSpacing: '-0.5px' }}>TIENDAONLINE</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const isActive = activeItem === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setActiveItem(item.href)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 14px', borderRadius: '10px',
                  color: isActive ? C.green : C.text,
                  background: isActive ? C.greenBg : 'transparent',
                  textDecoration: 'none',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.93rem',
                  border: isActive ? `1px solid ${C.greenBorder}` : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                {item.label}
              </a>
            )
          })}
        </nav>

        {/* Bottom: store info + logout */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: `1px solid ${C.grayBorder}` }}>
          {loading ? (
            <div style={{ color: C.textMuted, fontSize: '0.85rem', textAlign: 'center' }}>Caricamento...</div>
          ) : (
            <>
              {/* Store card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: C.greenBg, border: `2px solid ${C.greenBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: C.green, fontWeight: 900, fontSize: '1rem', flexShrink: 0,
                }}>
                  {inicial}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tienda?.nombre || '—'}
                  </div>
                  {tienda?.subdominio && (
                    <div style={{ fontSize: '0.72rem', color: C.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '8px 12px', borderRadius: '8px', width: '100%',
                    background: C.greenBg, color: C.green, border: `1px solid ${C.greenBorder}`,
                    fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none',
                    marginBottom: '8px', boxSizing: 'border-box',
                  }}
                >
                  🌍 Vedi la tua bottega
                </a>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '8px', borderRadius: '8px',
                  background: 'transparent', color: C.textMuted,
                  border: `1px solid ${C.grayBorder}`,
                  fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                🚪 Esci
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ───── MAIN ───── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: '64px', background: C.white,
          borderBottom: `1px solid ${C.grayBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ fontWeight: 700, color: C.text, fontSize: '1rem' }}>
            {loading ? '...' : (tienda?.nombre || 'Dashboard')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LanguageSelector />
            {storeUrl && (
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: C.green, color: C.white,
                  padding: '8px 18px', borderRadius: '8px',
                  fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
                  boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
                }}
              >
                🌍 Apri bottega
              </a>
            )}
          </div>
        </header>

        {/* Content */}
        <div style={{ padding: '32px 36px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            {children}
          </div>
          <div style={{ marginTop: '40px' }}>
            <UniversalFooter />
          </div>
        </div>
      </main>

    </div>
  )
}
