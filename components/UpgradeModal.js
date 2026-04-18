'use client'

import { PLANES, FEATURE_REQUIERE } from '../lib/planes'

const FEATURE_NOMBRES = {
  cupones: 'Cupones de descuento',
  fiados: 'Fiados y cuentas corrientes',
  portal_cliente: 'Portal del cliente',
  catalogo_social: 'Catálogo Instagram / Facebook',
  reportes_avanzados: 'Reportes financieros avanzados',
  pagos_stripe: 'Pagos online con Stripe',
  exportar_csv: 'Exportación CSV / PDF',
  carritos_abandonados: 'Recuperación de carritos',
  programa_puntos: 'Programa de puntos y afiliados',
  facturacion: 'Facturación electrónica',
}

const PLAN_COLORES = {
  basico: '#0284c7',
  pro: '#16a34a',
  grow: '#7c3aed',
}

/**
 * Modal que aparece cuando el usuario intenta usar una función bloqueada.
 *
 * Props:
 *   feature: string  (clave de FEATURE_REQUIERE)
 *   onClose: fn
 */
export default function UpgradeModal({ feature, onClose }) {
  if (!feature) return null

  const planRequeridoKey = FEATURE_REQUIERE[feature] || 'pro'
  const planRequerido = PLANES[planRequeridoKey]
  const colorPlan = PLAN_COLORES[planRequeridoKey] || '#16a34a'
  const nombreFeature = FEATURE_NOMBRES[feature] || feature

  // Planes que incluyen esta feature (el requerido y los superiores)
  const orden = ['gratis', 'basico', 'pro', 'grow']
  const planesDisponibles = orden
    .slice(orden.indexOf(planRequeridoKey))
    .filter(k => k !== 'gratis')
    .map(k => ({ key: k, ...PLANES[k] }))

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20, padding: 28,
          maxWidth: 420, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: `${colorPlan}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', fontSize: '1.6rem',
          }}>
            🔒
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
            Función exclusiva del plan {planRequerido.nombre}
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            <strong style={{ color: '#0f172a' }}>{nombreFeature}</strong> está disponible desde el plan{' '}
            <strong style={{ color: colorPlan }}>{planRequerido.nombre}</strong> (€{planRequerido.precio}/mes).
          </p>
        </div>

        {/* Planes disponibles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {planesDisponibles.map(p => (
            <div key={p.key} style={{
              border: `1.5px solid ${p.key === planRequeridoKey ? colorPlan : '#e2e8f0'}`,
              borderRadius: 12, padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: p.key === planRequeridoKey ? `${colorPlan}08` : '#f8fafc',
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                  {p.key === planRequeridoKey && <span style={{ color: colorPlan }}>★ </span>}
                  {p.nombre}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Hasta {p.max_productos === Infinity ? 'ilimitados' : p.max_productos.toLocaleString()} productos
                </p>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: p.key === planRequeridoKey ? colorPlan : '#64748b' }}>
                €{p.precio}<span style={{ fontSize: '0.7rem', fontWeight: 500 }}>/mes</span>
              </span>
            </div>
          ))}
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10,
              border: '1.5px solid #e2e8f0', background: '#fff',
              color: '#64748b', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <a
            href="/dashboard/planes"
            style={{
              flex: 2, padding: '11px 0', borderRadius: 10,
              background: colorPlan, color: '#fff',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              textDecoration: 'none', textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            🚀 Ver planes y precios
          </a>
        </div>
      </div>
    </div>
  )
}
