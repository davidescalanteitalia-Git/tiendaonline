import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const searchParams = req.nextUrl.searchParams
    const subdominio = searchParams.get('subdominio')

    if (!subdominio) {
      return NextResponse.json({ error: 'Missing subdominio output' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data: existingSub, error } = await supabaseAdmin
      .from('tiendas')
      .select('id')
      .eq('subdominio', subdominio)
      .maybeSingle()

    if (error) {
      console.error('Error checking subdomain:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Si existsSub tiene un ID, no está disponible (false). Si es nulo, está disponible (true).
    const isAvailable = !existingSub
    return NextResponse.json({ available: isAvailable })

  } catch (err) {
    return NextResponse.json({ error: 'unexpected', message: err.message }, { status: 500 })
  }
}
