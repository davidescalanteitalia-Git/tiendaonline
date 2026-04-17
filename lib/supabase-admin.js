import { createClient } from '@supabase/supabase-js'

let _client = null

/**
 * Devuelve el cliente Supabase con service role key.
 * Se inicializa solo la primera vez (lazy singleton).
 * Usar siempre esta función en rutas API server-side.
 */
export function getSupabaseAdmin() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_KEY || 'placeholder_service_key',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return _client
}

/**
 * Verifica si el request tiene un token JWT válido de Supabase
 * y pertenece al email de administrador.
 */
export async function verifyAdmin(req) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }
  const token = authHeader.replace('Bearer ', '')
  const admin = getSupabaseAdmin()
  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user) return false
  
  return user.email === (process.env.ADMIN_EMAIL || 'davidescalanteitalia@gmail.com')
}
