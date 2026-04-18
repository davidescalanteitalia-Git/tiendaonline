'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { getPlan, PLANES } from '../../../lib/planes'
import { registrarEvento, EVENTOS } from '../../../components/PostHogProvider'

const PLANES_ORDEN = ['gratis', 'basico', 'pro', 'grow']

const STRIPE_PRICE_IDS = {
  mensual: {
    basico: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASICO_MO || 'price_1TNFMn7BdqFx9FaONU1aO9h5',
    pro:    process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MO    || 'price_1TNFMw7BdqFx9FaO3REVUH6R',
    grow:   process.env.NEXT_PUBLIC_STRIPE_PRICE_GROW_MO   || 'price_1TNFN57BdqFx9FaOK54593Pq',
  },
  anual: {
    basico: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASICO_YR || 'price_1TNFMr7BdqFx9FaO5x9Cd2hk',
    pro:    process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YR    || 'price_1TNFN17BdqFx9FaOoJWvQv4D',
    grow:   process.env.NEXT_PUBLIC_STRIPE_PRICE_GROW_YR   || 'price_1TNFN97BdqFx9FaOe58Mqzc5',
  }
}

const PLAN_CONFIG = {
  gratis: {
    color: '#64748b',
    bg: '#f8fafc',
    border: '#e2e8f0',
    emoji: '🏪',
    tag: null,
    features: [
      '50 productos',
      'POS táctil incluido',
      'Checkout por WhatsApp',
      'Subdominio personalizado',
      '100 MB almacenamiento',
      'GDPR compliance',
    ],
    noFeatures: ['Cupones de descuento', 'Reportes financieros', 'Fiados', 'Portal del cliente'],
  },
  basico: {
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#7dd3fc',
    emoji: '⭐',
    tag: null,
    features: [
      '500 productos',
      'Subdominio personalizado',
      'Pagos online con Stripe',
      'Exportación CSV / PDF',
      '1 GB almacenamiento',
      'Soporte por email',
    ],
    noFeatures: ['Cupones de descuento', 'Reportes avanzados', 'Fiados', 'Portal del cliente'],
  },
  pro: {
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    emoji: '🚀',
    tag: '⭐ EL MÁS ELEGIDO',
    features: [
      '5.000 productos',
      'Reportes financieros avanzados',
      'Catálogo Instagram / Facebook',
      'Cupones de descuento ilimitados',
      'Fiados y cuentas corrientes',
      'Portal del cliente',
      '5 GB almacenamiento',
      'Soporte prioritario',
    ],
    noFeatures: [],
  },
  grow: {
    color: '#7c3aed',
    bg: '#faf5ff',
    border: '#c4b5fd',
    emoji: '💎',
    tag: null,
    features: [
      'Productos ilimitados',
      'Recuperación de carritos abandonados',
      'Programa de puntos y afiliados',
      'Facturación electrónica',
      '20 GB almacenamiento',
      'Consultor dedicado',
      'Backup diario',
    ],
    noFeatures: [],
  },
}

