import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { notFound } from 'next/navigation'
import StoreClient from '../../../components/StoreClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { domain } = params
  try {
    const supabase = getSupabaseAdmin()
    const { data: tienda } = await supabase
      .from('tiendas')
      .select('nombre, descripcion, emoji, subdominio')
      .eq('subdominio', domain)
      .single()

    if (!tienda) return {}

    const nombre = tienda.nombre || 'Tienda Online'
    const descripcion = tienda.descripcion || `Catálogo y pedidos online de ${nombre}`
    const ogImageUrl = `https://tiendaonline.it/api/og/${domain}`

    return {
      title: nombre,
      description: descripcion,
      openGraph: {
        title: nombre,
        description: descripcion,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${nombre} — Tienda Online`,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: nombre,
        description: descripcion,
        images: [ogImageUrl],
      },
    }
  } catch {
    return {}
  }
}

async function getStoreData(domain) {
  try {
    const supabase = getSupabaseAdmin()
    
    // 1. Fetch Tienda
    const { data: tienda, error: tiendaError } = await supabase
      .from('tiendas')
      .select('*')
      .eq('subdominio', domain)
      .single()

    if (tiendaError || !tienda) {
      console.error('Store not found or error:', tiendaError)
      return null
    }

    // 2. Fetch Categories
    const { data: categorias } = await supabase
      .from('categorias')
      .select('*')
      .eq('tienda_id', tienda.id)
      .order('orden', { ascending: true })

    // 3. Fetch Products
    const { data: productos } = await supabase
      .from('productos')
      .select('*')
      .eq('tienda_id', tienda.id)
      .eq('estado', 'activo')
      .order('orden', { ascending: true })

    return { tienda, categorias: categorias || [], productos: productos || [] }
  } catch (err) {
    console.error('Error in getStoreData:', err)
    return null
  }
}

export default async function StoreFrontPage({ params }) {
  const { domain } = params;
  const data = await getStoreData(domain)

  if (!data) {
    return notFound()
  }

  const { tienda, categorias, productos } = data
  const config = tienda.config_diseno || {}

  // 0. Check if Published
  if (config.publicado === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 p-10 text-center">
           <div className="text-6xl mb-6">🏪</div>
           <h1 className="text-2xl font-black text-slate-800 mb-4">{tienda.nombre}</h1>
           <div className="h-1 w-20 bg-slate-200 mx-auto mb-6 rounded-full"></div>
           <p className="text-slate-500 font-medium">Esta tienda está en mantenimiento por ahora. ¡Vuelve pronto!</p>
           <p className="text-xs text-slate-400 mt-10">Desarrollado por TIENDAONLINE</p>
        </div>
      </div>
    )
  }

  const C = {
    primary: config.color_principal || tienda.color_principal || '#2563EB',
    white: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    grayBg: '#f8fafc',
    grayBorder: '#e2e8f0',
  }

  // Filtrar productos sin stock si es necesario
  const stockBehavior = config.mostrar_sin_stock || 'normal'
  let filteredProducts = productos
  if (stockBehavior === 'ocultar') {
    filteredProducts = productos.filter(p => (p.stock || 0) > 0)
  }

  // Agrupar productos por categoría
  const groupedProducts = categorias.map(cat => ({
    ...cat,
    items: filteredProducts.filter(p => p.categoria_id === cat.id)
  })).filter(cat => cat.items.length > 0)

  // Productos sin categoría
  const uncategorized = filteredProducts.filter(p => !p.categoria_id)

  return (
    <div style={{ backgroundColor: C.grayBg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

      {/* Banner de la Tienda — solo si está configurado */}
      {config.banner_url && (
        <div className="w-full h-32 md:h-48 overflow-hidden">
          <img src={config.banner_url} className="w-full h-full object-cover" alt="Banner" />
        </div>
      )}

      {/* El navbar con logo, búsqueda y carrito está dentro de StoreClient */}
      <StoreClient
        tienda={tienda}
        groupedProducts={groupedProducts}
        uncategorized={uncategorized}
        C={C}
        config={config}
      />
    </div>
  )
}
