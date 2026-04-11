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

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) throw new Error('Unauthorized')

    const { data: tienda } = await supabaseAdmin
      .from('tiendas')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!tienda) throw new Error('No store found')

    // Get all orders that are completed/paid
    const { data: pedidos, error } = await supabaseAdmin
      .from('pedidos')
      .select('*')
      .eq('tienda_id', tienda.id)
      // En un flujo real habría que filtrar fechas o solo completados
      // .eq('estado', 'confirmado') 

    if (error) throw error

    // Generate metrics
    let ventasTotales = 0
    let costoTotal = 0
    let fiadoTotal = 0
    
    // Top products
    const itemsMap = {}

    pedidos.forEach(pedido => {
       // Calcular métricas
       if (pedido.estado !== 'cancelado') {
         ventasTotales += parseFloat(pedido.total || 0)
         
         const meta = pedido.items.find(i => i.id === 'ORDER_META')
         if (meta && meta.metodo_pago === 'fiado') {
            fiadoTotal += parseFloat(pedido.total || 0)
         }

         pedido.items.forEach(item => {
           if (item.id !== 'ORDER_META') {
              const qty = item.quantity || 1
              const itemCosto = parseFloat(item.costo || 0) * qty
              costoTotal += itemCosto
              
              if (!itemsMap[item.id]) {
                 itemsMap[item.id] = { nombre: item.nombre, qty: 0, ingresos: 0, emoji: item.emoji }
              }
              itemsMap[item.id].qty += qty
              itemsMap[item.id].ingresos += (parseFloat(item.precio || item.price || 0) * qty)
           }
         })
       }
    })

    const topProductos = Object.values(itemsMap).sort((a,b) => b.qty - a.qty).slice(0, 5)

    const utilidadNeta = ventasTotales - costoTotal
    const margen = ventasTotales > 0 ? (utilidadNeta / ventasTotales) * 100 : 0

    return NextResponse.json({
       ventasTotales,
       costoTotal,
       utilidadNeta,
       margen,
       fiadoTotal,
       topProductos,
       totalPedidos: pedidos.filter(p => p.estado !== 'cancelado').length
    })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
