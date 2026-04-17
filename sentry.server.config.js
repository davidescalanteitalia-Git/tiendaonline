import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://eb22599194471c7a060a4735a16123fa@o4511186117328896.ingest.de.sentry.io/4511208114683984',

  // Captura el 100% de errores server-side
  tracesSampleRate: 1.0,

  enabled: process.env.NODE_ENV === 'production',

  environment: process.env.NODE_ENV,
})
