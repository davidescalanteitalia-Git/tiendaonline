import { getSupabaseAdmin } from '../../../../lib/supabase-admin'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

// PATCH /api/productos/reorder
// Body: { items: [{ id: "uuid", orden: 0 }, { id: "uuid", orden: 1 }, ...] }
export async function PATCH(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseAdmin = getSupabaseAdmin()

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) throw new Error('Unauthorized')

    // Verificar que la tienda existe y pertenece al usuario
    const { data: tienda } = await supabaseAdmin
      .from('tiendas')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!tienda) throw new Error('No store found')

    const { items } = await req.json()
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items array required' }, { status: 400 })
    }

    // Actualizar el campo orden de cada producto en paralelo
    // Verificamos también que los productos pertenecen a la tienda del usuario
    const updates = items.map(({ id, orden }) =>
      supabaseAdmin
        .from('productos')
        .update({ orden })
        .eq('id', id)
        .eq('tienda_id', tienda.id)
    )

    await Promise.all(updates)

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
