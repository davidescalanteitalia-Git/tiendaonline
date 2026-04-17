import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../lib/supabase-admin'
import { stripe } from '../../../../lib/stripe'

export async function POST(request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    const body = await request.json()
    const { priceId, tiendaId } = body

    if (!priceId || !tiendaId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    // Verificar que el usuario tenga acceso a esta tienda
    const { data: tienda } = await supabaseAdmin
      .from('tiendas')
      .select('id, nombre, stripe_customer_id')
      .eq('id', tiendaId)
      .eq('user_id', user.id)
      .single()

    if (!tienda) {
      return NextResponse.json({ error: 'Tienda no encontrada o acceso denegado' }, { status: 404 })
    }

    let customerId = tienda.stripe_customer_id

    // Crear cliente en Stripe si no existe uno asociado aún a esta tienda SaaS
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            name: tienda.nombre,
            metadata: {
                tienda_id: tienda.id,
                user_id: user.id
            }
        })
        customerId = customer.id
        await supabaseAdmin
            .from('tiendas')
            .update({ stripe_customer_id: customerId })
            .eq('id', tienda.id)
    }

    // Ruta de redirección post-checkout (Fallback estricto para localhost)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Crear la sesión de Checkout 100% Hosted por Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/planes?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/planes?canceled=true`,
      metadata: {
        tienda_id: tienda.id,
      },
    })

    // Retorna la URL dinámica del pago
    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Error creando checkout session:', error)
    return NextResponse.json({ error: 'Error interno conectando con pasarela' }, { status: 500 })
  }
}
