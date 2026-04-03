import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { NextResponse } from 'next/server'

// GET — listar todas las tiendas
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('tiendas')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH — actualizar estado de tienda
export async function PATCH(req) {
  try {
    const { id, estado } = await req.json()
    const { error } = await supabaseAdmin
      .from('tiendas')
      .update({ estado })
      .eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — eliminar tienda
export async function DELETE(req) {
  try {
    const { id } = await req.json()
    const { error } = await supabaseAdmin
      .from('tiendas')
      .delete()
      .eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
