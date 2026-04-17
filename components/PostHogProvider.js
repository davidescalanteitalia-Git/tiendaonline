'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

// ── PostHog config ─────────────────────────────────────────────────────────────
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || ''
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

let _ph = null

function getPostHog() {
  return _ph
}

async function initPostHog() {
  if (typeof window === 'undefined') return
  if (_ph) return _ph
  try {
    const { default: posthog } = await import('posthog-js')
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',   // No crea perfiles para usuarios anónimos
      capture_pageview: false,               // Lo manejamos manualmente para SPA
      capture_pageleave: true,
      autocapture: true,                     // Captura clicks, inputs, etc. automáticamente
      session_recording: {
        maskAllInputs: true,                 // Protege datos de clientes (GDPR)
        maskInputOptions: { password: true },
      },
      loaded: (ph) => {
        if (process.env.NODE_ENV !== 'production') {
          ph.opt_out_capturing()             // No captura en desarrollo local
        }
      },
    })
    _ph = posthog
    return posthog
  } catch (err) {
    console.warn('PostHog no disponible:', err)
    return null
  }
}

// ── Provider principal ─────────────────────────────────────────────────────────
export default function PostHogProvider({ children }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    initPostHog()
  }, [])

  // Captura cambios de página (Next.js SPA navigation)
  useEffect(() => {
    const ph = getPostHog()
    if (!ph) return
    ph.capture('$pageview', {
      $current_url: window.location.href,
    })
  }, [pathname, searchParams])

  return children
}

// ── Funciones de tracking exportadas (usar en cualquier componente) ─────────────

/**
 * Identifica al dueño de la tienda cuando inicia sesión
 * @param {string} userId - ID del usuario en Supabase Auth
 * @param {object} tienda - Objeto tienda de la DB
 */
export function identificarDueno(userId, tienda) {
  const ph = getPostHog()
  if (!ph) return
  ph.identify(userId, {
    nombre_tienda: tienda?.nombre,
    subdominio: tienda?.subdominio,
    plan: tienda?.plan_suscripcion || 'trial',
    trial_fin: tienda?.trial_fin,
    whatsapp: tienda?.whatsapp ? '✓' : '✗',  // No guardamos el número real
  })
  ph.group('tienda', tienda?.id, {
    nombre: tienda?.nombre,
    subdominio: tienda?.subdominio,
    plan: tienda?.plan_suscripcion,
  })
}

/**
 * Resetea la identidad al cerrar sesión
 */
export function resetearIdentidad() {
  const ph = getPostHog()
  if (!ph) return
  ph.reset()
}

/**
 * Registra un evento de negocio
 * @param {string} evento - Nombre del evento
 * @param {object} props - Propiedades adicionales
 */
export function registrarEvento(evento, props = {}) {
  const ph = getPostHog()
  if (!ph) return
  ph.capture(evento, props)
}

// ── Eventos predefinidos del negocio ──────────────────────────────────────────

export const EVENTOS = {
  // Catálogo público
  CATALOGO_VISTO:         'catalogo_visto',
  PRODUCTO_VISTO:         'producto_visto',
  PRODUCTO_AGREGADO:      'producto_agregado_carrito',
  PEDIDO_INICIADO:        'checkout_iniciado',
  PEDIDO_COMPLETADO:      'pedido_completado',       // orden enviada al dueño
  WHATSAPP_ABIERTO:       'whatsapp_pedido_abierto',

  // POS
  POS_COBRO:              'pos_cobro_realizado',
  POS_FIADO:              'pos_fiado_registrado',
  POS_BARCODE:            'pos_barcode_escaneado',

  // Portal del cliente
  CLIENTE_REGISTRO:       'cliente_registro',
  CLIENTE_LOGIN:          'cliente_login',
  CLIENTE_CUENTA_BORRADA: 'cliente_cuenta_eliminada',

  // Dashboard
  TIENDA_REGISTRADA:      'tienda_registrada',
  PRODUCTO_CREADO:        'producto_creado',
  PLAN_PAGINA_VISTA:      'planes_pagina_vista',
  PLAN_CLICK_UPGRADE:     'plan_click_upgrade',
}
