'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../components/LanguageProvider'
import { DICTIONARY } from '../../lib/dictionaries'

import { C } from '../../lib/theme'

export default function LoginPage() {
  const router = useRouter()
  const { lang, changeLang } = useLang()
  const dict = DICTIONARY[lang]

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (authError) {
      setError(dict.erroreLogin)
      setLoading(false)
      return
    }

    if (data.user?.email === 'davidescalanteitalia@gmail.com') {
      router.push('/administrador')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a5c2a 0%, #2d8a45 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ background: C.white, borderRadius: '24px', width: '100%', maxWidth: '420px', padding: '48px 40px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>

        {/* Language selector */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginBottom: '24px' }}>
          {['it', 'es', 'en'].map(l => (
            <button key={l} onClick={() => changeLang(l)} style={{
              padding:      '3px 9px',
              borderRadius: '20px',
              border:       `1.5px solid ${lang === l ? C.green : '#ddd'}`,
              background:   lang === l ? C.green : 'transparent',
              color:        lang === l ? '#fff' : C.textMuted,
              fontSize:     '0.7rem',
              fontWeight:   700,
              cursor:       'pointer',
              textTransform:'uppercase',
              letterSpacing:'0.5px',
            }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ color: C.green, fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.5px', marginBottom: '8px' }}>🛍️ TIENDAONLINE</div>
          <h1 style={{ color: C.text, fontSize: '1.6rem', fontWeight: 900, margin: '0 0 6px' }}>{dict.bentornato}</h1>
          <p style={{ color: C.textMuted, fontSize: '0.9rem', margin: 0 }}>{dict.accediAlPannello}</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: C.error, padding: '12px 16px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text, marginBottom: '8px' }}>{dict.emailLabel}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={dict.emailPlaceholder} required
              style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${C.grayBorder}`, background: C.grayBg, fontSize: '0.95rem', color: C.text, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: C.text }}>{dict.passwordLabel}</label>
            <div style={{ position: 'relative', marginTop: '8px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={dict.passwordPlaceholder}
                required
                style={{ width: '100%', padding: '12px 44px 12px 16px', borderRadius: '10px', border: `1px solid ${C.grayBorder}`, background: C.grayBg, fontSize: '0.95rem', color: C.text, outline: 'none', boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: C.textMuted, fontSize: '1.1rem', lineHeight: 1 }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', background: loading ? '#9ca3af' : C.green, color: C.white, border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {loading ? dict.verificando : dict.accediBtn}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.88rem', color: C.textMuted }}>
          {dict.nonHaiAccount}{' '}
          <a href="/register" style={{ color: C.green, fontWeight: 700, textDecoration: 'none' }}>{dict.creaVetrinaLink}</a>
        </div>
      </div>

      {/* Bottom info */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { label: dict.footerPrivacy || 'Privacy Policy', href: '/privacy' },
          { label: dict.footerTerms   || 'Termini',        href: '/terms'   },
          { label: dict.footerContact || 'Contatti',       href: '/contatti'},
        ].map((link, i) => (
          <a key={i} href={link.href} style={{
            color:         'rgba(255,255,255,0.7)',
            textDecoration:'none',
            fontSize:      '0.78rem',
            fontWeight:    500,
            transition:    'color 0.15s',
          }}>
            {link.label}
          </a>
        ))}
      </div>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', marginTop: '12px', textAlign: 'center' }}>
        © 2026 TIENDAONLINE · tiendaonline.it
      </p>
    </div>
  )
}
