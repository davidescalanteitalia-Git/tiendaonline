import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function getUserId(req) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.replace('Bearer ', '')
  const supabase = getSupabaseAdmin()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user.id
}

async function getTiendaId(userId) {
  const supabase = getSupabaseAdmin()
  const { data: tienda } = await supabase.from('tiendas').select('id').eq('user_id', userId).single()
  return tienda?.id || null
}

export async function GET(req) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const tiendaId = await getTiendaId(userId)
    if (!tiendaId) return NextResponse.json([])

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('compras')
      .select('*, productos(nombre)')
      .eq('tienda_id', tiendaId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) { return NextResponse.json({ error: err.message }, { status: 500 }) }
}

export async function POST(req) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const tiendaId = await getTiendaId(userId)
    if (!tiendaId) throw new Error('Store not found')

    const { producto_id, cantidad, costo, fecha_vencimiento } = await req.json()
    const supabase = getSupabaseAdmin()

    // 1. Record the purchase
    const { data: compra, error: errorCompra } = await supabase
      .from('compras')
      .insert({
        tienda_id: tiendaId,
        producto_id,
        cantidad: parseInt(cantidad),
        costo: parseFloat(costo),
        fecha_vencimiento: fecha_vencimiento || null
      })
      .select()
      .single()

    if (errorCompra) throw errorCompra

    // 2. Update product stock and (optionally) update expiry date if it's sooner or provided
    // Fetch current product to get current stock
    const { data: producto } = await supabase
      .from('productos')
      .select('stock')
      .eq('id', producto_id)
      .single()

    const nuevoStock = (producto?.stock || 0) + parseInt(cantidad)

    const { error: errorUpdate } = await supabase
      .from('productos')
      .update({ 
        stock: nuevoStock,
        fecha_vencimiento: fecha_vencimiento || null // We update it to the latest purchase expiry
      })
      .eq('id', producto_id)

    if (errorUpdate) throw errorUpdate

    return NextResponse.json(compra)
  } catch (err) { return NextResponse.json({ error: err.message }, { status: 500 }) }
}
