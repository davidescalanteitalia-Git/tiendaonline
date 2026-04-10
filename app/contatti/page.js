'use client'

import PageShell from '../../components/PageShell'
import { useLang } from '../../components/LanguageProvider'
import { C } from '../../lib/theme'

const T = {
  it: {
    title: 'Contatti',
    subtitle: 'Siamo qui per aiutarti. Scrivici o chiamaci.',
    emailTitle: 'Email',
    emailDesc: 'Rispondiamo entro 24 ore lavorative.',
    phoneTitle: 'Telefono / WhatsApp',
    phoneDesc: 'Disponibili anche su WhatsApp per supporto rapido.',
    hoursTitle: '🕐 Orari di assistenza',
    hours: 'Lunedì – Venerdì: 9:00 – 18:00\nSabato: 9:00 – 13:00\nDomenica: chiuso',
  },
  es: {
    title: 'Contacto',
    subtitle: 'Estamos aquí para ayudarte. Escríbenos o llámanos.',
    emailTitle: 'Email',
    emailDesc: 'Respondemos en 24 horas laborables.',
    phoneTitle: 'Teléfono / WhatsApp',
    phoneDesc: 'También disponibles por WhatsApp para soporte rápido.',
    hoursTitle: '🕐 Horario de atención',
    hours: 'Lunes – Viernes: 9:00 – 18:00\nSábado: 9:00 – 13:00\nDomingo: cerrado',
  },
  en: {
    title: 'Contact',
    subtitle: 'We are here to help. Write to us or call us.',
    emailTitle: 'Email',
    emailDesc: 'We reply within 24 working hours.',
    phoneTitle: 'Phone / WhatsApp',
    phoneDesc: 'Also available on WhatsApp for quick support.',
    hoursTitle: '🕐 Support hours',
    hours: 'Monday – Friday: 9:00 – 18:00\nSaturday: 9:00 – 13:00\nSunday: closed',
  },
}

export default function ContattiPage() {
  const { lang } = useLang()
  const t = T[lang] || T.it

  return (
    <PageShell>

      {/* Hero */}
      <section className="gradient-bg" style={{
        padding:    '64px 20px 56px',
        textAlign:  'center',
      }}>
        <h1 style={{ color: C.white, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px' }}>
          {t.title}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', margin: 0 }}>
          {t.subtitle}
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
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0 0 10px', color: C.text }}>{t.emailTitle}</h2>
              <p style={{ color: C.textMuted, fontSize: '0.9rem', margin: '0 0 16px', lineHeight: 1.5 }}>
                {t.emailDesc}
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
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0 0 10px', color: C.text }}>{t.phoneTitle}</h2>
              <p style={{ color: C.textMuted, fontSize: '0.9rem', margin: '0 0 16px', lineHeight: 1.5 }}>
                {t.phoneDesc}
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
              {t.hoursTitle}
            </h3>
            <p style={{ color: C.textMuted, margin: 0, lineHeight: 1.7, fontSize: '0.92rem', whiteSpace: 'pre-line' }}>
              {t.hours}
            </p>
          </div>

        </div>
      </section>

    </PageShell>
  )
}
