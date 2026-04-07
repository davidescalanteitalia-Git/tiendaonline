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

export async function GET(req) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const supabase = getSupabaseAdmin()
    const { data: tienda } = await supabase.from('tiendas').select('id').eq('user_id', userId).single()
    if (!tienda) return NextResponse.json([])
    const { data, error } = await supabase.from('categorias').select('*').eq('tienda_id', tienda.id).order('orden', { ascending: true })
    if (error) throw error
    return NextResponse.json(data)
  } catch (err) { return NextResponse.json({ error: err.message }, { status: 500 }) }
}

export async function POST(req) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const { nombre, orden } = await req.json()
    const supabase = getSupabaseAdmin()
    const { data: tienda } = await supabase.from('tiendas').select('id').eq('user_id', userId).single()
    if (!tienda) throw new Error('Store not found')
    const { data, error } = await supabase.from('categorias').insert({ tienda_id: tienda.id, nombre, orden: orden || 0 }).select()
    if (error) throw error
    return NextResponse.json(data[0])
  } catch (err) { return NextResponse.json({ error: err.message }, { status: 500 }) }
}

// DELETE y PATCH manejados por ID
export async function DELETE(req) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const { id } = await req.json()
    const supabase = getSupabaseAdmin()
    // Verificar que la categoría sea del usuario
    const { data: tienda } = await supabase.from('tiendas').select('id').eq('user_id', userId).single()
    if (!tienda) throw new Error('unauthorized')
    const { error } = await supabase.from('categorias').delete().eq('id', id).eq('tienda_id', tienda.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) { return NextResponse.json({ error: err.message }, { status: 500 }) }
}

export async function PATCH(req) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const { id, nombre, orden } = await req.json()
    const supabase = getSupabaseAdmin()
    const { data: tienda } = await supabase.from('tiendas').select('id').eq('user_id', userId).single()
    if (!tienda) throw new Error('unauthorized')
    const { data, error } = await supabase.from('categorias').update({ nombre, orden }).eq('id', id).eq('tienda_id', tienda.id).select()
    if (error) throw error
    return NextResponse.json(data[0])
  } catch (err) { return NextResponse.json({ error: err.message }, { status: 500 }) }
}
