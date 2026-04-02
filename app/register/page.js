'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import PageShell from '../../components/PageShell'

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
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRegister = (e) => {
    e.preventDefault()
    setLoading(true)
    // Simular carga y guardar en BD por 1.5s
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  return (
    <PageShell>
      <section className="gradient-bg" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        
        <div className="premium-shadow" style={{
          background: C.white,
          borderRadius: '24px',
          width: '100%',
          maxWidth: '500px',
          padding: '48px 40px',
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ color: C.text, fontSize: '1.8rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.5px' }}>Crea la tua bottega</h1>
            <p style={{ color: C.textMuted, fontSize: '0.95rem', margin: 0 }}>Inizia a vendere online in pochi minuti.</p>
          </div>

          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Nome del Negozio */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text, marginBottom: '8px' }}>Nome del Negozio</label>
              <input 
                type="text" 
                placeholder="Es: Pizzeria da Mario" 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${C.grayBorder}`,
                  background: C.grayBg,
                  fontSize: '0.95rem',
                  color: C.text,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }} 
              />
            </div>
            
            {/* Sottodominio unico */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text, marginBottom: '8px' }}>Sottodominio unico (es: mia-bottega)</label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                border: `1px solid #d1fae5`, /* Verde suave como en la imagen */
                borderRadius: '10px', 
                background: C.white,
                overflow: 'hidden',
                transition: 'border-color 0.2s'
              }}>
                <span style={{ padding: '12px 8px 12px 16px', color: '#9ca3af', fontSize: '0.9rem', userSelect: 'none' }}>
                  https://
                </span>
                <input 
                  type="text" 
                  placeholder="ilmiotappo" 
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.95rem',
                    color: C.text,
                    outline: 'none',
                    minWidth: '0'
                  }} 
                />
                <span style={{ padding: '12px 16px 12px 8px', color: '#9ca3af', fontSize: '0.9rem', userSelect: 'none' }}>
                  .tiendaonline.it
                </span>
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text, marginBottom: '8px' }}>📱 WhatsApp del negozio</label>
              <input 
                type="tel" 
                placeholder="+39 333 123 4567" 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${C.grayBorder}`,
                  background: C.grayBg,
                  fontSize: '0.95rem',
                  color: C.text,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  marginBottom: '6px'
                }} 
              />
              <span style={{ fontSize: '0.8rem', color: C.textMuted }}>I clienti ti invieranno gli ordini su questo numero.</span>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text, marginBottom: '8px' }}>Email</label>
              <input 
                type="email" 
                placeholder="tu@email.com" 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${C.grayBorder}`,
                  background: C.grayBg,
                  fontSize: '0.95rem',
                  color: C.text,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }} 
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text, marginBottom: '8px' }}>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: `1px solid ${C.grayBorder}`,
                  background: C.grayBg,
                  fontSize: '0.95rem',
                  color: C.text,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }} 
              />
            </div>

            {/* Mensaje de error oculto por defecto, visible para el mockup */}
            {/* Quitar esta sección cuando se implemente la lógica real y mostrar dinámicamente */}
            <div style={{
              background: C.redBg,
              color: C.redText,
              border: `1px solid ${C.redBorder}`,
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              textAlign: 'center',
              fontWeight: 500,
              display: 'none' // Cambiar a 'block' para mostrar el error
            }}>
              Si è verificato un errore. Riprova.
            </div>

            <button 
              type="button" 
              onClick={handleRegister}
              disabled={loading}
              className="glow-btn" 
              style={{
              width: '100%',
              background: '#86efac',
              color: '#064e3b',
              border: 'none',
              padding: '14px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '1rem',
              marginTop: '10px',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: `0 4px 15px rgba(5, 150, 105, 0.2)`,
              transition: 'all 0.3s ease',
              opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Creando bottega...' : 'Crea il mio negozio →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.9rem', color: C.textMuted }}>
            Accedi?{' '}
            <a href="/login" style={{ color: C.greenDark, fontWeight: 700, textDecoration: 'none' }}>Log in</a>
          </div>

        </div>
      </section>
    </PageShell>
  )
}
