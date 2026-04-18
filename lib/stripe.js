import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY

if (!key) {
  console.error('[stripe] STRIPE_SECRET_KEY no está definida en las variables de entorno.')
}

export const stripe = new Stripe(key || 'sk_test_missing', {
  apiVersion: '2023-10-16',
  appInfo: {
    name: 'TIENDAONLINE B2B SaaS',
    version: '0.1.0'
  }
})
