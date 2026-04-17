import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req) {
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

    const { data: clientes, error } = await supabaseAdmin
      .from('clientes')
      .select('*')
      .eq('tienda_id', tienda.id)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(clientes)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')
    const supabaseAdmin = getSupabaseAdmin()

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    const { data: tienda } = await supabaseAdmin.from('tiendas').select('id').eq('user_id', user.id).single()

    const body = await req.json()
    const { id, abono } = body // Si se envía ID y abono, es un registro de pago

    if (id && abono !== undefined) {
      // Registrar abono a cuenta corriente
      // Verificamos tienda_id para evitar que un dueño modifique clientes de otra tienda
      const { data: cliente } = await supabaseAdmin
        .from('clientes')
        .select('*')
        .eq('id', id)
        .eq('tienda_id', tienda.id)
        .single()
      if (!cliente) throw new Error('Cliente no encontrado o no pertenece a esta tienda')

      const nuevaDeuda = Math.max(0, cliente.deuda_actual - parseFloat(abono))

      const { data: actualizado, error } = await supabaseAdmin
        .from('clientes')
        .update({ deuda_actual: nuevaDeuda })
        .eq('id', id)
        .eq('tienda_id', tienda.id)
        .select()
        .single()
        
      if (error) throw error
      return NextResponse.json({ success: true, cliente: actualizado })
    }
    
    // Si no es un abono, asume creación de cliente
    const { data: nuevo, error } = await supabaseAdmin
      .from('clientes')
      .insert({
        tienda_id: tienda.id,
        nombre: body.nombre,
        telefono: body.telefono || null,
        email: body.email || null,
      })
      .select()
      .single()
      
    if (error) throw error
    return NextResponse.json({ success: true, cliente: nuevo })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
