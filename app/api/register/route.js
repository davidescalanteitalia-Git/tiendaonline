import { getSupabaseAdmin } from '../../../lib/supabase-admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const { nombre, subdominio, whatsapp, email, password, sector, tipo_vendedor } = await req.json()
    const supabaseAdmin = getSupabaseAdmin()

    // 1. Verificar que el subdominio no esté en uso
    const { data: existingSub } = await supabaseAdmin
      .from('tiendas')
      .select('id')
      .eq('subdominio', subdominio)
      .maybeSingle()

    if (existingSub) {
      return NextResponse.json({ error: 'subdomain_taken' }, { status: 400 })
    }

    // 2. Verificar que el WhatsApp no esté en uso
    const { data: existingWA } = await supabaseAdmin
      .from('tiendas')
      .select('id')
      .eq('whatsapp', whatsapp)
      .maybeSingle()

    if (existingWA) {
      return NextResponse.json({ error: 'whatsapp_taken' }, { status: 400 })
    }

    // 3. Crear usuario en Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (userError) {
      const msg = userError.message?.toLowerCase() || ''
      if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('duplicate')) {
        return NextResponse.json({ error: 'email_taken' }, { status: 400 })
      }
      return NextResponse.json({ error: 'user_error', message: userError.message }, { status: 400 })
    }

    // 4. Insertar tienda en la base de datos con columnas en español SaaS
    const { error: tiendaError } = await supabaseAdmin
      .from('tiendas')
      .insert({
        nombre: nombre,
        subdominio: subdominio,
        whatsapp: whatsapp,
        user_id: userData.user.id,
        estado:  'activo',
        config_diseno: {
          publicado: true,
          color_principal: '#2563EB',
          version_catalogo: 'nuevo',
          modo_exhibicion: 'cuadricula',
          mostrar_sin_stock: 'normal',
          sector: sector || null,
          tipo_vendedor: tipo_vendedor || null
        }
      })

    if (tiendaError) {
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
      const msg = tiendaError.message?.toLowerCase() || ''
      if (msg.includes('duplicate') || tiendaError.code === '23505') {
        return NextResponse.json({ error: 'subdomain_taken' }, { status: 400 })
      }
      return NextResponse.json({ error: 'store_error', message: tiendaError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })

  } catch (err) {
    return NextResponse.json({ error: 'unexpected', message: err.message }, { status: 500 })
  }
}
