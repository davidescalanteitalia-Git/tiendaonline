'use client'

import { getPlan } from '../lib/planes'

/**
 * PlanBanner — Se muestra en la parte superior del dashboard.
 *
 * Casos:
 *   1. Trial activo con ≤ 7 días → banner naranja de urgencia
 *   2. Trial vencido (auto-bajado a Free) → banner rojo permanente
 *   3. Plan Free (sin trial) → banner azul suave
 *   4. Plan Básico/Pro/Grow → no muestra nada
 */
export default function PlanBanner({ tienda }) {
  const { planKey, esTrial, diasRestantesTrial, trialVencido, planGuardado } = getPlan(tienda)

  // Plan de pago activo → no mostrar nada
  if (!esTrial && !trialVencido && planGuardado !== 'trial' && planKey !== 'gratis') return null
  // Plan gratis sin haber tenido trial → mostrar banner suave
  // Trial vencido → banner rojo
  // Trial con ≤ 7 días → banner naranja

  const esCritico = diasRestantesTrial !== null && diasRestantesTrial <= 7
  const esMuyUrgente = diasRestantesTrial !== null && diasRestantesTrial <= 3

  // Determinar estilo y mensaje
  let bg, border, textColor, iconBg, titulo, subtitulo, btnLabel, btnColor

  if (trialVencido) {
    bg = '#fff1f1'
    border = '#fca5a5'
    textColor = '#7f1d1d'
    iconBg = '#fee2e2'
    titulo = '⏰ Tu período de prueba ha terminado'
    subtitulo = 'Tu tienda ahora está en el plan Gratis (50 productos, sin cupones ni reportes avanzados). Elige un plan para recuperar todas las funciones.'
    btnLabel = '🚀 Ver planes'
    btnColor = '#dc2626'
  } else if (esMuyUrgente) {
    bg = '#fff7ed'
    border = '#fb923c'
    textColor = '#7c2d12'
    iconBg = '#ffedd5'
    titulo = `🔥 Solo te quedan ${diasRestantesTrial} ${diasRestantesTrial === 1 ? 'día' : 'días'} de prueba Pro`
    subtitulo = 'Al vencer, tu tienda pasará al plan Gratis automáticamente. ¡No pierdas tus funciones Pro!'
    btnLabel = '⚡ Elegir plan ahora'
    btnColor = '#ea580c'
  } else if (esCritico) {
    bg = '#fffbeb'
    border = '#fbbf24'
    textColor = '#78350f'
    iconBg = '#fef3c7'
    titulo = `⚠️ Tu prueba Pro vence en ${diasRestantesTrial} días`
    subtitulo = 'Elige un plan antes de que venza para no perder cupones, fiados y reportes avanzados.'
    btnLabel = 'Ver planes disponibles'
    btnColor = '#d97706'
  } else if (esTrial) {
    // Trial activo con más de 7 días → no mostrar banner (no molestamos)
    return null
  } else {
    // Plan Gratis sin trial
    bg = '#f0f9ff'
    border = '#7dd3fc'
    textColor = '#0c4a6e'
    iconBg = '#e0f2fe'
    titulo = '✨ Estás en el plan Gratis'
    subtitulo = 'Mejora a Pro desde €25/mes y desbloquea cupones, reportes avanzados, fiados, portal del cliente y mucho más.'
    btnLabel = 'Ver planes'
    btnColor = '#0284c7'
  }

  return (
    <div style={{
      background: bg,
      border: `1.5px solid ${border}`,
      borderRadius: 14,
      padding: '14px 18px',
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      flexWrap: 'wrap',
    }}>
      {/* Icono */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.3rem', flexShrink: 0,
      }}>
        {trialVencido ? '🔒' : esCritico ? '⏳' : '💡'}
      </div>

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', color: textColor }}>{titulo}</p>
        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: textColor, opacity: 0.8, lineHeight: 1.4 }}>{subtitulo}</p>
      </div>

      {/* Botón */}
      <a
        href="/dashboard/planes"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: btnColor, color: '#fff',
          border: 'none', borderRadius: 10,
          padding: '9px 18px', fontSize: '0.83rem', fontWeight: 700,
          textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {btnLabel} →
      </a>
    </div>
  )
}
