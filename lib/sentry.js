/**
 * lib/sentry.js
 * Utilidades de Sentry para capturar errores con contexto de negocio.
 * Usar en API routes para enriquecer los errores con tienda_id y módulo.
 */
import * as Sentry from '@sentry/nextjs'

/**
 * Captura un error con contexto completo de la tienda.
 * Usar en catch blocks de API routes críticas.
 *
 * @param {Error} err - El error capturado
 * @param {Object} context - Contexto adicional
 * @param {string} context.modulo - Nombre del módulo ('POS', 'Pedidos', 'Checkout', etc.)
 * @param {string} [context.tiendaId] - ID de la tienda afectada
 * @param {string} [context.userId] - ID del usuario
 * @param {Object} [context.extra] - Datos extra para depuración
 */
export function capturarError(err, { modulo, tiendaId, userId, extra = {} } = {}) {
  Sentry.withScope((scope) => {
    // Tag principal para filtrar en el dashboard de Sentry
    scope.setTag('modulo', modulo || 'desconocido')

    // Contexto del inquilino afectado
    if (tiendaId) {
      scope.setTag('tienda_id', tiendaId)
      scope.setContext('tienda', { id: tiendaId })
    }

    // Usuario autenticado
    if (userId) {
      scope.setUser({ id: userId })
    }

    // Datos extra para depuración (items del carrito, método de pago, etc.)
    if (Object.keys(extra).length > 0) {
      scope.setContext('datos_extra', extra)
    }

    Sentry.captureException(err)
  })
}

/**
 * Captura un mensaje de advertencia (no es un error, pero es importante registrarlo).
 * Útil para: stock en 0 bloqueado, pedido sin items, intento de acceso sin auth, etc.
 */
export function capturarAviso(mensaje, { modulo, tiendaId, extra = {} } = {}) {
  Sentry.withScope((scope) => {
    scope.setTag('modulo', modulo || 'desconocido')
    scope.setLevel('warning')
    if (tiendaId) scope.setTag('tienda_id', tiendaId)
    if (Object.keys(extra).length > 0) scope.setContext('datos_extra', extra)
    Sentry.captureMessage(mensaje)
  })
}
