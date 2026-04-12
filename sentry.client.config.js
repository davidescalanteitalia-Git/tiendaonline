import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://eb22599194471c7a060a4735a16123fa@o4511186117328896.ingest.de.sentry.io/4511208114683984',

  // Captura el 100% de errores. En producción con mucho tráfico bajar a 0.1 (10%)
  tracesSampleRate: 1.0,

  // Replay: graba sesión del usuario cuando ocurre un error (muy útil para POS y checkout)
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05, // 5% de sesiones normales grabadas

  integrations: [
    Sentry.replayIntegration({
      // Oculta campos sensibles en grabaciones
      maskAllText: false,
      blockAllMedia: false,
      maskAllInputs: true, // oculta passwords y datos del cliente
    }),
  ],

  // No enviar errores en desarrollo local
  enabled: process.env.NODE_ENV === 'production',

  environment: process.env.NODE_ENV,

  // Ignorar errores comunes de navegador que no son del código
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    /^Network Error$/,
    /ChunkLoadError/,
  ],
})
