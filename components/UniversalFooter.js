'use client'

import Image from 'next/image'
import { C } from '../lib/theme'
import { DICTIONARY } from '../lib/dictionaries'
import { useLang } from './LanguageProvider'

const STORAGE_KEY = 'tiendaonline_cookie_consent'

export default function UniversalFooter() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['it']

  return (
    <footer style={{ background: C.greenDark, padding: '40px 20px 28px', color: C.white, width: '100%', marginTop: 'auto' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Image src="/logo.jpg" alt="TIENDAONLINE" width={32} height={32} style={{ borderRadius: '6px' }} />
              <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>TIENDAONLINE</h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
              {dict.footerTagline}
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', marginTop: '8px' }}>
            <a href="/privacy" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.86rem' }}>{dict.footerPrivacy}</a>
            <a href="/terms" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.86rem' }}>{dict.footerTerms}</a>
            <a href="/cookie-policy" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.86rem' }}>Cookie Policy</a>
            <a href="/contatti" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.86rem' }}>{dict.footerContact}</a>
            <button
              onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.reload() }}
              style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
            >
              🍪 {lang === 'it' ? 'Gestisci cookie' : lang === 'es' ? 'Gestionar cookies' : 'Manage cookies'}
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
          <div>© {new Date().getFullYear()} TIENDAONLINE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{dict.footerCredit}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
