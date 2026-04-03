import { createClient } from '@supabase/supabase-js'

let _client = null

function getClient() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
  }
  return _client
}

// Proxy lazy: el cliente real se crea solo cuando se accede a una propiedad,
// no en tiempo de import (evita error de build en Next.js)
export const supabaseAdmin = new Proxy({}, {
  get(_, prop) {
    return getClient()[prop]
  }
})
