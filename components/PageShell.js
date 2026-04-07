'use client'

import Image from 'next/image'

import { C } from '../lib/theme'
export default function PageShell({ children }) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: '#111827', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <header className="glass-header" style={{
        position:      'sticky',
        top:           0,
        zIndex:        100,
      }}>
        <div style={{
          maxWidth:      '1100px',
          margin:        '0 auto',
          padding:       '0 20px',
          display:       'flex',
          alignItems:    'center',
          justifyContent:'space-between',
          height:        '64px',
        }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/logo.png" alt="TIENDAONLINE" width={36} height={36} style={{ borderRadius: '8px' }} />
            <span style={{ color: C.green, fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>
              TIENDAONLINE
            </span>
          </a>
          <a href="/register" className="glow-btn" style={{
            display:       'inline-block',
            background:    C.green,
            color:         C.white,
            padding:       '8px 16px',
            borderRadius:  '8px',
            textDecoration:'none',
            fontSize:      '0.85rem',
            fontWeight:    700,
            boxShadow:     `0 4px 10px rgba(5, 150, 105, 0.25)`,
          }}>
            Inizia gratis →
          </a>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: C.greenDark, padding: '40px 20px 28px', color: C.white }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Image src="/logo.jpg" alt="TIENDAONLINE" width={32} height={32} style={{ borderRadius: '6px' }} />
              <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>TIENDAONLINE</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {[
                { label: 'Privacy Policy',      href: '/privacy'   },
                { label: 'Termini di servizio', href: '/terms'     },
                { label: 'Contatti',            href: '/contatti'  },
              ].map((link, i) => (
                <a key={i} href={link.href} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '0 0 16px' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px', opacity: 0.5, fontSize: '0.8rem' }}>
            <span>© 2025 TIENDAONLINE · tiendaonline.it</span>
            <span>🛍️ Sviluppato da David Escalante</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
