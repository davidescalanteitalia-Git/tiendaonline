import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { notFound } from 'next/navigation'
import StoreClient from '../../../components/StoreClient'

export const dynamic = 'force-dynamic'

async function getStoreData(domain) {
  const supabase = getSupabaseAdmin()
  
  // 1. Fetch Tienda
  const { data: tienda } = await supabase
    .from('tiendas')
    .select('*')
    .eq('subdominio', domain)
    .single()

  if (!tienda) return null

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
}

export default async function StoreFrontPage({ params }) {
  const { domain } = params;
  const data = await getStoreData(domain)

  if (!data) {
    return notFound()
  }

  const { tienda, categorias, productos } = data

  const C = {
    green: '#059669',
    white: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    grayBg: '#f8fafc',
    grayBorder: '#e2e8f0',
    primary: '#2563eb'
  }

  // Agrupar productos por categoría
  const groupedProducts = categorias.map(cat => ({
    ...cat,
    items: productos.filter(p => p.categoria_id === cat.id)
  })).filter(cat => cat.items.length > 0)

  // Productos sin categoría
  const uncategorized = productos.filter(p => !p.categoria_id)

  return (
    <div style={{ backgroundColor: C.grayBg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Portada Móvil Premium */}
      <div style={{ 
        width: '100%', 
        height: '240px', 
        background: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200') center/cover`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Logo Circular */}
        <div style={{ 
          position: 'absolute', bottom: '-45px', left: '50%', transform: 'translateX(-50%)', 
          width: '94px', height: '94px', borderRadius: '50%', background: C.white, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          border: `4px solid ${C.white}`,
          zIndex: 10
        }}>
          {tienda.emoji || '🏪'}
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '65px 20px 120px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: C.text, margin: '0 0 10px', letterSpacing: '-0.8px' }}>
          {tienda.nombre}
        </h1>
        <p style={{ color: C.textMuted, fontSize: '1.05rem', marginBottom: '40px', lineHeight: 1.6, maxWidth: '450px', margin: '0 auto 40px' }}>
          {tienda.descripcion || 'Benvenuti nel nostro negozio online! Sfoglia i prodotti e ordina via WhatsApp.'}
        </p>

        {/* Client Component handles the list and cart logic */}
        <StoreClient 
          tienda={tienda} 
          groupedProducts={groupedProducts} 
          uncategorized={uncategorized} 
          C={C} 
        />
      </div>
    </div>
  )
}
