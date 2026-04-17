import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Versión de API recomendada o la última estable soportada
  appInfo: {
    name: 'TIENDAONLINE B2B SaaS',
    version: '0.1.0'
  }
})
