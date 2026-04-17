import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      // Supabase Storage — imágenes de productos y logos de tiendas
      { protocol: 'https', hostname: 'bripfrfkwahsxtegmils.supabase.co' },
      // Cualquier subdominio de tiendaonline.it (catálogos de vendedores)
      { protocol: 'https', hostname: '*.tiendaonline.it' },
      // Unsplash (usado en OnboardingWizard thumbnail)
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Security Headers — FASE 3 de la auditoría de seguridad (Sesión 14)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ]
  },
}

// Solo aplicamos Sentry si hay auth token disponible (evita fallos de build en Coolify)
const hasSentryToken = !!process.env.SENTRY_AUTH_TOKEN
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN

export default hasSentryToken
  ? withSentryConfig(nextConfig, {
      dsn: sentryDsn,
      org: 'deibys-david-escalante-rodrigu',
      project: 'tiendaonline',
      sourcemaps: {
        deleteSourcemapsAfterUpload: true,
      },
      silent: true,
      tunnelRoute: undefined,
      disableClientWebpackPlugin: false,
      disableServerWebpackPlugin: false,
    })
  : nextConfig
