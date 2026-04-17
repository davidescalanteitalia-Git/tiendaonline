import './globals.css'
import { LanguageProvider } from '../components/LanguageProvider'
import CookieBanner from '../components/CookieBanner'
import PostHogProvider from '../components/PostHogProvider'

export const metadata = {
  title: 'TIENDAONLINE — La tua vetrina online in 10 minuti',
  description:
    'Crea la tua bottega online gratis in 10 minuti. I tuoi clienti ordinano su WhatsApp. Senza carta di credito.',
  openGraph: {
    title: 'TIENDAONLINE — La tua vetrina online in 10 minuti',
    description: 'Crea la tua bottega online gratis in 10 minuti. Ordini via WhatsApp.',
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
    title: 'TIENDAONLINE — La tua vetrina online in 10 minuti',
    description: 'Crea la tua bottega online gratis in 10 minuti. Ordini via WhatsApp.',
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  manifest: '/manifest.json',
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
