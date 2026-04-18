'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { getPlan, PLANES } from '../../../lib/planes'
import { registrarEvento, EVENTOS } from '../../../components/PostHogProvider'
import { ChevronDown } from 'lucide-react'

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
    descripcion: 'Para empezar a vender sin gastar nada. Perfecto para probar la plataforma.',
    highlights: ['50 productos', 'POS táctil', 'Checkout WhatsApp', '1 imagen por producto'],
    detalle: [
      {
        categoria: '🛍️ Ventas',
        items: [
          { label: 'POS táctil', desc: 'Cobra en persona desde tu celular o tablet, rápido y sin complicaciones.' },
          { label: 'Checkout por WhatsApp', desc: 'Tus clientes hacen el pedido online y te escriben directo. Tú coordinas el pago.' },
          { label: '0% comisión por venta', desc: 'TIENDAONLINE no te cobra nada por cada venta que hagas.' },
        ]
      },
      {
        categoria: '📦 Inventario',
        items: [
          { label: '50 productos', desc: 'Suficiente para una tienda pequeña o un catálogo básico.' },
          { label: '1 imagen por producto', desc: '100 MB de almacenamiento total para tus fotos.' },
          { label: 'Subdominio personalizado', desc: 'Tu tienda en tutienda.tiendaonline.it desde el primer día.' },
        ]
      },
      {
        categoria: '💳 Pagos',
        items: [
          { label: 'Sin pagos online', desc: 'En el plan Gratis el cobro se coordina directamente con el cliente por WhatsApp, efectivo o transferencia manual.' },
        ]
      },
      {
        categoria: '🔒 Seguridad',
        items: [
          { label: 'GDPR compliance', desc: 'La plataforma cumple con la normativa europea de protección de datos.' },
        ]
      },
    ]
  },
  basico: {
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#7dd3fc',
    emoji: '⭐',
    tag: null,
    descripcion: 'Para tiendas que ya venden y quieren crecer con pagos online y más productos.',
    highlights: ['500 productos', 'Pagos online con Stripe', 'Exportación CSV/PDF', '2 imágenes por producto'],
    detalle: [
      {
        categoria: '🛍️ Ventas',
        items: [
          { label: 'Pagos online con Stripe', desc: 'Tus clientes pagan con tarjeta directamente en tu tienda. El dinero va directo a tu cuenta bancaria — TIENDAONLINE no toca ni cobra nada del cobro. Solo pagas las tarifas estándar de Stripe a ellos directamente.' },
          { label: 'Checkout por WhatsApp', desc: 'Sigue disponible como opción alternativa.' },
          { label: '0% comisión por venta', desc: 'TIENDAONLINE no cobra porcentaje sobre tus ventas.' },
        ]
      },
      {
        categoria: '📦 Inventario',
        items: [
          { label: '500 productos', desc: 'Para una tienda mediana con catálogo variado.' },
          { label: '2 imágenes por producto', desc: '1 GB de almacenamiento total para tus fotos.' },
          { label: 'Exportación CSV / PDF', desc: 'Descarga tu inventario y pedidos en cualquier momento.' },
        ]
      },
      {
        categoria: '📊 Reportes',
        items: [
          { label: 'Reportes básicos', desc: 'Ventas del día, semana y mes. Resumen de ingresos.' },
        ]
      },
      {
        categoria: '💬 Soporte',
        items: [
          { label: 'Soporte por email', desc: 'Respuesta garantizada en menos de 24 horas hábiles.' },
        ]
      },
    ]
  },
  pro: {
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#86efac',
    emoji: '🚀',
    tag: '⭐ EL MÁS ELEGIDO',
    descripcion: 'Para negocios en crecimiento que necesitan herramientas avanzadas de ventas y clientes.',
    highlights: ['5.000 productos', 'Fiados y cuentas corrientes', 'Catálogo Instagram/Facebook', '4 imágenes por producto'],
    detalle: [
      {
        categoria: '🛍️ Ventas',
        items: [
          { label: 'Pagos online con Stripe', desc: 'Igual que el plan Básico. Tu cuenta Stripe conectada directamente, el dinero llega a tu banco sin que TIENDAONLINE intervenga en ningún momento.' },
          { label: 'Cupones de descuento ilimitados', desc: 'Crea códigos de descuento por porcentaje o valor fijo para tus campañas.' },
          { label: 'Catálogo Instagram / Facebook', desc: 'Conecta tu tienda con tus redes sociales y vende directamente desde ahí.' },
          { label: '0% comisión por venta', desc: 'TIENDAONLINE no cobra porcentaje sobre tus ventas.' },
        ]
      },
      {
        categoria: '📦 Inventario',
        items: [
          { label: '5.000 productos', desc: 'Para catálogos grandes con múltiples categorías.' },
          { label: '4 imágenes por producto', desc: '5 GB de almacenamiento para fotos detalladas de alta calidad.' },
        ]
      },
      {
        categoria: '👥 Clientes',
        items: [
          { label: 'Fiados y cuentas corrientes', desc: 'Registra ventas a crédito, lleva el control de quién te debe y gestiona abonos parciales.' },
          { label: 'Portal del cliente', desc: 'Tus clientes pueden ver su historial de pedidos y gestionar su cuenta.' },
        ]
      },
      {
        categoria: '📊 Reportes',
        items: [
          { label: 'Reportes financieros avanzados', desc: 'Ventas vs costos, margen de ganancia real por producto, top productos más vendidos.' },
        ]
      },
      {
        categoria: '💬 Soporte',
        items: [
          { label: 'Soporte prioritario', desc: 'Tu consulta pasa al frente de la fila. Respuesta en menos de 4 horas hábiles.' },
        ]
      },
    ]
  },
  grow: {
    color: '#7c3aed',
    bg: '#faf5ff',
    border: '#c4b5fd',
    emoji: '💎',
    tag: null,
    descripcion: 'Para negocios establecidos que quieren escalar sin límites y con atención dedicada.',
    highlights: ['Productos ilimitados', 'Stripe propio sin intermediarios', 'Consultor dedicado', '4 imágenes por producto'],
    detalle: [
      {
        categoria: '🛍️ Ventas',
        items: [
          { label: 'Stripe propio — sin intermediarios', desc: 'Conectas tu propia cuenta Stripe. El dinero va directo a tu banco. TIENDAONLINE no interviene en ningún momento. Te guiamos paso a paso para activarlo la primera vez.' },
          { label: 'Recuperación de carritos abandonados', desc: 'Aviso automático a clientes que no completaron su compra.' },
          { label: 'Programa de puntos y afiliados', desc: 'Fideliza a tus clientes con puntos canjeables y recompensas.' },
          { label: '0% comisión por venta', desc: 'TIENDAONLINE no cobra porcentaje sobre tus ventas.' },
        ]
      },
      {
        categoria: '📦 Inventario',
        items: [
          { label: 'Productos ilimitados', desc: 'Sin techo. Crece tu catálogo todo lo que necesites.' },
          { label: '4 imágenes por producto', desc: '20 GB de almacenamiento total.' },
          { label: 'Facturación electrónica', desc: 'Genera facturas automáticas compatibles con la normativa italiana.' },
        ]
      },
      {
        categoria: '🔧 Operaciones',
        items: [
          { label: 'Consultor dedicado', desc: 'Un especialista de TIENDAONLINE asignado a tu cuenta para ayudarte a crecer.' },
          { label: 'Backup diario', desc: 'Copia de seguridad automática de todos tus datos cada 24 horas.' },
        ]
      },
      {
        categoria: '💬 Soporte',
        items: [
          { label: 'Soporte dedicado', desc: 'Acceso directo a tu consultor. Sin tiempos de espera.' },
        ]
      },
    ]
  },
}

