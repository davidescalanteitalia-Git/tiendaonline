'use client'

import { useState } from 'react'
import Image from 'next/image'

const C = {
  green:      '#059669',
  greenDark:  '#047857',
  greenBg:    '#f0fdf4',
  greenBorder:'#d1fae5',
  white:      '#ffffff',
  text:       '#0f172a',
  textMuted:  '#64748b',
  grayBorder: '#e2e8f0',
  grayBg:     '#f8fafc',
}

export default function DashboardLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const menuItems = [
    { icon: '🏠', label: 'Inicio', href: '/dashboard', active: true },
    { icon: '📦', label: 'Productos', href: '#' },
    { icon: '📁', label: 'Categorías', href: '#' },
    { icon: '🛒', label: 'Pedidos', href: '#' },
    { icon: '🎨', label: 'Diseño', href: '#' },
    { icon: '⚙️', label: 'Ajustes', href: '#' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.grayBg, fontFamily: "'Inter', sans-serif" }}>
      
      {/* Sidebar (Desktop) */}
      <aside style={{
        width: '260px',
        background: C.white,
        borderRight: `1px solid ${C.grayBorder}`,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <Image src="/logo.png" alt="TIENDAONLINE" width={32} height={32} style={{ borderRadius: '8px' }} />
          <span style={{ fontWeight: 900, color: C.green, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>TIENDAONLINE</span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item, i) => (
            <a key={i} href={item.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              color: item.active ? C.greenDark : C.text,
              background: item.active ? C.greenBg : 'transparent',
              textDecoration: 'none',
              fontWeight: item.active ? 700 : 500,
              fontSize: '0.95rem',
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: `1px solid ${C.grayBorder}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: C.greenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.green, fontWeight: 'bold' }}>D</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text }}>Pizzeria Mario</div>
              <div style={{ fontSize: '0.8rem', color: C.textMuted }}>mario.tiendaonline.it</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{
          height: '64px',
          background: C.white,
          borderBottom: `1px solid ${C.grayBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}>
          <div style={{ fontWeight: 700, color: C.text, fontSize: '1.1rem' }}>Dashboard</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ background: C.greenBg, color: C.greenDark, border: `1px solid ${C.greenBorder}`, padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
              🌍 Visualiza Tienda
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ padding: '32px 40px', flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>

    </div>
  )
}
