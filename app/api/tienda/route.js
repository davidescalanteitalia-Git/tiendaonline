import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function getUserId(req) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.replace('Bearer ', '')
  const supabase = getSupabaseAdmin()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null
  return user.id
}

export async function GET(req) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('tiendas')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) { return NextResponse.json({ error: err.message }, { status: 500 }) }
}

export async function PATCH(req) {
  try {
    const userId = await getUserId(req)
    if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const updates = await req.json()
    const supabase = getSupabaseAdmin()

    // Si viene config_diseno_patch, lo fusionamos con el config_diseno existente
    if (updates.config_diseno_patch) {
      const { data: current } = await supabase
        .from('tiendas')
        .select('config_diseno')
        .eq('user_id', userId)
        .single()

      updates.config_diseno = {
        ...(current?.config_diseno || {}),
        ...updates.config_diseno_patch,
      }
      delete updates.config_diseno_patch
    }
    
    const { data, error } = await supabase
      .from('tiendas')
      .update(updates)
      .eq('user_id', userId)
      .select()

    if (error) throw error
    return NextResponse.json(data[0])
  } catch (err) { return NextResponse.json({ error: err.message }, { status: 500 }) }
}
