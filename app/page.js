'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useLang } from '../components/LanguageProvider'
import { DICTIONARY } from '../lib/dictionaries'

// ─── PALETA DE COLORES ────────────────────────────────────────────────────────
import { C } from '../lib/theme'

// ─── DATOS DE LA DEMO INTERACTIVA ─────────────────────────────────────────────
const DEMO_TABS = [
  {
    icon: '🥖',
    labelKey: 'tabPanetteria',
    store: 'Panetteria Rossi',
    products: [
      { name: 'Pane casereccio',      price: '2.50', seed: 'bread1'      },
      { name: 'Cornetti freschi',     price: '1.20', seed: 'croissant1'  },
      { name: 'Torta della nonna',    price: '14.00',seed: 'cake1'       },
      { name: 'Focaccia rosmarino',   price: '3.50', seed: 'focaccia1'   },
    ],
  },
  {
    icon: '🍊',
    labelKey: 'tabFruttivendolo',
    store: "Frutta e Verdura da Mario",
    products: [
      { name: 'Fragole biologiche',   price: '3.90', seed: 'berries1'    },
      { name: 'Arance di Sicilia',    price: '2.00', seed: 'orange1'     },
      { name: 'Insalata mista',       price: '1.50', seed: 'salad1'      },
      { name: 'Pomodori datterini',   price: '2.80', seed: 'tomato1'     },
    ],
  },
  {
    icon: '☕',
    labelKey: 'tabBar',
    store: 'Bar Centrale',
    products: [
      { name: 'Caffè espresso',       price: '1.20', seed: 'coffee1'     },
      { name: 'Cappuccino',           price: '1.50', seed: 'latte1'      },
      { name: 'Tramezzino misto',     price: '2.50', seed: 'sandwich1'   },
      { name: 'Succo di frutta',      price: '2.00', seed: 'juice1'      },
    ],
  },
  {
    icon: '🏪',
    labelKey: 'tabNegozioLocale',
    store: 'Alimentari da Lucia',
    products: [
      { name: 'Olio extravergine',    price: '8.50', seed: 'olive1'      },
      { name: 'Pasta artigianale',    price: '2.20', seed: 'pasta1'      },
      { name: 'Marmellata artig.',    price: '4.90', seed: 'jam1'        },
      { name: 'Conserve (pack 3)',    price: '6.00', seed: 'canned1'     },
    ],
  },
]

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Home() {
  const { lang, changeLang: setLang } = useLang()
  const dict = DICTIONARY[lang]
  const [storeCount,  setStoreCount]  = useState(0)
  const [activeDemo,  setActiveDemo]  = useState(0)
  const [openFaq,     setOpenFaq]     = useState(null)

  // Función de traducción conectada al diccionario global
  const t = (key) => dict[key] || key

  // Carga el contador de tiendas
  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => setStoreCount(d.total || 0))
      .catch(() => {})
  }, [])

  // ── Datos reactivos ────────────────────────────────────────────────────────
  const features = [
    { icon: '💬', title: t('feat1Title'), desc: t('feat1Desc') },
    { icon: '🏪', title: t('feat2Title'), desc: t('feat2Desc') },
    { icon: '🙈', title: t('feat3Title'), desc: t('feat3Desc') },
    { icon: '🌐', title: t('feat4Title'), desc: t('feat4Desc') },
    { icon: '👥', title: t('feat5Title'), desc: t('feat5Desc') },
    { icon: '🔒', title: t('feat6Title'), desc: t('feat6Desc') },
  ]

  const steps = [
    { num: '1', title: t('step1Title'), time: t('step1Time'), desc: t('step1Desc') },
    { num: '2', title: t('step2Title'), time: t('step2Time'), desc: t('step2Desc') },
    { num: '3', title: t('step3Title'), time: t('step3Time'), desc: t('step3Desc') },
  ]

  const freeFeatures = [
    t('planFree1'), t('planFree2'), t('planFree3'),
    t('planFree4'), t('planFree5'), t('planFree6'),
  ]

  const advFeatures = [
    t('planAdv1'), t('planAdv2'), t('planAdv3'),
    t('planAdv4'), t('planAdv5'), t('planAdv6'),
  ]

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
    { q: t('faq5Q'), a: t('faq5A') },
    { q: t('faq6Q'), a: t('faq6A') },
    { q: t('faq7Q'), a: t('faq7A') },
  ]

  // ── Helpers de estilo ──────────────────────────────────────────────────────
  const ctaBtn = (href, label, variant = 'primary') => {
    const isPrimary = variant === 'primary'
    return (
      <a
        href={href}
        className={isPrimary ? 'glow-btn' : ''}
        style={{
          display:       'inline-block',
          background:    isPrimary ? C.white    : C.green,
          color:         isPrimary ? C.green    : C.white,
          padding:       '15px 32px',
          borderRadius:  '12px',
          textDecoration:'none',
          fontWeight:    800,
          fontSize:      '1.05rem',
          boxShadow:     isPrimary
            ? '0 10px 25px -5px rgba(0,0,0,0.1)'
            : `0 4px 15px rgba(5, 150, 105, 0.3)`,
          transition:    'all 0.2s',
        }}
      >
        🛍️ {label} →
      </a>
    )
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: C.text, margin: 0, padding: 0 }}>

      {/* ════════════════════════════════════════════════════════════════════
          HEADER STICKY
      ════════════════════════════════════════════════════════════════════ */}
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
          gap:           '12px',
        }}>

          {/* Logo */}
          <a href="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image
              src="/logo.jpg"
              alt="TIENDAONLINE"
              width={38}
              height={38}
              style={{ borderRadius: '8px' }}
              priority
            />
            <span style={{ color: C.green, fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>
              TIENDAONLINE
            </span>
          </a>

          {/* Selector de idioma */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['it', 'es', 'en'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding:      '4px 10px',
                  borderRadius: '20px',
                  border:       `1.5px solid ${lang === l ? C.green : '#ddd'}`,
                  background:   lang === l ? C.green : 'transparent',
                  color:        lang === l ? C.white : C.textMuted,
                  fontSize:     '0.72rem',
                  fontWeight:   700,
                  cursor:       'pointer',
                  textTransform:'uppercase',
                  letterSpacing:'0.5px',
                  transition:   'all 0.15s',
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <a
              href="/login"
              style={{
                color:         C.textMuted,
                textDecoration:'none',
                fontSize:      '0.9rem',
                fontWeight:    500,
              }}
            >
              {t('accedi')}
            </a>
            <a
              href="/register"
              className="glow-btn"
              style={{
                display:       'inline-block',
                background:    C.green,
                color:         C.white,
                padding:       '8px 16px',
                borderRadius:  '8px',
                textDecoration:'none',
                fontSize:      '0.85rem',
                fontWeight:    700,
                boxShadow:     `0 4px 10px rgba(5, 150, 105, 0.25)`,
                whiteSpace:    'nowrap',
              }}
            >
              {t('ctaHeader')} →
            </a>
          </div>

        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════
          BANNER EN CONSTRUCCIÓN
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{
        background:  '#fef3c7',
        borderBottom:'1px solid #fcd34d',
        padding:     '10px 20px',
        textAlign:   'center',
        fontSize:    '0.88rem',
        fontWeight:  600,
        color:       '#92400e',
        display:     'flex',
        alignItems:  'center',
        justifyContent:'center',
        gap:         '8px',
      }}>
        🚧 {t('bannerText')}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          1. HERO
      ════════════════════════════════════════════════════════════════════ */}
      <section className="gradient-bg" style={{
        padding:     '88px 20px',
        textAlign:   'center',
        position:    'relative',
        overflow:    'hidden',
      }}>
        {/* Círculos decorativos */}
        <div style={{ position:'absolute', top:'-80px',  right:'-80px',  width:'360px', height:'360px', borderRadius:'50%', background:'rgba(255,255,255,0.1)', filter:'blur(40px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-80px',left:'-40px',  width:'280px', height:'280px', borderRadius:'50%', background:'rgba(255,255,255,0.08)', filter:'blur(30px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'30%',   left:'5%',       width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.12)', filter:'blur(20px)', pointerEvents:'none' }} />

        <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative' }}>

          {/* Badge */}
          <div style={{
            display:      'inline-block',
            background:   'rgba(255,255,255,0.15)',
            border:       '1px solid rgba(255,255,255,0.3)',
            borderRadius: '100px',
            padding:      '6px 18px',
            marginBottom: '24px',
            color:        C.white,
            fontSize:     '0.85rem',
            fontWeight:   600,
          }}>
            ✨ {t('heroBadge')}
          </div>

          {/* H1 */}
          <h1 style={{
            color:        C.white,
            fontSize:     'clamp(2rem, 5.5vw, 3.4rem)',
            fontWeight:   900,
            lineHeight:   1.12,
            margin:       '0 0 18px',
            letterSpacing:'-1.5px',
          }}>
            {t('heroTitle')}
          </h1>

          {/* Subtítulo */}
          <p style={{
            color:        'rgba(255,255,255,0.88)',
            fontSize:     'clamp(1rem, 2.5vw, 1.2rem)',
            lineHeight:   1.65,
            margin:       '0 0 36px',
            fontWeight:   400,
          }}>
            {t('heroSubtitle')}
          </p>

          {/* CTA Principal */}
          <div style={{ marginBottom: '24px' }}>
            {ctaBtn('/register', t('heroCtaMain'), 'primary')}
          </div>

          {/* Checkmarks */}
          <div style={{
            display:        'flex',
            flexWrap:       'wrap',
            justifyContent: 'center',
            gap:            '10px 24px',
            marginBottom:   '32px',
          }}>
            {[t('heroCheck1'), t('heroCheck2'), t('heroCheck3')].map((check, i) => (
              <span key={i} style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: 600 }}>
                ✓ {check}
              </span>
            ))}
          </div>

          {/* Contador social proof */}
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>
            {t('heroStores').replace('{n}', storeCount)}
          </p>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          2. EL PROBLEMA
      ════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: C.white, padding: '80px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <h2 style={{
            textAlign:    'center',
            fontSize:     'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight:   800,
            margin:       '0 0 52px',
            letterSpacing:'-0.5px',
          }}>
            {t('problemaTitle')}
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
            {[
              { icon: '📵', title: t('problema1Title'), desc: t('problema1Desc') },
              { icon: '💬', title: t('problema2Title'), desc: t('problema2Desc') },
              { icon: '💸', title: t('problema3Title'), desc: t('problema3Desc') },
            ].map((item, i) => (
              <div key={i} className="premium-shadow" style={{
                flex:         '1 1 280px',
                maxWidth:     '320px',
                background:   C.white,
                border:       `1px solid ${C.greenBorder}`,
                borderRadius: '18px',
                padding:      '36px 28px',
                textAlign:    'center',
              }}>
                <div style={{ fontSize: '2.8rem', marginBottom: '14px' }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', margin: '0 0 10px', color: C.text }}>{item.title}</h3>
                <p style={{ color: C.textMuted, lineHeight: 1.65, margin: 0, fontSize: '0.93rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          3. DEMO INTERACTIVA
      ════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: C.greenBg, padding: '80px 20px' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>

          <h2 style={{
            textAlign:    'center',
            fontSize:     'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight:   800,
            margin:       '0 0 10px',
            letterSpacing:'-0.5px',
          }}>
            {t('demoTitle')}
          </h2>
          <p style={{ textAlign: 'center', color: C.textMuted, margin: '0 0 36px', fontSize: '1rem' }}>
            {t('demoSubtitle')}
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '36px' }}>
            {DEMO_TABS.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveDemo(i)}
                style={{
                  padding:      '10px 22px',
                  borderRadius: '100px',
                  border:       `2px solid ${activeDemo === i ? C.green : C.grayBorder}`,
                  background:   activeDemo === i ? C.green : C.white,
                  color:        activeDemo === i ? C.white : C.textMuted,
                  fontWeight:   600,
                  fontSize:     '0.9rem',
                  cursor:       'pointer',
                  transition:   'all 0.2s',
                }}
              >
                {tab.icon} {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* Mockup teléfono */}
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <div className="demo-phone">
              <div className="demo-phone-inner">
                {/* Barra del store */}
              <div style={{ background: C.green, padding: '16px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: C.white, marginBottom: '10px' }}>
                  {DEMO_TABS[activeDemo].store}
                </div>
                <div style={{
                  background:   'rgba(255,255,255,0.18)',
                  borderRadius: '8px',
                  padding:      '7px 12px',
                  fontSize:     '0.78rem',
                  color:        'rgba(255,255,255,0.8)',
                }}>
                  🔍 {t('demoSearchPlaceholder')}
                </div>
              </div>

              {/* Grid de productos */}
              <div style={{
                display:    'grid',
                gridTemplateColumns: '1fr 1fr',
                gap:        '10px',
                padding:    '12px',
                maxHeight:  '360px',
                overflowY:  'auto',
              }}>
                {DEMO_TABS[activeDemo].products.map((product, i) => (
                  <div key={i} className="product-card" style={{}}>
                    <img
                      src={`https://picsum.photos/seed/${product.seed}/200/200`}
                      alt={product.name}
                      style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ padding: '8px' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: C.text, marginBottom: '3px', lineHeight: 1.3 }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: C.green }}>
                        €{product.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón WhatsApp */}
              <div style={{ padding: '10px 12px 14px' }}>
                <button className="glow-btn" style={{
                  width:        '100%',
                  background:   '#25d366',
                  color:        C.white,
                  border:       'none',
                  borderRadius: '10px',
                  padding:      '11px',
                  fontWeight:   700,
                  fontSize:     '0.82rem',
                  cursor:       'pointer',
                  fontFamily:   'inherit',
                  display:      'block',
                }}>
                  💬 {t('demoOrderBtn')}
                </button>
              </div>
              </div>
            </div>
          </div>

          {/* CTA Demo */}
          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <a href="/register" className="glow-btn" style={{
              display:       'inline-block',
              background:    C.green,
              color:         C.white,
              padding:       '14px 28px',
              borderRadius:  '10px',
              textDecoration:'none',
              fontWeight:    700,
              fontSize:      '0.95rem',
              boxShadow:     `0 5px 15px rgba(5,150,105,0.3)`,
            }}>
              {t('demoCta')} →
            </a>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          4. COME FUNZIONA
      ════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: C.white, padding: '80px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <h2 style={{
            textAlign:    'center',
            fontSize:     'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight:   800,
            margin:       '0 0 52px',
            letterSpacing:'-0.5px',
          }}>
            {t('howTitle')}
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'center' }}>
            {steps.map((step, i) => (
              <div key={i} style={{ flex: '1 1 220px', maxWidth: '270px', textAlign: 'center' }}>
                {/* Número */}
                <div style={{
                  width:          '60px',
                  height:         '60px',
                  borderRadius:   '50%',
                  background:     C.green,
                  color:          C.white,
                  fontSize:       '1.5rem',
                  fontWeight:     900,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  margin:         '0 auto 14px',
                  boxShadow:      `0 4px 12px rgba(26,92,42,0.35)`,
                }}>
                  {step.num}
                </div>
                {/* Tiempo */}
                <div style={{
                  display:      'inline-block',
                  background:   '#fef3c7',
                  color:        C.amberText,
                  padding:      '3px 12px',
                  borderRadius: '100px',
                  fontSize:     '0.78rem',
                  fontWeight:   700,
                  marginBottom: '10px',
                }}>
                  ⏱️ {step.time}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', margin: '0 0 8px', color: C.text }}>{step.title}</h3>
                <p style={{ color: C.textMuted, lineHeight: 1.65, margin: 0, fontSize: '0.92rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          5. FEATURES
      ════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: C.greenBg, padding: '80px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <h2 style={{
            textAlign:    'center',
            fontSize:     'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight:   800,
            margin:       '0 0 52px',
            letterSpacing:'-0.5px',
          }}>
            {t('featuresTitle')}
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {features.map((feat, i) => (
              <div key={i} className="premium-shadow" style={{
                flex:         '1 1 260px',
                maxWidth:     '300px',
                background:   C.white,
                border:       `1px solid ${C.greenBorder}`,
                borderRadius: '16px',
                padding:      '28px 24px',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{feat.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 8px', color: C.text }}>{feat.title}</h3>
                <p style={{ color: C.textMuted, lineHeight: 1.65, margin: 0, fontSize: '0.9rem' }}>{feat.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          6. PRICING
      ════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: C.white, padding: '80px 20px' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>

          <h2 style={{
            textAlign:    'center',
            fontSize:     'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight:   800,
            margin:       '0 0 10px',
            letterSpacing:'-0.5px',
          }}>
            {t('pricingTitle')}
          </h2>
          <p style={{ textAlign: 'center', color: C.textMuted, margin: '0 0 48px', fontSize: '1.05rem' }}>
            {t('pricingSubtitle')}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>

            {/* ── Plan Gratuito ── */}
            <a href="/register" className="premium-shadow" style={{
              flex:           '1 1 300px',
              maxWidth:       '380px',
              border:         `2px solid ${C.greenLight}`,
              borderRadius:   '20px',
              padding:        '36px 32px',
              position:       'relative',
              background:     C.white,
              display:        'block',
              textDecoration: 'none',
              color:          'inherit',
              cursor:         'pointer',
              transition:     'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseOver={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 16px 40px rgba(5,150,105,0.2)` }}
              onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
            >
              <div style={{
                display:      'inline-block',
                background:   C.green,
                color:        C.white,
                padding:      '4px 14px',
                borderRadius: '100px',
                fontSize:     '0.78rem',
                fontWeight:   700,
                marginBottom: '18px',
              }}>
                {t('planGratisLabel')}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '4.5rem', fontWeight: 900, color: C.green, lineHeight: 1 }}>€0</span>
              </div>
              <div style={{ color: C.textMuted, fontSize: '0.9rem', marginBottom: '24px' }}>
                {lang === 'it' ? 'per sempre' : lang === 'es' ? 'para siempre' : 'forever'}
              </div>

              <div style={{ borderTop: `1px solid ${C.greenBorder}`, paddingTop: '20px', marginBottom: '12px' }}>
                {freeFeatures.map((feat, i) => (
                  <div key={i} style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        '10px',
                    padding:    '7px 0',
                    fontSize:   '0.92rem',
                    color:      C.text,
                  }}>
                    <span style={{ color: C.green, fontWeight: 800, fontSize: '1rem' }}>✓</span>
                    {feat}
                  </div>
                ))}
              </div>

              {/* GDPR detail note */}
              <div style={{
                background:   C.greenBg,
                border:       `1px solid ${C.greenBorder}`,
                borderRadius: '8px',
                padding:      '10px 14px',
                marginBottom: '24px',
                fontSize:     '0.78rem',
                color:        C.textMuted,
                lineHeight:   1.5,
              }}>
                🔒 {lang === 'it'
                  ? 'GDPR: crittografia dati, diritto all\'oblio, nessuna vendita di dati a terzi.'
                  : lang === 'es'
                  ? 'GDPR: cifrado de datos, derecho al olvido, sin venta de datos a terceros.'
                  : 'GDPR: data encryption, right to erasure, no sale of data to third parties.'}
              </div>

              <div className="glow-btn" style={{
                display:       'block',
                background:    C.green,
                color:         C.white,
                padding:       '14px',
                borderRadius:  '10px',
                fontWeight:    700,
                textAlign:     'center',
                boxShadow:     `0 4px 15px rgba(5, 150, 105, 0.3)`,
                fontSize:      '0.98rem',
              }}>
                {t('ctaHeader')} →
              </div>
            </a>

            {/* ── Plan Avanzato ── */}
            <a href="/register" className="premium-shadow" style={{
              flex:           '1 1 300px',
              maxWidth:       '380px',
              border:         `2px solid ${C.greenLight}`,
              borderRadius:   '20px',
              padding:        '36px 32px',
              background:     C.white,
              display:        'block',
              textDecoration: 'none',
              color:          'inherit',
              cursor:         'pointer',
              transition:     'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseOver={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 16px 40px rgba(5,150,105,0.2)` }}
              onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
            >
              <div style={{
                display:      'inline-block',
                background:   C.green,
                color:        C.white,
                padding:      '4px 14px',
                borderRadius: '100px',
                fontSize:     '0.78rem',
                fontWeight:   700,
                marginBottom: '18px',
              }}>
                {t('planAvanzatoLabel')}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '4.5rem', fontWeight: 900, color: C.green, lineHeight: 1 }}>€0.50</span>
              </div>
              <div style={{ color: C.textMuted, fontSize: '0.9rem', marginBottom: '24px' }}>
                {lang === 'it' ? '/ giorno' : lang === 'es' ? '/ día' : '/ day'}
              </div>

              <div style={{ borderTop: `1px solid ${C.greenBorder}`, paddingTop: '20px', marginBottom: '28px' }}>
                {advFeatures.map((feat, i) => (
                  <div key={i} style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        '10px',
                    padding:    '7px 0',
                    fontSize:   '0.92rem',
                    color:      C.text,
                  }}>
                    <span style={{ color: C.green, fontWeight: 800, fontSize: '1rem' }}>✓</span>
                    {feat}
                  </div>
                ))}
              </div>

              <div className="glow-btn" style={{
                display:       'block',
                background:    C.green,
                color:         C.white,
                padding:       '14px',
                borderRadius:  '10px',
                fontWeight:    700,
                textAlign:     'center',
                boxShadow:     `0 4px 15px rgba(5, 150, 105, 0.3)`,
                fontSize:      '0.98rem',
              }}>
                {t('planAvanzatoCta')} →
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          7. CONTADOR DE TIENDAS
      ════════════════════════════════════════════════════════════════════ */}
      <section style={{
        background:  C.green,
        padding:     '72px 20px',
        textAlign:   'center',
        position:    'relative',
        overflow:    'hidden',
      }}>
        <div style={{ position:'absolute', top:'-50px',  right:'-50px', width:'240px', height:'240px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-60px',left:'-20px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{
            fontSize:    'clamp(4rem, 10vw, 6rem)',
            fontWeight:  900,
            color:       C.white,
            lineHeight:  1,
            marginBottom:'8px',
          }}>
            {storeCount}
          </div>
          <div style={{
            color:       'rgba(255,255,255,0.82)',
            fontSize:    '1.1rem',
            fontWeight:  500,
            marginBottom:'28px',
          }}>
            {t('counterLabel')}
          </div>
          <a href="/register" style={{
            display:       'inline-block',
            background:    C.white,
            color:         C.green,
            padding:       '14px 28px',
            borderRadius:  '10px',
            textDecoration:'none',
            fontWeight:    800,
            fontSize:      '1rem',
            boxShadow:     '0 3px 0 rgba(0,0,0,0.18)',
          }}>
            {t('counterCta')} →
          </a>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          8. FAQ
      ════════════════════════════════════════════════════════════════════ */}
      <section style={{ background: C.greenBg, padding: '80px 20px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          <h2 style={{
            textAlign:    'center',
            fontSize:     'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight:   800,
            margin:       '0 0 44px',
            letterSpacing:'-0.5px',
          }}>
            {t('faqTitle')}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background:   C.white,
                borderRadius: '12px',
                border:       `1px solid ${C.greenBorder}`,
                overflow:     'hidden',
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width:          '100%',
                    padding:        '18px 20px',
                    background:     'transparent',
                    border:         'none',
                    textAlign:      'left',
                    cursor:         'pointer',
                    display:        'flex',
                    justifyContent: 'space-between',
                    alignItems:     'center',
                    gap:            '16px',
                    fontFamily:     'inherit',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.97rem', color: C.text, lineHeight: 1.4 }}>
                    {faq.q}
                  </span>
                  <span style={{
                    color:     C.green,
                    fontWeight:700,
                    fontSize:  '1.3rem',
                    flexShrink:0,
                    display:   'inline-block',
                    transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition:'transform 0.2s ease',
                  }}>
                    +
                  </span>
                </button>

                {openFaq === i && (
                  <div style={{
                    padding:    '0 20px 18px',
                    color:      C.textMuted,
                    lineHeight: 1.65,
                    fontSize:   '0.92rem',
                    borderTop:  `1px solid ${C.greenBorder}`,
                    paddingTop: '14px',
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          9. CTA FINAL
      ════════════════════════════════════════════════════════════════════ */}
      <section className="gradient-bg" style={{
        padding:     '88px 20px',
        textAlign:   'center',
        position:    'relative',
        overflow:    'hidden',
      }}>
        <div style={{ position:'absolute', top:'-80px',  right:'-80px', width:'360px', height:'360px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-80px',left:'-40px', width:'280px', height:'280px', borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />

        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
          <h2 style={{
            color:        C.white,
            fontSize:     'clamp(1.8rem, 4.5vw, 2.8rem)',
            fontWeight:   900,
            margin:       '0 0 16px',
            lineHeight:   1.18,
            letterSpacing:'-1px',
          }}>
            {t('ctaFinalTitle')}
          </h2>
          <p style={{
            color:       'rgba(255,255,255,0.88)',
            fontSize:    '1.1rem',
            margin:      '0 0 36px',
            lineHeight:  1.55,
          }}>
            {t('ctaFinalSubtitle')}
          </p>

          <div style={{ marginBottom: '20px' }}>
            {ctaBtn('/register', t('heroCtaMain'), 'primary')}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>
            {t('ctaFinalSocial').replace('{n}', storeCount)}
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════════ */}
      <footer style={{ background: C.greenDark, padding: '48px 20px 32px', color: C.white }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          {/* Fila superior */}
          <div style={{
            display:        'flex',
            flexWrap:       'wrap',
            justifyContent: 'space-between',
            alignItems:     'center',
            gap:            '20px',
            marginBottom:   '28px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <Image
                  src="/logo.jpg"
                  alt="TIENDAONLINE"
                  width={36}
                  height={36}
                  style={{ borderRadius: '8px' }}
                />
                <span style={{ fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.5px' }}>
                  TIENDAONLINE
                </span>
              </div>
              <div style={{ opacity: 0.6, fontSize: '0.88rem' }}>{t('footerTagline')}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {[
                { label: t('footerPrivacy'), href: '/privacy'   },
                { label: t('footerTerms'),   href: '/terms'     },
                { label: t('footerContact'), href: '/contatti'  },
              ].map((link, i) => (
                <a key={i} href={link.href} style={{
                  color:         'rgba(255,255,255,0.7)',
                  textDecoration:'none',
                  fontSize:      '0.88rem',
                  fontWeight:    500,
                }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Separador */}
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.15)', margin: '0 0 20px' }} />

          {/* Fila inferior */}
          <div style={{
            display:        'flex',
            flexWrap:       'wrap',
            justifyContent: 'space-between',
            gap:            '8px',
            opacity:        0.5,
            fontSize:       '0.8rem',
          }}>
            <span>© 2026 TIENDAONLINE · tiendaonline.it</span>
            <span>🛍️ {t('footerCredit')}</span>
          </div>

        </div>
      </footer>

    </div>
  )
}
