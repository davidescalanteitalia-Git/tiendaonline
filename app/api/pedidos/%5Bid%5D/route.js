import { getSupabaseAdmin } from '../../../../lib/supabase-admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PATCH(req, { params }) {
  try {
    const { id } = params
    const { estado } = await req.json()
    
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseAdmin = getSupabaseAdmin()

    // 1. Verify user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    // 2. Verify order ownership
    // We check if the order's tienda belongs to the current user
    const { data: order } = await supabaseAdmin
      .from('pedidos')
      .select('tienda_id')
      .eq('id', id)
      .single()

    if (!order) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    const { data: tienda } = await supabaseAdmin
      .from('tiendas')
      .select('id')
      .eq('id', order.tienda_id)
      .eq('user_id', user.id)
      .single()

    if (!tienda) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    // 3. Update status
    const { data: updatedOrder, error } = await supabaseAdmin
      .from('pedidos')
      .update({ estado })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, pedido: updatedOrder })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
