import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { NextResponse } from 'next/server'
import { capturarError } from '../../../lib/sentry'
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

    // --- Leer parámetros de filtro de fecha ---
    const { searchParams } = new URL(req.url)
    const desde = searchParams.get('desde')   // ISO string, ej: "2026-04-01"
    const hasta = searchParams.get('hasta')   // ISO string, ej: "2026-04-30"

    // Construir query base
    let query = supabaseAdmin
      .from('pedidos')
      .select('*')
      .eq('tienda_id', tienda.id)

    if (desde) {
      query = query.gte('created_at', new Date(desde).toISOString())
    }
    if (hasta) {
      // Hasta el final del día indicado
      const hastaFin = new Date(hasta)
      hastaFin.setHours(23, 59, 59, 999)
      query = query.lte('created_at', hastaFin.toISOString())
    }

    const { data: pedidos, error } = await query.order('created_at', { ascending: true })
    if (error) throw error

    // Generate metrics
    let ventasTotales = 0
    let costoTotal = 0
    let fiadoTotal = 0

    // Top products
    const itemsMap = {}

    // Ventas por día para el gráfico
    const ventasPorDia = {}

    pedidos.forEach(pedido => {
      if (pedido.estado !== 'cancelado') {
        ventasTotales += parseFloat(pedido.total || 0)

        // Agrupar por día para gráfico
        const fechaDia = pedido.created_at?.slice(0, 10) // "YYYY-MM-DD"
        if (fechaDia) {
          ventasPorDia[fechaDia] = (ventasPorDia[fechaDia] || 0) + parseFloat(pedido.total || 0)
        }

        const meta = pedido.items?.find(i => i.id === 'ORDER_META')
        if (meta && meta.metodo_pago === 'fiado') {
          fiadoTotal += parseFloat(pedido.total || 0)
        }

        pedido.items?.forEach(item => {
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

    const topProductos = Object.values(itemsMap).sort((a, b) => b.qty - a.qty).slice(0, 5)

    // Convertir ventasPorDia a array ordenado
    const graficoDias = Object.entries(ventasPorDia)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, total]) => ({ fecha, total: parseFloat(total.toFixed(2)) }))

    const utilidadNeta = ventasTotales - costoTotal
    const margen = ventasTotales > 0 ? (utilidadNeta / ventasTotales) * 100 : 0

    return NextResponse.json({
      ventasTotales,
      costoTotal,
      utilidadNeta,
      margen,
      fiadoTotal,
      topProductos,
      graficoDias,
      totalPedidos: pedidos.filter(p => p.estado !== 'cancelado').length
    })

  } catch (err) {
    capturarError(err, { modulo: 'Reportes', extra: { endpoint: 'GET /api/reportes' } })
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
