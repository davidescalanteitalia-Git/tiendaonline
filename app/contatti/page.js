import PageShell from '../../components/PageShell'

const C = {
  green:      '#059669',
  greenLight: '#10b981',
  greenDark:  '#047857',
  greenBg:    '#f0fdf4',
  greenBorder:'#d1fae5',
  white:      '#ffffff',
  text:       '#0f172a',
  textMuted:  '#64748b',
  amber:      '#f59e0b',
  amberBg:    '#fffbeb',
  amberText:  '#92400e',
  grayBorder: '#e2e8f0',
  grayBg:     '#f8fafc',
  grayText:   '#94a3b8',
}

export const metadata = {
  title: 'Contatti — TIENDAONLINE',
  description: 'Contatta il team di TIENDAONLINE. Siamo qui per aiutarti.',
}

export default function ContattiPage() {
  return (
    <PageShell>

      {/* Hero */}
      <section className="gradient-bg" style={{
        padding:    '64px 20px 56px',
        textAlign:  'center',
      }}>
        <h1 style={{ color: C.white, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px' }}>
          Contatti
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', margin: 0 }}>
          Siamo qui per aiutarti. Scrivici o chiamaci.
        </p>
      </section>

      {/* Cards di contatto */}
      <section style={{ background: C.greenBg, padding: '64px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', marginBottom: '48px' }}>

            {/* Email */}
            <div className="premium-shadow" style={{
              flex:         '1 1 280px',
              maxWidth:     '340px',
              background:   C.white,
              border:       `1px solid ${C.greenBorder}`,
              borderRadius: '18px',
              padding:      '36px 28px',
              textAlign:    'center',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '14px' }}>📧</div>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0 0 10px', color: C.text }}>Email</h2>
              <p style={{ color: C.textMuted, fontSize: '0.9rem', margin: '0 0 16px', lineHeight: 1.5 }}>
                Rispondiamo entro 24 ore lavorative.
              </p>
              <a
                href="mailto:utilizzositemaster@gmail.com"
                className="glow-btn"
                style={{
                  display:       'inline-block',
                  background:    C.green,
                  color:         C.white,
                  padding:       '10px 20px',
                  borderRadius:  '8px',
                  textDecoration:'none',
                  fontWeight:    700,
                  fontSize:      '0.9rem',
                  boxShadow:     `0 4px 10px rgba(5, 150, 105, 0.25)`,
                  wordBreak:     'break-all',
                }}
              >
                utilizzositemaster@gmail.com
              </a>
            </div>

            {/* Telefono */}
            <div className="premium-shadow" style={{
              flex:         '1 1 280px',
              maxWidth:     '340px',
              background:   C.white,
              border:       `1px solid ${C.greenBorder}`,
              borderRadius: '18px',
              padding:      '36px 28px',
              textAlign:    'center',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '14px' }}>📞</div>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0 0 10px', color: C.text }}>Telefono / WhatsApp</h2>
              <p style={{ color: C.textMuted, fontSize: '0.9rem', margin: '0 0 16px', lineHeight: 1.5 }}>
                Disponibili anche su WhatsApp per supporto rapido.
              </p>
              <a
                href="tel:+393717701185"
                className="glow-btn"
                style={{
                  display:       'inline-block',
                  background:    '#25d366',
                  color:         C.white,
                  padding:       '10px 20px',
                  borderRadius:  '8px',
                  textDecoration:'none',
                  fontWeight:    700,
                  fontSize:      '0.95rem',
                  boxShadow:     '0 4px 10px rgba(37, 211, 102, 0.25)',
                }}
              >
                +39 371 770 1185
              </a>
            </div>

          </div>

          {/* Info extra */}
          <div className="premium-shadow" style={{
            background:   C.white,
            border:       `1px solid ${C.greenBorder}`,
            borderRadius: '16px',
            padding:      '28px 32px',
            textAlign:    'center',
          }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 10px', color: C.text }}>
              🕐 Orari di assistenza
            </h3>
            <p style={{ color: C.textMuted, margin: 0, lineHeight: 1.7, fontSize: '0.92rem' }}>
              Lunedì – Venerdì: 9:00 – 18:00<br />
              Sabato: 9:00 – 13:00<br />
              Domenica: chiuso
            </p>
          </div>

        </div>
      </section>

    </PageShell>
  )
}
