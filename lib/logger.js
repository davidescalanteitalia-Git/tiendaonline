/**
 * TIENDAONLINE — Logger centralizado (Axiom via next-axiom)
 * Uso: import { log } from '@/lib/logger'
 *      log.info('mensaje', { key: 'value' })
 *      log.error('error', { error: err.message, tienda_id: '...' })
 */
import { Logger } from 'next-axiom'

export const log = new Logger()

/**
 * Helper para loggear errores de API con contexto enriquecido
 */
export function logApiError(route, error, context = {}) {
  log.error(`API Error: ${route}`, {
    route,
    error: error?.message || String(error),
    stack: error?.stack?.split('\n').slice(0, 3).join(' | '),
    ...context,
  })
}

/**
 * Helper para loggear eventos de negocio importantes
 */
export function logEvent(event, data = {}) {
  log.info(event, {
    event,
    env: process.env.NODE_ENV,
    ...data,
  })
}