export default function PlanesPage() {
  const [tienda, setTienda] = useState(null)
  const [loading, setLoading] = useState(true)
  const [anualizacion, setAnualizacion] = useState(false)
  const [procesando, setProcesando] = useState(null) // key del plan que está procesando

  useEffect(() => {
    // Detectar redirect post-checkout de Stripe
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      alert('✅ ¡Suscripción activada! Tu plan se actualizará en unos segundos.')
    }
    if (params.get('canceled') === 'true') {
      alert('Pago cancelado. Puedes intentarlo de nuevo cuando quieras.')
    }
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setLoading(false)
          return
        }

        const headers = { Authorization: `Bearer ${session.access_token}` }
        const r = await fetch('/api/me', { headers })

        if (r.ok) {
          const d = await r.json()
          setTienda(d.tienda || null)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const info = tienda ? getPlan(tienda) : null

  async function handleSuscribir(planKey) {
    if (planKey === 'gratis') {
      if (confirm('¿Confirmas que quieres pasar al plan Gratis? Si tenías datos pro se ocultarán.')) {
        alert('El downgrade debe hacerse cancelando desde el portal en Stripe (Próximamente).')
      }
      return
    }

    if (planKey === 'grow') {
      window.location.href = 'mailto:hola@tiendaonline.it?subject=Consulta Plan Grow'
      return
    }

    // Planes básico y pro → checkout Stripe
    const ciclo = anualizacion ? 'anual' : 'mensual'
    const priceId = STRIPE_PRICE_IDS[ciclo][planKey]

    if (!priceId || priceId.startsWith('price_mock')) {
      alert('El sistema de pagos aún no está configurado. Contacta soporte en hola@tiendaonline.it')
      return
    }

    if (!tienda?.id) {
      alert('Error: no se pudo identificar tu tienda. Recarga la página e intenta de nuevo.')
      return
    }

    setProcesando(planKey)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sesión expirada')

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId, tiendaId: tienda.id }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error desconocido')
      }

      const { url } = await res.json()
      if (url) {
        registrarEvento(EVENTOS.PLAN_CLICK_UPGRADE, {
          plan_seleccionado: planKey,
          plan_actual: info?.planKey,
          ciclo,
          price_id: priceId,
        })
        window.location.href = url
      }
    } catch (err) {
      console.error('Error iniciando checkout:', err)
      alert(`No se pudo iniciar el pago: ${err.message}`)
    } finally {
      setProcesando(null)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#16a34a', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 60px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>
          Elige tu plan
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Sin comisión por venta en todos los planes. Cancela cuando quieras.
        </p>

        {/* Toggle anual/mensual */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 16, background: '#f1f5f9', borderRadius: 30, padding: '6px 8px' }}>
          <button
            onClick={() => setAnualizacion(false)}
            style={{
              padding: '6px 18px', borderRadius: 24, border: 'none',
              background: !anualizacion ? '#fff' : 'transparent',
              color: !anualizacion ? '#0f172a' : '#64748b',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              boxShadow: !anualizacion ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Mensual
          </button>
          <button
            onClick={() => setAnualizacion(true)}
            style={{
              padding: '6px 18px', borderRadius: 24, border: 'none',
              background: anualizacion ? '#fff' : 'transparent',
              color: anualizacion ? '#0f172a' : '#64748b',
              fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              boxShadow: anualizacion ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Anual <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 8, padding: '1px 7px', fontSize: '0.72rem', fontWeight: 700 }}>-20%</span>
          </button>
        </div>
      </div>

      {/* Trial activo → mostrar estado */}
      {info?.esTrial && (
        <div style={{
          background: '#f0fdf4', border: '1.5px solid #86efac',
          borderRadius: 12, padding: '12px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: '1.4rem' }}>🎁</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#14532d' }}>
              Estás usando el plan Pro gratis — quedan <strong>{info.diasRestantesTrial} días</strong> de prueba
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#166534' }}>
              Al finalizar el trial, si no eliges un plan pasarás al plan Gratis automáticamente.
            </p>
          </div>
        </div>
      )}

      {/* Cards de planes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="planes-grid">
        {PLANES_ORDEN.map(key => {
          const plan = PLANES[key]
          const cfg = PLAN_CONFIG[key]
          const esActual = info?.planKey === key || (info?.esTrial && key === 'pro')
          const precio = anualizacion && plan.precio > 0
            ? Math.round(plan.precio * 0.8)
            : plan.precio
          const estaProcesando = procesando === key

          return (
            <div
              key={key}
              style={{
                background: esActual ? cfg.bg : '#fff',
                border: `${esActual ? '2.5px' : '1.5px'} solid ${esActual ? cfg.color : '#e2e8f0'}`,
                borderRadius: 18,
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                position: 'relative',
                boxShadow: esActual ? `0 4px 24px ${cfg.color}20` : '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {/* Tag "El más elegido" */}
              {cfg.tag && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: cfg.color, color: '#fff',
                  borderRadius: 20, padding: '3px 14px', fontSize: '0.7rem', fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}>
                  {cfg.tag}
                </div>
              )}

              {/* Plan actual badge */}
              {esActual && (
                <div style={{
                  position: 'absolute', top: 14, right: 14,
                  background: cfg.color, color: '#fff',
                  borderRadius: 20, padding: '2px 10px', fontSize: '0.68rem', fontWeight: 700,
                }}>
                  {info?.esTrial ? 'TRIAL' : 'ACTUAL'}
                </div>
              )}

              {/* Emoji + Nombre */}
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{cfg.emoji}</div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{plan.nombre}</h2>
              </div>

              {/* Precio */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                {precio === 0 ? (
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>Gratis</span>
                ) : (
                  <>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: cfg.color }}>€{precio}</span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>/mes</span>
                    {anualizacion && plan.precio > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through', marginLeft: 4 }}>€{plan.precio}</span>
                    )}
                  </>
                )}
              </div>

              {/* Features */}
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                {cfg.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: '#334155' }}>
                    <span style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
                {cfg.noFeatures.map((f, i) => (
                  <li key={`no-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: '#94a3b8' }}>
                    <span style={{ flexShrink: 0, marginTop: 1 }}>—</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Botón */}
              <button
                disabled={(esActual && !info?.esTrial) || estaProcesando}
                onClick={() => handleSuscribir(key)}
                style={{
                  marginTop: 4,
                  padding: '12px 0', borderRadius: 12, border: 'none',
                  background: (esActual && !info?.esTrial) || estaProcesando ? '#f1f5f9' : cfg.color,
                  color: (esActual && !info?.esTrial) || estaProcesando ? '#94a3b8' : '#fff',
                  fontWeight: 700, fontSize: '0.9rem',
                  cursor: (esActual && !info?.esTrial) || estaProcesando ? 'default' : 'pointer',
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'opacity 0.15s',
                }}
              >
                {estaProcesando ? (
                  <>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #cbd5e1', borderTopColor: '#64748b', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    Procesando…
                  </>
                ) : esActual && !info?.esTrial ? (
                  'Plan actual'
                ) : key === 'gratis' ? (
                  'Cambiar a Gratis'
                ) : key === 'grow' ? (
                  'Contactar ventas'
                ) : (
                  `Suscribirse — €${precio}/mes`
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Nota legal */}
      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: 32 }}>
        El pago se procesa de forma segura a través de Stripe. Puedes cancelar en cualquier momento desde tu perfil.
        Los precios incluyen IVA según la legislación aplicable.
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 600px) {
          .planes-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
