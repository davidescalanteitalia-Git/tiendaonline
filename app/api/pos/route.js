import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { NextResponse } from 'next/server'
import { capturarError } from '../../../lib/sentry'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  let tiendaId = null
  let userId = null
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
    userId = user.id

    const { data: tienda } = await supabaseAdmin
      .from('tiendas')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!tienda) throw new Error('No store found')
    tiendaId = tienda.id

    const { clienteNombre, items, total, estado, subtotal, descuento, fiado, metodoPago } = await req.json()

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

    // Extraer metodo_pago del ORDER_META si no viene como campo directo
    const metaItem = items.find(i => i.id === 'ORDER_META')
    const metaPago = metodoPago || metaItem?.metodo_pago || 'efectivo'

    // 4. Save as Order
    const { data: newOrder, error } = await supabaseAdmin
      .from('pedidos')
      .insert({
        tienda_id: tienda.id,
        codigo,
        cliente_nombre: clienteNombre || 'Caja Local',
        items: items,
        total,
        estado: estado || 'confirmado',
        metodo_pago: metaPago,
        metodo_envio: 'retiro',
        tipo_venta: 'POS'
      })
      .select()
      .single()

    if (error) throw error

    // 5. Gestor de Clientes (CRM) y Fiado (Cuentas Corrientes)
    const nomCli = clienteNombre || 'Caja Local'
    // Solo registramos como cliente si nos dieron un nombre real
    if (nomCli !== 'Caja Local' && nomCli.trim() !== '') {
      const { data: bClient } = await supabaseAdmin
        .from('clientes')
        .select('*')
        .eq('tienda_id', tienda.id)
        .ilike('nombre', nomCli.trim())
        .maybeSingle()

      const newDebt = fiado ? parseFloat(total) : 0

      if (bClient) {
        await supabaseAdmin
          .from('clientes')
          .update({
            deuda_actual: parseFloat(bClient.deuda_actual || 0) + newDebt,
            total_gastado: parseFloat(bClient.total_gastado || 0) + parseFloat(total)
          })
          .eq('id', bClient.id)
      } else {
        await supabaseAdmin
          .from('clientes')
          .insert({
            tienda_id: tienda.id,
            nombre: nomCli.trim(),
            deuda_actual: newDebt,
            total_gastado: parseFloat(total)
          })
      }
    }

    return NextResponse.json({ success: true, pedido: newOrder })
  } catch (err) {
    capturarError(err, {
      modulo: 'POS',
      tiendaId,
      userId,
      extra: { endpoint: 'POST /api/pos' }
    })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
