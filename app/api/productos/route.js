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
      .from('productos')
      .select('*')
      .eq('tienda_id', tiendaId)
      .order('orden', { ascending: true })

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

    const body = await req.json()
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('productos')
      .insert({ ...body, tienda_id: tiendaId })
      .select()

    if (error) throw error
    return NextResponse.json(data[0])
  } catch (err) { return NextResponse.json({ error: err.message }, { status: 500 }) }
}

export async function PATCH(req) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const tiendaId = await getTiendaId(userId)
    if (!tiendaId) throw new Error('unauthorized')

    const { id, ...updates } = await req.json()
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .eq('tienda_id', tiendaId)
      .select()

    if (error) throw error
    return NextResponse.json(data[0])
  } catch (err) { return NextResponse.json({ error: err.message }, { status: 500 }) }
}

export async function DELETE(req) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const tiendaId = await getTiendaId(userId)
    if (!tiendaId) throw new Error('unauthorized')

    const { id } = await req.json()
    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('productos').delete().eq('id', id).eq('tienda_id', tiendaId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) { return NextResponse.json({ error: err.message }, { status: 500 }) }
}
