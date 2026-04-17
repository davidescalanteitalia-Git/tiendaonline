import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Ruta pública — usa cliente anónimo (no service role)
// Solo expone el conteo de tiendas activas para la landing page.
function getSupabaseAnon() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export async function GET() {
  try {
    const supabase = getSupabaseAnon()

    const { count, error } = await supabase
      .from('tiendas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'activo')

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ total: 0 })
    }

    return NextResponse.json({ total: count || 0 })
  } catch (err) {
    console.error('Stats API error:', err)
    return NextResponse.json({ total: 0 })
  }
}
