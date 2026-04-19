import './globals.css'
import { LanguageProvider } from '../components/LanguageProvider'
import CookieBanner from '../components/CookieBanner'
import PostHogProvider from '../components/PostHogProvider'

export const metadata = {
  title: {
    default: 'TIENDAONLINE — Crea la tua bottega online gratis | POS + WhatsApp | Italia',
    template: '%s | TIENDAONLINE',
  },
  description:
    'Crea il tuo negozio online gratis in 10 minuti. POS dal cellulare, ordini su WhatsApp, zero commissioni. Per piccoli negozi in Italia e Latinoamerica. Senza carta di credito.',
  keywords: [
    'negozio online gratis', 'creare tienda online gratis', 'POS gratis cellulare',
    'vendere su WhatsApp', 'cassa gratis smartphone', 'tienda online pequeños negocios',
    'vender por WhatsApp', 'punto de venta gratis celular', 'gestione inventario piccolo negozio',
    'alternativa Shopify gratis',
  ],
  authors: [{ name: 'TIENDAONLINE', url: 'https://tiendaonline.it' }],
  creator: 'TIENDAONLINE',
  publisher: 'TIENDAONLINE',
  metadataBase: new URL('https://tiendaonline.it'),
  alternates: {
    canonical: 'https://tiendaonline.it',
    languages: {
      'it': 'https://tiendaonline.it',
      'es': 'https://tiendaonline.it',
    },
  },
  openGraph: {
    title: 'TIENDAONLINE — Crea la tua bottega online gratis | POS + WhatsApp | Italia',
    description: 'Negozio online gratis + POS dal cellulare + ordini su WhatsApp. Zero commissioni. Per piccoli negozi in Italia.',
    url: 'https://tiendaonline.it',
    siteName: 'TIENDAONLINE',
    images: [
      {
        url: 'https://tiendaonline.it/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'TIENDAONLINE — La tua vetrina online in 10 minuti',
      },
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TIENDAONLINE — Negozio online gratis in 10 minuti',
    description: 'POS dal cellulare + ordini WhatsApp + inventario. Zero commissioni. Gratis per sempre.',
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// ── Schema.org — SoftwareApplication + Organization ───────────────────────────
const SOFTWARE_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'TIENDAONLINE',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, iOS, Android',
      description: 'Plataforma híbrida e-commerce y POS para pequeños negocios. Crea tu tienda online gratis, gestiona inventario y recibe pedidos por WhatsApp.',
      url: 'https://tiendaonline.it',
      offers: [
        {
          '@type': 'Offer',
          name: 'Plan Gratuito',
          price: '0',
          priceCurrency: 'EUR',
          description: 'Hasta 50 productos, POS táctil, checkout por WhatsApp. Sin límite de tiempo.',
        },
        {
          '@type': 'Offer',
          name: 'Plan Básico',
          price: '15',
          priceCurrency: 'EUR',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '15',
            priceCurrency: 'EUR',
            unitCode: 'MON',
          },
        },
        {
          '@type': 'Offer',
          name: 'Plan Pro',
          price: '25',
          priceCurrency: 'EUR',
        },
        {
          '@type': 'Offer',
          name: 'Plan Grow',
          price: '40',
          priceCurrency: 'EUR',
        },
      ],
      // aggregateRating removido hasta disponer de reseñas reales verificables (Trustpilot/Google).
      // Mantenerlo sin respaldo es riesgo de publicidad engañosa (Art. 23 Codice del Consumo IT / RDL 24/2021 ES).
    },
    {
      '@type': 'Organization',
      name: 'TIENDAONLINE',
      url: 'https://tiendaonline.it',
      logo: 'https://tiendaonline.it/logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'soporte@tiendaonline.it',
        availableLanguage: ['Italian', 'Spanish'],
      },
      sameAs: [],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Quanto costa TIENDAONLINE?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Il piano Gratuito non scade mai — zero costi, zero carta di credito. Per chi vuole di più: Base a €15/mese, Pro a €25/mese, Grow a €40/mese. Tutti i piani a pagamento includono 30 giorni di prova gratuita.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Cuánto cuesta TIENDAONLINE?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'El plan Gratuito no caduca nunca — sin costo, sin tarjeta de crédito. Para quienes quieren más: Básico a €15/mes, Pro a €25/mes, Grow a €40/mes. Todos los planes de pago incluyen 30 días de prueba gratis.',
          },
        },
        {
          '@type': 'Question',
          name: 'TIENDAONLINE cobra comisiones por venta?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. TIENDAONLINE no cobra ninguna comisión sobre tus ventas en ningún plan. Si conectas Stripe para pagos online, solo pagas las tarifas estándar de Stripe directamente a ellos.',
          },
        },
        {
          '@type': 'Question',
          name: 'TIENDAONLINE prende commissioni sulle vendite?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. TIENDAONLINE non prende nessuna percentuale sulle tue vendite in nessun piano. Se colleghi Stripe per i pagamenti online, paghi solo le tariffe standard di Stripe direttamente a loro.',
          },
        },
        {
          '@type': 'Question',
          name: 'I miei clienti devono registrarsi per ordinare?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. I tuoi clienti entrano nella tua vetrina, scelgono i prodotti e ti mandano l\'ordine su WhatsApp senza creare nessun account.',
          },
        },
        {
          '@type': 'Question',
          name: 'Posso usare TIENDAONLINE dal cellulare?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sì. TIENDAONLINE è progettato mobile-first. Il POS, il pannello di controllo e la vetrina funzionano perfettamente su smartphone. Puoi anche installarlo come app dal browser.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* PWA */}
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tienda" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_SCHEMA) }}
        />
      </head>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-slate-900 text-white p-3 rounded-xl font-medium shadow-2xl outline-none focus:ring-4 focus:ring-primary/50">
          Saltar al contenido
        </a>
        <LanguageProvider>
          <PostHogProvider>
            {children}
            <CookieBanner />
          </PostHogProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
