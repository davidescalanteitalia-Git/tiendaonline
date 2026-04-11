import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseAdmin = getSupabaseAdmin()

    // 1. Get user and store
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) throw new Error('Unauthorized')

    const { data: tienda } = await supabaseAdmin
      .from('tiendas')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!tienda) throw new Error('No store found')

    const { clienteNombre, items, total, estado } = await req.json()

    // 2. Reduce Stock
    const cartItems = items.filter(i => i.id !== 'ORDER_META')
    for (const item of cartItems) {
      // Find current stock
      const { data: prodData } = await supabaseAdmin
        .from('productos')
        .select('stock')
        .eq('id', item.id)
        .single()
        
      if (prodData) {
        const newStock = Math.max(0, prodData.stock - item.quantity)
        await supabaseAdmin
          .from('productos')
          .update({ stock: newStock })
          .eq('id', item.id)
      }
    }

    // 3. Generate POS code
    const { count } = await supabaseAdmin
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .eq('tienda_id', tienda.id)

    const orderNumber = (count || 0) + 101
    const codigo = `#POS-${orderNumber}`

    // 4. Save as Order
    const { data: newOrder, error } = await supabaseAdmin
      .from('pedidos')
      .insert({
        tienda_id: tienda.id,
        codigo,
        cliente_nombre: clienteNombre || 'Caja Local',
        items: items,
        total,
        estado: estado || 'confirmado'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, pedido: newOrder })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
