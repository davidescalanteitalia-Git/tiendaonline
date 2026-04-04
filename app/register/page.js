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
  amberBg:    '#fffbeb',
  amberText:  '#92400e',
  amberBorder:'#fcd34d',
}

// Mensajes de error específicos por código
const ERROR_MESSAGES = {
  subdomain_taken: '❌ Este subdominio ya está en uso. Elige otro nombre.',
  whatsapp_taken:  '❌ Este número de WhatsApp ya está registrado.',
  email_taken:     '❌ Este email ya tiene una cuenta. ¿Quieres acceder?',
  user_error:      '❌ Error al crear la cuenta. Verifica tu email y contraseña.',
  store_error:     '❌ Error al crear la tienda. Inténtalo de nuevo.',
  unexpected:      '❌ Error inesperado. Inténtalo de nuevo en unos segundos.',
}

export default function RegisterPage() {
  const router  = useRouter()
  const [loading,      setLoading]      = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState('')
  const [fieldError,   setFieldError]   = useState({})

  const [form, setForm] = useState({
    nombre:     '',
    subdominio: '',
    whatsapp:   '',
    email:      '',
    password:   '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    // El subdominio solo permite letras minúsculas, números y guiones
    if (name === 'subdominio') {
      setForm(f => ({ ...f, subdominio: value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
    // Limpiar errores al escribir
    if (fieldError[name]) setFieldError(e => ({ ...e, [name]: '' }))
    setError('')
  }

  const validate = () => {
    const errors = {}
    if (!form.nombre.trim())            errors.nombre     = 'Inserisci il nome del negozio.'
    if (!form.subdominio.trim())        errors.subdominio = 'Inserisci un sottodominio.'
    if (form.subdominio.length < 3)     errors.subdominio = 'Il sottodominio deve avere almeno 3 caratteri.'
    if (!form.whatsapp.trim())          errors.whatsapp   = 'Inserisci il numero di WhatsApp.'
    if (!/^\+?[0-9\s\-]{7,}$/.test(form.whatsapp)) errors.whatsapp = 'Formato non valido. Es: +39 333 123 4567'
    if (!form.email.trim())             errors.email      = 'Inserisci la tua email.'
    if (!/\S+@\S+\.\S+/.test(form.email)) errors.email   = 'Email non valida.'
    if (!form.password)                 errors.password   = 'Inserisci una password.'
    if (form.password.length < 6)       errors.password   = 'La password deve avere almeno 6 caratteri.'
    return errors
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setFieldError({})

    // Validación local primero
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldError(errors)
      return
    }

    setLoading(true)

    try {
      // Llamar a la API route server-side (usa service role key)
      const res = await fetch('/api/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        // Mapear errores específicos a campos
        if (data.error === 'subdomain_taken') {
          setFieldError({ subdominio: ERROR_MESSAGES.subdomain_taken })
        } else if (data.error === 'whatsapp_taken') {
          setFieldError({ whatsapp: ERROR_MESSAGES.whatsapp_taken })
        } else if (data.error === 'email_taken') {
          setFieldError({ email: ERROR_MESSAGES.email_taken })
        } else {
          setError(ERROR_MESSAGES[data.error] || ERROR_MESSAGES.unexpected)
        }
        setLoading(false)
        return
      }

      // Registro exitoso → hacer login automático
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email:    form.email,
        password: form.password,
      })

      if (loginError) {
        // El usuario fue creado pero el login falló; redirigir al login manual
        router.push('/login')
        return
      }

      router.push('/dashboard')

    } catch (err) {
      setError(ERROR_MESSAGES.unexpected)
      setLoading(false)
    }
  }

  const inputStyle = (field) => ({
    width:        '100%',
    padding:      '12px 16px',
    borderRadius: '10px',
    border:       `1.5px solid ${fieldError[field] ? '#fca5a5' : C.grayBorder}`,
    background:   fieldError[field] ? '#fef2f2' : C.grayBg,
    fontSize:     '0.95rem',
    color:        C.text,
    outline:      'none',
    boxSizing:    'border-box',
    transition:   'border-color 0.2s',
  })

  const FieldError = ({ field }) => fieldError[field] ? (
    <span style={{ fontSize: '0.8rem', color: C.redText, marginTop: '5px', display: 'block', fontWeight: 500 }}>
      {fieldError[field]}
    </span>
  ) : null

  const Label = ({ children }) => (
    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text, marginBottom: '8px' }}>
      {children}
    </label>
  )

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

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Nome del Negozio */}
            <div>
              <Label>Nome del Negozio</Label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                placeholder="Es: Pizzeria da Mario" style={inputStyle('nombre')} />
              <FieldError field="nombre" />
            </div>

            {/* Sottodominio */}
            <div>
              <Label>Sottodominio unico (es: mia-bottega)</Label>
              <div style={{
                display:      'flex',
                alignItems:   'center',
                border:       `1.5px solid ${fieldError.subdominio ? '#fca5a5' : '#d1fae5'}`,
                borderRadius: '10px',
                background:   fieldError.subdominio ? '#fef2f2' : C.white,
                overflow:     'hidden',
              }}>
                <span style={{ padding: '12px 4px 12px 16px', color: '#9ca3af', fontSize: '0.9rem', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  https://
                </span>
                <input type="text" name="subdominio" value={form.subdominio} onChange={handleChange}
                  placeholder="mia-bottega"
                  style={{ flex: 1, padding: '12px 0', border: 'none', background: 'transparent', fontSize: '0.95rem', color: C.text, outline: 'none', minWidth: '0' }} />
                <span style={{ padding: '12px 16px 12px 4px', color: '#9ca3af', fontSize: '0.9rem', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  .tiendaonline.it
                </span>
              </div>
              <FieldError field="subdominio" />
            </div>

            {/* WhatsApp */}
            <div>
              <Label>📱 WhatsApp del negozio</Label>
              <input type="tel" name="whatsapp" value={form.whatsapp} onChange={handleChange}
                placeholder="+39 333 123 4567" style={inputStyle('whatsapp')} />
              <FieldError field="whatsapp" />
              {!fieldError.whatsapp && (
                <span style={{ fontSize: '0.8rem', color: C.textMuted, marginTop: '4px', display: 'block' }}>
                  I clienti ti invieranno gli ordini su questo numero.
                </span>
              )}
            </div>

            {/* Email */}
            <div>
              <Label>Email</Label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="tu@email.com" style={inputStyle('email')} />
              <FieldError field="email" />
              {fieldError.email === ERROR_MESSAGES.email_taken && (
                <a href="/login" style={{ fontSize: '0.82rem', color: C.green, fontWeight: 700, display: 'block', marginTop: '4px' }}>
                  → Vai al login
                </a>
              )}
            </div>

            {/* Password */}
            <div>
              <Label>Password</Label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimo 6 caratteri"
                  style={{ ...inputStyle('password'), paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: C.textMuted, fontSize: '1.1rem', lineHeight: 1 }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <FieldError field="password" />
              {/* Indicador de seguridad */}
              {form.password.length > 0 && !fieldError.password && (
                <div style={{ marginTop: '6px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{
                      height: '4px', flex: 1, borderRadius: '2px',
                      background: form.password.length >= i * 4
                        ? (form.password.length >= 10 ? C.green : form.password.length >= 6 ? '#f59e0b' : '#ef4444')
                        : C.grayBorder,
                      transition: 'background 0.2s',
                    }} />
                  ))}
                  <span style={{ fontSize: '0.72rem', color: C.textMuted, whiteSpace: 'nowrap', marginLeft: '6px' }}>
                    {form.password.length < 6 ? 'Troppo corta' : form.password.length < 10 ? 'Media' : 'Forte 💪'}
                  </span>
                </div>
              )}
            </div>

            {/* Error general */}
            {error && (
              <div style={{ background: C.redBg, color: C.redText, border: `1px solid ${C.redBorder}`, padding: '12px', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="glow-btn"
              style={{
                width:        '100%',
                background:   loading ? '#86efac' : C.green,
                color:        loading ? '#064e3b' : C.white,
                border:       'none',
                padding:      '14px',
                borderRadius: '10px',
                fontWeight:   700,
                fontSize:     '1rem',
                marginTop:    '6px',
                cursor:       loading ? 'wait' : 'pointer',
                fontFamily:   'inherit',
                opacity:      loading ? 0.8 : 1,
              }}>
              {loading ? '⏳ Creando la tua bottega...' : 'Crea il mio negozio →'}
            </button>

          </form>

          <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.9rem', color: C.textMuted }}>
            Hai già un account?{' '}
            <a href="/login" style={{ color: C.greenDark, fontWeight: 700, textDecoration: 'none' }}>Accedi</a>
          </div>

        </div>
      </section>
    </PageShell>
  )
}
