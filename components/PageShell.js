'use client'

import Image from 'next/image'
import LanguageSelector from './LanguageSelector'
import UniversalFooter from './UniversalFooter'

import { C } from '../lib/theme'
import { DICTIONARY } from '../lib/dictionaries'
import { useLang } from './LanguageProvider'

export default function PageShell({ children }) {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['it']

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LanguageSelector />
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
              {dict.iniziaGratis}
            </a>
          </div>
        </div>
      </header>

      {/* ── Contenido ── */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <UniversalFooter />

    </div>
  )
}
