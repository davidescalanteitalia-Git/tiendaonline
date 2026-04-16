/**
 * TIENDAONLINE — Sistema de Planes
 *
 * Planes: 'gratis' | 'basico' | 'pro' | 'grow'
 * Durante el trial (plan_suscripcion = 'trial', trial_fin > hoy) → se trata como 'pro'
 * Al vencer el trial → se baja automáticamente a 'gratis'
 */

// ─── Límites y features por plan ──────────────────────────────────────────────
export const PLANES = {
  gratis: {
    nombre: 'Gratis',
    precio: 0,
    max_productos: 50,
    almacenamiento_mb: 100,
    features: {
      pos: true,
      checkout_whatsapp: true,
      subdominio: true,
      pagos_stripe: false,
      exportar_csv: false,
      reportes: 'ninguno',         // ninguno | basico | avanzado | premium
      catalogo_social: false,      // Instagram / Facebook
      cupones: false,
      carritos_abandonados: false,
      programa_puntos: false,
      facturacion: false,
      portal_cliente: false,
      fiados: false,
      backup: 'semanal',
      soporte: 'community',
    },
  },
  basico: {
    nombre: 'Básico',
    precio: 15,
    max_productos: 500,
    almacenamiento_mb: 1024,
    features: {
      pos: true,
      checkout_whatsapp: true,
      subdominio: true,
      pagos_stripe: true,
      exportar_csv: true,
      reportes: 'basico',
      catalogo_social: false,
      cupones: false,
      carritos_abandonados: false,
      programa_puntos: false,
      facturacion: false,
      portal_cliente: false,
      fiados: false,
      backup: 'semanal',
      soporte: 'email',
    },
  },
  pro: {
    nombre: 'Pro',
    precio: 25,
    max_productos: 5000,
    almacenamiento_mb: 5120,
    features: {
      pos: true,
      checkout_whatsapp: true,
      subdominio: true,
      pagos_stripe: true,
      exportar_csv: true,
      reportes: 'avanzado',
      catalogo_social: true,
      cupones: true,
      carritos_abandonados: false,
      programa_puntos: false,
      facturacion: false,
      portal_cliente: true,
      fiados: true,
      backup: 'diario',
      soporte: 'prioritario',
    },
  },
  grow: {
    nombre: 'Grow',
    precio: 40,
    max_productos: Infinity,
    almacenamiento_mb: 20480,
    features: {
      pos: true,
      checkout_whatsapp: true,
      subdominio: true,
      pagos_stripe: true,
      exportar_csv: true,
      reportes: 'premium',
      catalogo_social: true,
      cupones: true,
      carritos_abandonados: true,
      programa_puntos: true,
      facturacion: true,
      portal_cliente: true,
      fiados: true,
      backup: 'diario',
      soporte: 'dedicado',
    },
  },
}

// ─── Función principal: devuelve el plan REAL de una tienda ────────────────────
/**
 * @param {object} tienda - Row de la tabla tiendas
 * @returns {{ planKey: string, plan: object, esTrial: boolean, diasRestantesTrial: number | null, trialVencido: boolean }}
 */
export function getPlan(tienda) {
  const planGuardado = (tienda?.plan_suscripcion || 'gratis').toLowerCase()
  const trialFin = tienda?.trial_fin ? new Date(tienda.trial_fin) : null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  let esTrial = false
  let trialVencido = false
  let diasRestantesTrial = null
  let planKey = planGuardado

  if (planGuardado === 'trial' && trialFin) {
    const diff = Math.floor((trialFin - hoy) / (1000 * 60 * 60 * 24))
    if (diff >= 0) {
      // Trial activo → se comporta como Pro
      esTrial = true
      diasRestantesTrial = diff
      planKey = 'pro'
    } else {
      // Trial vencido → baja a Gratis
      trialVencido = true
      planKey = 'gratis'
    }
  }

  const plan = PLANES[planKey] || PLANES['gratis']

  return {
    planKey,
    plan,
    esTrial,
    diasRestantesTrial,
    trialVencido,
    planGuardado,
  }
}

// ─── Helpers de acceso rápido ──────────────────────────────────────────────────
export function tieneFeature(tienda, feature) {
  const { plan } = getPlan(tienda)
  return !!plan.features[feature]
}

export function maxProductos(tienda) {
  const { plan } = getPlan(tienda)
  return plan.max_productos
}

export function puedeAgregarProducto(tienda, cantidadActual) {
  return cantidadActual < maxProductos(tienda)
}

export function nivelReportes(tienda) {
  const { plan } = getPlan(tienda)
  return plan.features.reportes // 'ninguno' | 'basico' | 'avanzado' | 'premium'
}

// ─── Plan requerido para cada feature (para el modal de upgrade) ───────────────
export const FEATURE_REQUIERE = {
  cupones: 'pro',
  fiados: 'pro',
  portal_cliente: 'pro',
  catalogo_social: 'pro',
  reportes_avanzados: 'pro',
  pagos_stripe: 'basico',
  exportar_csv: 'basico',
  carritos_abandonados: 'grow',
  programa_puntos: 'grow',
  facturacion: 'grow',
}
