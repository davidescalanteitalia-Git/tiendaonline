import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

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
