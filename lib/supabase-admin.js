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
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return _client
}
