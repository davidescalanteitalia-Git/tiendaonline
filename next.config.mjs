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
}

// Solo aplicamos Sentry si hay auth token disponible (evita fallos de build en Coolify)
const hasSentryToken = !!process.env.SENTRY_AUTH_TOKEN

export default hasSentryToken
  ? withSentryConfig(nextConfig, {
      dsn: 'https://eb22599194471c7a060a4735a16123fa@o4511186117328896.ingest.de.sentry.io/4511208114683984',
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
