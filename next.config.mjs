import { withSentryConfig } from '@sentry/nextjs'
import { withAxiom } from 'next-axiom'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reduce memoria en build — evita OOM en "Collecting build traces" (Coolify VPS)
  output: 'standalone',
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
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
  // Security Headers — FASE 3 (Sesión 14) + CSP (Sesión 20)
  async headers() {
    // Content-Security-Policy calibrada para Next.js + Supabase + Stripe + Sentry
    const csp = [
      "default-src 'self'",
      // Scripts: Next.js inline scripts + Stripe.js
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://browser.sentry-cdn.com",
      // Estilos: inline styles que usa Tailwind/Next.js
      "style-src 'self' 'unsafe-inline'",
      // Imágenes: Supabase Storage, Unsplash, Picsum, tiendaonline.it
      "img-src 'self' data: blob: https://bripfrfkwahsxtegmils.supabase.co https://images.unsplash.com https://picsum.photos https://*.tiendaonline.it",
      // Fuentes
      "font-src 'self' data:",
      // Conexiones: Supabase API, Stripe API, Sentry, Axiom
      "connect-src 'self' https://bripfrfkwahsxtegmils.supabase.co wss://bripfrfkwahsxtegmils.supabase.co https://api.stripe.com https://*.sentry.io https://o4509068217901056.ingest.sentry.io https://api.axiom.co",
      // iFrames de Stripe Checkout
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      // Sin objetos embebidos
      "object-src 'none'",
      // Base URI restringida
      "base-uri 'self'",
      // Form actions solo al mismo origen
      "form-action 'self'",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

// Solo aplicamos Sentry si hay auth token disponible (evita fallos de build en Coolify)
const hasSentryToken = !!process.env.SENTRY_AUTH_TOKEN
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN

const configWithAxiom = withAxiom(nextConfig)

export default hasSentryToken
  ? withSentryConfig(configWithAxiom, {
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
  : configWithAxiom
