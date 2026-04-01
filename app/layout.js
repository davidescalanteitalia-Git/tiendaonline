import './globals.css'

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
        url: 'https://tiendaonline.it/og-image.png',
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
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
