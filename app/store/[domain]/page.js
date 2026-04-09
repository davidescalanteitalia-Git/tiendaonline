import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { notFound } from 'next/navigation'
import StoreClient from '../../../components/StoreClient'

export const dynamic = 'force-dynamic'

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
      
      {/* Banner de la Tienda */}
      {config.banner_url && (
         <div className="w-full h-32 md:h-48 overflow-hidden">
            <img src={config.banner_url} className="w-full h-full object-cover" alt="Store Banner" />
         </div>
      )}

      {/* Header Fijo con Logo de Tienda */}
      <div style={{ 
        position: 'sticky', top: 0, zIndex: 40,
        backgroundColor: C.white, borderBottom: `1px solid ${C.grayBorder}`, 
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <div style={{ 
          width: '48px', height: '48px', borderRadius: '50%', background: C.grayBg, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
          border: `2px solid ${C.grayBorder}`, flexShrink: 0, overflow: 'hidden'
        }}>
          {tienda.logo_url ? <img src={tienda.logo_url} className="w-full h-full object-cover" alt="Logo" /> : (tienda.emoji || '🏪')}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: C.text, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {tienda.nombre}
          </h1>
          {tienda.descripcion && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: C.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tienda.descripcion}
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Client Component handles the Sidebar, Grid logic, and Cart */}
        <StoreClient 
          tienda={tienda} 
          groupedProducts={groupedProducts} 
          uncategorized={uncategorized} 
          C={C}
          config={config}
        />
      </div>
    </div>
  )
}
