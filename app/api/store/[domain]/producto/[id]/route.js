import { getSupabaseAdmin } from '../../../../../../lib/supabase-admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req, { params }) {
  try {
    const { domain, id } = params
    const supabase = getSupabaseAdmin()

    // 1. Get store by subdomain
    const { data: tienda, error: tiendaError } = await supabase
      .from('tiendas')
      .select('id, nombre, subdominio, config_diseno, color_principal, emoji, logo_url, whatsapp, descripcion, horario, esta_abierta')
      .eq('subdominio', domain)
      .single()

    if (tiendaError || !tienda) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // 2. Get the product (only active, belonging to this store)
    const { data: producto, error: productoError } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .eq('tienda_id', tienda.id)
      .eq('estado', 'activo')
      .single()

    if (productoError || !producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // 3. Get related products from same category (or random if no category)
    let relacionadosQuery = supabase
      .from('productos')
      .select('id, nombre, precio, stock, imagen_url, emoji, categoria_id, descripcion')
      .eq('tienda_id', tienda.id)
      .eq('estado', 'activo')
      .neq('id', id)
      .limit(8)

    if (producto.categoria_id) {
      relacionadosQuery = relacionadosQuery.eq('categoria_id', producto.categoria_id)
    }

    const { data: relacionados } = await relacionadosQuery

    // 4. Get category name if applicable
    let categoria = null
    if (producto.categoria_id) {
      const { data: cat } = await supabase
        .from('categorias')
        .select('id, nombre, emoji')
        .eq('id', producto.categoria_id)
        .single()
      categoria = cat
    }

    return NextResponse.json({
      tienda,
      producto,
      categoria,
      relacionados: relacionados || [],
    })
  } catch (err) {
    console.error('Error in GET /api/store/[domain]/producto/[id]:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
