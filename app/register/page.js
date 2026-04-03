'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import PageShell from '../../components/PageShell'
import { supabase } from '../../lib/supabase'

const C = {
  green:      '#059669',
  greenDark:  '#047857',
  white:      '#ffffff',
  text:       '#0f172a',
  textMuted:  '#64748b',
  grayBorder: '#e2e8f0',
  grayBg:     '#f8fafc',
  redBg:      '#fef2f2',
  redText:    '#b91c1c',
  redBorder:  '#fecaca',
}

export default function RegisterPage() {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    nombre:      '',
    subdominio:  '',
    whatsapp:    '',
    email:       '',
    password:    '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    // El subdominio solo permite letras minúsculas, números y guiones
    if (name === 'subdominio') {
      setForm(f => ({ ...f, subdominio: value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones básicas
    if (!form.nombre || !form.subdominio || !form.whatsapp || !form.email || !form.password) {
      setError('Compila tutti i campi.')
      return
    }
    if (form.password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri.')
      return
    }

    setLoading(true)

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email:    form.email,
        password: form.password,
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Questa email è già registrata. Prova ad accedere.')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      // 2. Insertar tienda en la tabla tiendas
      const { error: dbError } = await supabase
        .from('tiendas')
        .insert({
          nombre:     form.nombre,
          subdominio: form.subdominio,
          whatsapp:   form.whatsapp,
          user_id:    authData.user.id,
          estado:     'activo',
        })

      if (dbError) {
        if (dbError.message.includes('duplicate') || dbError.code === '23505') {
          setError('Questo sottodominio è già in uso. Scegline un altro.')
        } else {
          setError('Errore durante la creazione del negozio. Riprova.')
        }
        setLoading(false)
        return
      }

      // 3. Redirigir al dashboard
      router.push('/dashboard')

    } catch (err) {
      setError('Si è verificato un errore imprevisto. Riprova.')
      setLoading(false)
    }
  }

  const inputStyle = {
    width:        '100%',
    padding:      '12px 16px',
    borderRadius: '10px',
    border:       `1px solid ${C.grayBorder}`,
    background:   C.grayBg,
    fontSize:     '0.95rem',
    color:        C.text,
    outline:      'none',
    boxSizing:    'border-box',
  }

  return (
    <PageShell>
      <section className="gradient-bg" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

        <div className="premium-shadow" style={{
          background:   C.white,
          borderRadius: '24px',
          width:        '100%',
          maxWidth:     '500px',
          padding:      '48px 40px',
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ color: C.text, fontSize: '1.8rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
              Crea la tua bottega
            </h1>
            <p style={{ color: C.textMuted, fontSize: '0.95rem', margin: 0 }}>
              Inizia a vendere online in pochi minuti.
            </p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Nome del Negozio */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text, marginBottom: '8px' }}>
                Nome del Negozio
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Es: Pizzeria da Mario"
                style={inputStyle}
              />
            </div>

            {/* Sottodominio */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text, marginBottom: '8px' }}>
                Sottodominio unico (es: mia-bottega)
              </label>
              <div style={{
                display:      'flex',
                alignItems:   'center',
                border:       `1px solid #d1fae5`,
                borderRadius: '10px',
                background:   C.white,
                overflow:     'hidden',
              }}>
                <span style={{ padding: '12px 4px 12px 16px', color: '#9ca3af', fontSize: '0.9rem', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  https://
                </span>
                <input
                  type="text"
                  name="subdominio"
                  value={form.subdominio}
                  onChange={handleChange}
                  placeholder="mia-bottega"
                  style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', fontSize: '0.95rem', color: C.text, outline: 'none', minWidth: '0' }}
                />
                <span style={{ padding: '12px 16px 12px 4px', color: '#9ca3af', fontSize: '0.9rem', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  .tiendaonline.it
                </span>
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text, marginBottom: '8px' }}>
                📱 WhatsApp del negozio
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="+39 333 123 4567"
                style={inputStyle}
              />
              <span style={{ fontSize: '0.8rem', color: C.textMuted, marginTop: '4px', display: 'block' }}>
                I clienti ti invieranno gli ordini su questo numero.
              </span>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text, marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text, marginBottom: '8px' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                background:   C.redBg,
                color:        C.redText,
                border:       `1px solid ${C.redBorder}`,
                padding:      '12px',
                borderRadius: '8px',
                fontSize:     '0.9rem',
                textAlign:    'center',
                fontWeight:   500,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="glow-btn"
              style={{
                width:        '100%',
                background:   loading ? '#86efac' : C.green,
                color:        loading ? '#064e3b' : C.white,
                border:       'none',
                padding:      '14px',
                borderRadius: '10px',
                fontWeight:   700,
                fontSize:     '1rem',
                marginTop:    '10px',
                cursor:       loading ? 'wait' : 'pointer',
                boxShadow:    `0 4px 15px rgba(5, 150, 105, 0.2)`,
                transition:   'all 0.3s ease',
                opacity:      loading ? 0.7 : 1,
                fontFamily:   'inherit',
              }}
            >
              {loading ? 'Creando la tua bottega...' : 'Crea il mio negozio →'}
            </button>

          </form>

          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.9rem', color: C.textMuted }}>
            Hai già un account?{' '}
            <a href="/login" style={{ color: C.greenDark, fontWeight: 700, textDecoration: 'none' }}>
              Accedi
            </a>
          </div>

        </div>
      </section>
    </PageShell>
  )
}
