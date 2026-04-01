import PageShell from '../../components/PageShell'

const C = {
  green:      '#059669',
  greenDark:  '#047857',
  white:      '#ffffff',
  text:       '#0f172a',
  textMuted:  '#64748b',
  grayBorder: '#e2e8f0',
  grayBg:     '#f8fafc',
}

export const metadata = {
  title: 'Accedi — TIENDAONLINE',
  description: 'Accedi al tuo pannello di controllo TIENDAONLINE.',
}

export default function LoginPage() {
  return (
    <PageShell>
      <section className="gradient-bg" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        
        <div className="premium-shadow" style={{
          background: C.white,
          borderRadius: '24px',
          width: '100%',
          maxWidth: '420px',
          padding: '48px 40px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ color: C.text, fontSize: '1.8rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.5px' }}>Bentornato 👋</h1>
            <p style={{ color: C.textMuted, fontSize: '0.95rem', margin: 0 }}>Accedi al tuo pannello di controllo.</p>
          </div>

          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.text }}>Password</label>
                <a href="#" style={{ fontSize: '0.8rem', color: C.green, textDecoration: 'none', fontWeight: 600 }}>Password dimenticata?</a>
              </div>
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

            <button type="button" className="glow-btn" style={{
              width: '100%',
              background: C.green,
              color: C.white,
              border: 'none',
              padding: '14px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '1rem',
              marginTop: '10px',
              cursor: 'pointer',
              boxShadow: `0 4px 15px rgba(5, 150, 105, 0.3)`,
            }}>
              Accedi
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '0.9rem', color: C.textMuted }}>
            Non hai ancora un account?{' '}
            <a href="/register" style={{ color: C.green, fontWeight: 700, textDecoration: 'none' }}>Crea la tua vetrina</a>
          </div>

        </div>
      </section>
    </PageShell>
  )
}
