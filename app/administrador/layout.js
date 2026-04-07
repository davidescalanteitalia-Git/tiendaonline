'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const ADMIN_EMAIL = 'davidescalanteitalia@gmail.com'

import { C as ThemeC } from '../../lib/theme'

const C = {
  bg:        ThemeC.grayBg,
  sidebar:   ThemeC.white,
  green:     ThemeC.green,
  greenHover:ThemeC.greenDark,
  white:     ThemeC.white,
  text:      ThemeC.text,
  textMuted: ThemeC.textMuted,
  border:    ThemeC.grayBorder,
  active:    ThemeC.green,
}
const NAV = [
  { href: '/administrador',          icon: '🏠', label: 'Dashboard'   },
  { href: '/administrador/usuarios', icon: '👥', label: 'Usuarios'    },
  { href: '/administrador/tiendas',  icon: '🏪', label: 'Tiendas'     },
]

export default function AdminLayout({ children }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [admin,    setAdmin]    = useState(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || session.user.email !== ADMIN_EMAIL) {
        router.replace('/login')
      } else {
        setAdmin(session.user)
        setChecking(false)
      }
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: C.textMuted, fontSize: '1rem' }}>Verificando acceso...</div>
      </div>
    )
  }

  const sidebarW = collapsed ? '64px' : '240px'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width:      sidebarW,
        minHeight:  '100vh',
        background: C.sidebar,
        borderRight:`1px solid ${C.border}`,
        display:    'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow:   'hidden',
        flexShrink: 0,
        position:   'sticky',
        top:        0,
        height:     '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '10px', justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed && (
            <div>
              <div style={{ color: C.green, fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.5px' }}>TIENDAONLINE</div>
              <div style={{ color: C.textMuted, fontSize: '0.7rem', fontWeight: 500 }}>Panel Admin</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'transparent', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: '1.1rem', padding: '4px', borderRadius: '6px', flexShrink: 0 }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV.map((item) => {
            const isActive = pathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display:       'flex',
                  alignItems:    'center',
                  gap:           '10px',
                  padding:       '10px 12px',
                  borderRadius:  '8px',
                  background:    isActive ? C.green : 'transparent',
                  color:         isActive ? C.white : C.textMuted,
                  textDecoration:'none',
                  fontSize:      '0.88rem',
                  fontWeight:    isActive ? 700 : 500,
                  transition:    'all 0.15s',
                  whiteSpace:    'nowrap',
                  overflow:      'hidden',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </a>
            )
          })}
        </nav>

        {/* Footer sidebar */}
        <div style={{ padding: '12px 8px', borderTop: `1px solid ${C.border}` }}>
          {!collapsed && (
            <div style={{ padding: '8px 12px', marginBottom: '8px' }}>
              <div style={{ color: C.text, fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {admin?.email}
              </div>
              <div style={{ color: C.green, fontSize: '0.7rem', fontWeight: 700 }}>Super Admin</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width:        '100%',
              background:   'transparent',
              border:       `1px solid ${C.border}`,
              color:        C.textMuted,
              padding:      '8px 12px',
              borderRadius: '8px',
              cursor:       'pointer',
              fontSize:     '0.82rem',
              fontWeight:   600,
              display:      'flex',
              alignItems:   'center',
              gap:          '8px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              fontFamily:   'inherit',
            }}
          >
            <span>🚪</span>
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'auto' }}>
        {/* Topbar */}
        <div style={{
          background:   C.sidebar,
          borderBottom: `1px solid ${C.border}`,
          padding:      '0 24px',
          height:       '60px',
          display:      'flex',
          alignItems:   'center',
          justifyContent:'space-between',
          position:     'sticky',
          top:          0,
          zIndex:       50,
        }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: '1rem' }}>
            {NAV.find(n => n.href === pathname)?.icon} {NAV.find(n => n.href === pathname)?.label || 'Admin'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a href="/" target="_blank" style={{ color: C.textMuted, fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🌐 Ver sitio
            </a>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 800, fontSize: '0.85rem' }}>
              D
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '28px 24px', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  )
}