export default function PlanesPage() {
  const [tienda, setTienda] = useState(null)
  const [loading, setLoading] = useState(true)
  const [anualizacion, setAnualizacion] = useState(false)
  const [procesando, setProcesando] = useState(null)
  const [expandedPlan, setExpandedPlan] = useState(null)

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

    // Todos los planes de pago → checkout Stripe
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
          Planes y Servicios
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
          const estaExpandido = expandedPlan === key

          return (
            <div
              key={key}
              style={{
                background: esActual ? cfg.bg : '#fff',
                border: `${esActual ? '2.5px' : '1.5px'} solid ${estaExpandido ? cfg.color : esActual ? cfg.color : '#e2e8f0'}`,
                borderRadius: 20,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: esActual || estaExpandido ? `0 4px 24px ${cfg.color}20` : '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s, border-color 0.2s',
                overflow: 'hidden',
              }}
            >
              {/* Contenido principal de la tarjeta */}
              <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>

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

                {/* Emoji + Nombre + descripción */}
                <div>
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{cfg.emoji}</div>
                  <h2 style={{ margin: '0 0 4px', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{plan.nombre}</h2>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>{cfg.descripcion}</p>
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

                {/* Highlights — solo lo más importante, siempre visible */}
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {cfg.highlights.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                      <span style={{ color: cfg.color, flexShrink: 0, fontSize: '0.9rem' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Botón ver detalle */}
                <button
                  onClick={() => setExpandedPlan(estaExpandido ? null : key)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: 'transparent', border: `1.5px solid ${cfg.color}40`,
                    borderRadius: 10, padding: '8px 0',
                    color: cfg.color, fontWeight: 700, fontSize: '0.8rem',
                    cursor: 'pointer', width: '100%',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = `${cfg.color}10`}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {estaExpandido ? 'Ocultar detalle' : 'Ver qué incluye'}
                  <ChevronDown
                    size={15}
                    style={{
                      transform: estaExpandido ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s',
                    }}
                  />
                </button>

                {/* Botón suscribirse */}
                <button
                  disabled={(esActual && !info?.esTrial) || estaProcesando}
                  onClick={() => handleSuscribir(key)}
                  style={{
                    padding: '12px 0', borderRadius: 12, border: 'none',
                    background: (esActual && !info?.esTrial) || estaProcesando ? '#f1f5f9' : cfg.color,
                    color: (esActual && !info?.esTrial) || estaProcesando ? '#94a3b8' : '#fff',
                    fontWeight: 700, fontSize: '0.9rem',
                    cursor: (esActual && !info?.esTrial) || estaProcesando ? 'default' : 'pointer',
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'opacity 0.15s',
                    minHeight: 48,
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
                  ) : (
                    `Suscribirse — €${precio}/mes`
                  )}
                </button>
              </div>

              {/* ── ACORDEÓN: detalle expandible ── */}
              {estaExpandido && (
                <div style={{
                  borderTop: `1.5px solid ${cfg.color}25`,
                  background: cfg.bg,
                  padding: '20px 22px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }}>
                  {cfg.detalle.map((seccion, si) => (
                    <div key={si}>
                      <p style={{ margin: '0 0 10px', fontSize: '0.72rem', fontWeight: 800, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {seccion.categoria}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {seccion.items.map((item, ii) => (
                          <div key={ii} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <span style={{
                              width: 20, height: 20, borderRadius: '50%',
                              background: `${cfg.color}15`, color: cfg.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.65rem', fontWeight: 900, flexShrink: 0, marginTop: 1,
                            }}>✓</span>
                            <div>
                              <p style={{ margin: '0 0 2px', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{item.label}</p>
                              <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Nota legal */}
      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: 32 }}>
        El pago se procesa de forma segura a través de Stripe. Puedes cancelar en cualquier momento desde tu perfil.
        Los precios incluyen IVA según la legislación aplicable.
      </p>

      {/* ── SECCIÓN PÁGINA WEB CORPORATIVA ── */}
      <div style={{
        marginTop: 56,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 0,
          alignItems: 'stretch',
        }} className="corporativa-grid">

          {/* Columna izquierda — info */}
          <div style={{ padding: '48px 40px' }}>
            <span style={{
              display: 'inline-block',
              background: '#ca8a04',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              padding: '4px 12px',
              borderRadius: 20,
              marginBottom: 20,
              textTransform: 'uppercase',
            }}>
              + Servicio exclusivo
            </span>

            <h2 style={{ margin: '0 0 14px', fontSize: '2.2rem', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
              Crea tu <span style={{ color: '#4ade80' }}>Página Web Corporativa</span>
            </h2>

            <p style={{ margin: '0 0 24px', color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 520 }}>
              Un sitio web profesional, diseñado y configurado para ti. Sin plantillas genéricas — una identidad digital única para tu empresa.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              {['✓ Diseño a medida', '✓ SEO optimizado', '✓ Hosting & dominio', '✓ Panel de control', '✓ Integración con tu tienda'].map(f => (
                <span key={f} style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#cbd5e1',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: 20,
                }}>
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Columna derecha — precio y CTA */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            padding: '48px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 260,
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#94a3b8', textTransform: 'uppercase' }}>
              Inversión inicial
            </p>
            <p style={{ margin: '0 0 20px', fontSize: '3rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
              €980
            </p>
            <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '0.78rem' }}>Diseño + configuración</p>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '20px 0' }} />

            <p style={{ margin: '0 0 4px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#94a3b8', textTransform: 'uppercase' }}>
              + Mantenimiento anual
            </p>
            <p style={{ margin: '0 0 4px', fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
              €190 <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>/ año</span>
            </p>
            <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.78rem' }}>≈€15,80 al mes</p>

            <a
              href={`https://wa.me/393751239515?text=${encodeURIComponent('Hola, vengo de tiendaonline.it y me gustaría una página web completa y personalizada para mi empresa o negocio. ¿Me pueden preparar un presupuesto?')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: '#ca8a04',
                color: '#fff',
                textAlign: 'center',
                padding: '14px 20px',
                borderRadius: 14,
                fontWeight: 800,
                fontSize: '1rem',
                textDecoration: 'none',
                marginBottom: 10,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Solicitar ahora →
            </a>
            <p style={{ margin: 0, textAlign: 'center', color: '#64748b', fontSize: '0.72rem' }}>
              Sin compromiso · Respuesta en 24h
            </p>
          </div>
        </div>

        {/* Formulario de contacto */}
        <ContactoWebForm />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 600px) {
          .planes-grid { grid-template-columns: 1fr !important; }
          .corporativa-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function ContactoWebForm() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' })
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre || !form.email) return
    setEnviando(true)

    // Abre WhatsApp con el mensaje pre-cargado incluyendo los datos del formulario
    const msg = `Hola, vengo de tiendaonline.it y me gustaría una página web personalizada.\n\n👤 Nombre: ${form.nombre}\n📧 Email: ${form.email}${form.mensaje ? `\n💬 Mensaje: ${form.mensaje}` : ''}\n\n¿Me pueden preparar un presupuesto?`
    window.open(`https://wa.me/393751239515?text=${encodeURIComponent(msg)}`, '_blank')

    setEnviando(false)
    setEnviado(true)
    setTimeout(() => setEnviado(false), 5000)
    setForm({ nombre: '', email: '', mensaje: '' })
  }

  return (
    <div style={{
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '36px 40px 44px',
    }}>
      <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
        ¿Quieres saber más? Déjanos tus datos
      </h3>
      <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.85rem' }}>
        Te contactamos en menos de 24 horas con una propuesta personalizada.
      </p>

      {enviado ? (
        <div style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 12, padding: '16px 20px', color: '#4ade80', fontWeight: 600 }}>
          ✅ ¡Mensaje enviado! Te respondemos en menos de 24h.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="corporativa-form">
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Tu nombre o empresa *"
            required
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Tu correo electrónico *"
            required
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          <textarea
            name="mensaje"
            value={form.mensaje}
            onChange={handleChange}
            placeholder="Cuéntanos sobre tu negocio (opcional)"
            rows={3}
            style={{
              gridColumn: '1 / -1',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, padding: '12px 16px', color: '#fff', fontSize: '0.9rem',
              outline: 'none', resize: 'vertical', fontFamily: 'inherit',
            }}
          />
          <button
            type="submit"
            disabled={enviando}
            style={{
              gridColumn: '1 / -1',
              background: '#16a34a', color: '#fff',
              border: 'none', borderRadius: 12,
              padding: '14px', fontWeight: 800, fontSize: '0.95rem',
              cursor: enviando ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: enviando ? 0.7 : 1,
            }}
          >
            📲 Enviar por WhatsApp
          </button>
          <p style={{ gridColumn: '1 / -1', margin: 0, color: '#475569', fontSize: '0.72rem' }}>
            Al enviar abrirá WhatsApp con tus datos pre-cargados. Sin spam, sin compromiso.
          </p>
        </form>
      )}

      <style>{`
        .corporativa-form { }
        @media (max-width: 600px) {
          .corporativa-form { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
