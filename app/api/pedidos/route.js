import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { NextResponse } from 'next/server'
import { capturarError } from '../../../lib/sentry'

export const dynamic = 'force-dynamic'

// GET: Fetch orders for the seller's dashboard
export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseAdmin = getSupabaseAdmin()

    // 1. Get user from token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    // 2. Get store for this user
    const { data: tienda } = await supabaseAdmin
      .from('tiendas')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!tienda) {
      return NextResponse.json({ error: 'no_store' }, { status: 404 })
    }

    // 3. Fetch orders for this store
    const { data: pedidos, error: pedidosError } = await supabaseAdmin
      .from('pedidos')
      .select('*')
      .eq('tienda_id', tienda.id)
      .order('created_at', { ascending: false })

    if (pedidosError) throw pedidosError

    return NextResponse.json({ pedidos })
  } catch (err) {
    capturarError(err, { modulo: 'Pedidos', extra: { endpoint: 'GET /api/pedidos' } })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST: Create a new order (from customer store)
export async function POST(req) {
  let body = {}
  try {
    body = await req.json()
    const { tienda_id, cliente_nombre, items, total, metodo_envio, metodo_pago, direccion, shipping_cost, whatsapp } = body
    const supabaseAdmin = getSupabaseAdmin()

    if (!tienda_id || !cliente_nombre || !items || !total) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
    }

    // 1. Generate unique code for this store
    const { count } = await supabaseAdmin
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .eq('tienda_id', tienda_id)

    const orderNumber = (count || 0) + 101
    const codigo = `#C-${orderNumber}`

    // Include metadata in items or as a special structure if preferred
    // For now, we'll store metadata as a special item in the array to avoid schema errors
    const enrichedItems = [
      ...items,
      {
        id: 'ORDER_META',
        type: 'metadata',
        metodo_envio,
        metodo_pago,
        direccion,
        shipping_cost: shipping_cost || 0,
        whatsapp
      }
    ]

    // 2. Insert order
    const { data: newOrder, error } = await supabaseAdmin
      .from('pedidos')
      .insert({
        tienda_id,
        codigo,
        cliente_nombre,
        items: enrichedItems,
        total,
        estado: 'pendiente'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, pedido: newOrder })
  } catch (err) {
    capturarError(err, {
      modulo: 'Checkout',
      tiendaId: body?.tienda_id,
      extra: {
        endpoint: 'POST /api/pedidos',
        cliente: body?.cliente_nombre,
        total: body?.total,
      }
    })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
