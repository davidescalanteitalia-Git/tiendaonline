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

    // Verify the JWT and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    // Fetch the user's tienda using admin (bypasses RLS)
    const { data: tienda } = await supabaseAdmin
      .from('tiendas')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ tienda: tienda || null, user: { id: user.id, email: user.email } })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
