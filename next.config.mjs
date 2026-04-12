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
    ],
  },
}

export default withSentryConfig(nextConfig, {
  // DSN del proyecto (también lo lee de SENTRY_DSN en env)
  dsn: 'https://eb22599194471c7a060a4735a16123fa@o4511186117328896.ingest.de.sentry.io/4511208114683984',

  // Organización y proyecto en Sentry (para source maps)
  org: 'deibys-david-escalante-rodrigu',
  project: 'tiendaonline',

  // Sube source maps a Sentry al hacer build → errores muestran código real, no minificado
  sourcemaps: {
    deleteSourcemapsAfterUpload: true, // no expone el código fuente en producción
  },

  // Silencia el output del plugin durante el build
  silent: true,

  // Desactiva el tunnel en dev para no confundir requests
  tunnelRoute: undefined,

  // No bloquea el build si Sentry falla
  disableClientWebpackPlugin: false,
  disableServerWebpackPlugin: false,
})
