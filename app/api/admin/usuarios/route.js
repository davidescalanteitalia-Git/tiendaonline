import { getSupabaseAdmin, verifyAdmin } from '../../../../lib/supabase-admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET — listar todos los usuarios con su tienda
export async function GET(req) {
  try {
    if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const supabaseAdmin = getSupabaseAdmin()
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
    const users = usersData?.users || []

    const { data: tiendas } = await supabaseAdmin
      .from('tiendas')
      .select('*')
      .order('created_at', { ascending: false })

    const resultado = users.map(u => {
      const tienda = tiendas?.find(t => t.user_id === u.id)
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        tienda: tienda || null,
      }
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return NextResponse.json(resultado)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH — bloquear/activar usuario
export async function PATCH(req) {
  try {
    if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const supabaseAdmin = getSupabaseAdmin()
    const { tiendaId, estado } = await req.json()
    const { error } = await supabaseAdmin
      .from('tiendas')
      .update({ estado })
      .eq('id', tiendaId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE — eliminar usuario
export async function DELETE(req) {
  try {
    if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    const supabaseAdmin = getSupabaseAdmin()
    const { userId, tiendaId } = await req.json()
    if (tiendaId) {
      await supabaseAdmin.from('tiendas').delete().eq('id', tiendaId)
    }
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
