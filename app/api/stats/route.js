import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY

    // Si no hay variables de entorno configuradas, devolver 0
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ total: 0 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

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
