import { NextResponse } from 'next/server'
import { stripe } from '../../../../lib/stripe'
import { getSupabaseAdmin } from '../../../../lib/supabase-admin'
import { headers } from 'next/headers'

export async function POST(request) {
  const body = await request.text()
  const sig = headers().get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  // 1. Validar la procedencia legítima del evento mediante firma secreta
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  // 2. Gestionar eventos de subscripción (The Billing Engine)
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const tiendaId = session.metadata.tienda_id
        if (tiendaId && session.subscription) {
           const subscription = await stripe.subscriptions.retrieve(session.subscription)
           const priceId = subscription.items.data[0].price.id

           // Mapear el priceId de Stripe al plan interno de TIENDAONLINE
           const PRICE_TO_PLAN = {
             [process.env.NEXT_PUBLIC_STRIPE_PRICE_BASICO_MO || 'price_1TNFMn7BdqFx9FaONU1aO9h5']: 'basico',
             [process.env.NEXT_PUBLIC_STRIPE_PRICE_BASICO_YR || 'price_1TNFMr7BdqFx9FaO5x9Cd2hk']: 'basico',
             [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MO    || 'price_1TNFMw7BdqFx9FaO3REVUH6R']:  'pro',
             [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YR    || 'price_1TNFN17BdqFx9FaOoJWvQv4D']:  'pro',
             [process.env.NEXT_PUBLIC_STRIPE_PRICE_GROW_MO   || 'price_1TNFN57BdqFx9FaOK54593Pq']:  'grow',
             [process.env.NEXT_PUBLIC_STRIPE_PRICE_GROW_YR   || 'price_1TNFN97BdqFx9FaOe58Mqzc5']:  'grow',
           }
           const newPlan = PRICE_TO_PLAN[priceId] || 'basico'

           await supabaseAdmin
             .from('tiendas')
             .update({
               stripe_subscription_id: subscription.id,
               stripe_price_id: priceId,
               plan_suscripcion: newPlan
             })
             .eq('id', tiendaId)
        }
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer

        // Si el estado cae de "activo" por tarjeta rechazada... suspendemos graciosamente
        if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
           await supabaseAdmin
             .from('tiendas')
             .update({ plan_suscripcion: 'alerta_pago' })
             .eq('stripe_customer_id', customerId)
        } else if (subscription.status === 'active') {
           // Resolver el plan real según el priceId activo en la suscripción
           const priceId = subscription.items.data[0]?.price?.id
           const PRICE_TO_PLAN = {
             [process.env.NEXT_PUBLIC_STRIPE_PRICE_BASICO_MO || 'price_1TNFMn7BdqFx9FaONU1aO9h5']: 'basico',
             [process.env.NEXT_PUBLIC_STRIPE_PRICE_BASICO_YR || 'price_1TNFMr7BdqFx9FaO5x9Cd2hk']: 'basico',
             [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MO    || 'price_1TNFMw7BdqFx9FaO3REVUH6R']:  'pro',
             [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YR    || 'price_1TNFN17BdqFx9FaOoJWvQv4D']:  'pro',
             [process.env.NEXT_PUBLIC_STRIPE_PRICE_GROW_MO   || 'price_1TNFN57BdqFx9FaOK54593Pq']:  'grow',
             [process.env.NEXT_PUBLIC_STRIPE_PRICE_GROW_YR   || 'price_1TNFN97BdqFx9FaOe58Mqzc5']:  'grow',
           }
           const restoredPlan = priceId ? (PRICE_TO_PLAN[priceId] || 'basico') : 'basico'
           await supabaseAdmin
             .from('tiendas')
             .update({ plan_suscripcion: restoredPlan, stripe_price_id: priceId })
             .eq('stripe_customer_id', customerId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer
        
        // Si se cancela por completo o pasa su fecha límite de dunning process, revertimos la tienda a estado gratuíto/demoware
        await supabaseAdmin
            .from('tiendas')
            .update({
               stripe_subscription_id: null,
               stripe_price_id: null,
               plan_suscripcion: 'gratis'
            })
            .eq('stripe_customer_id', customerId)
        break
      }

      default:
        console.log(`[Stripe Webhook Tracker] Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error processing in Supabase:', err)
    return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
  }
}
