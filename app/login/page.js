'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const C = {
  green:      '#059669',
  greenDark:  '#047857',
  white:      '#ffffff',
  text:       '#0f172a',
  textMuted:  '#64748b',
  grayBorder: '#e2e8f0',
  grayBg:     '#f8fafc',
  error:      '#ef4444',
}

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (authError) {
      setError('Email o password non corretti.')
      setLoading(false)
      return
    }

    // Si es el admin, va al panel de admin
    if (data.user?.email === 'davidescalanteitalia@gmail.com') {
      router.push('/administrador')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a5c2a 0%, #2d8a45 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      <div style={{
        background:    C.white,
        borderRadius:  '24px',
        width:         '100%',
        maxWidth:      '420px',
        padding:       '48px 40px',
        boxShadow:     '0 25px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ color: C.green, fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            🛍️ TIENDAONLINE
          </div>
          <h1 style={{ color: C.text, fontSize: '1.6rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>Bentornato 👋</h1>
          <p style={{ color: C.textMuted, fontSize: '0.9rem', margin: 0 }}>Accedi al tuo pannello di controllo.</p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border:     `1px solid #fecaca`,
            color:      C.error,
            padding:    '12px 16px',
            borderRadius: '10px',
            fontSize:   '0.88rem',
            fontWeight: 600,
            marginBottom: '20px',
            textAlign:  'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text, marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              style={{
                width:        '100%',
                padding:      '12px 16px',
                borderRadius: '10px',
                border:       `1px solid ${C.grayBorder}`,
                background:   C.grayBg,
                fontSize:     '0.95rem',
                color:        C.text,
                outline:      'none',
                boxSizing:    'border-box',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: C.text }}>Password</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width:        '100%',
                padding:      '12px 16px',
                borderRadius: '10px',
                border:       `1px solid ${C.grayBorder}`,
                background:   C.grayBg,
                fontSize:     '0.95rem',
                color:        C.text,
                outline:      'none',
                boxSizing:    'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width:        '100%',
              background:   loading ? '#9ca3af' : C.green,
              color:        C.white,
              border:       'none',
              padding:      '14px',
              borderRadius: '10px',
              fontWeight:   700,
              fontSize:     '1rem',
              marginTop:    '6px',
              cursor:       loading ? 'not-allowed' : 'pointer',
              transition:   'background 0.2s',
              fontFamily:   'inherit',
            }}
          >
            {loading ? 'Accesso in corso...' : 'Accedi →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.88rem', color: C.textMuted }}>
          Non hai ancora un account?{' '}
          <a href="/register" style={{ color: C.green, fontWeight: 700, textDecoration: 'none' }}>
            Crea la tua vetrina
          </a>
        </div>
      </div>
    </div>
  )
}
