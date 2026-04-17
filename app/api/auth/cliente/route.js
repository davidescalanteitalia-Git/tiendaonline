import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../lib/supabase-admin'
import { checkRateLimit } from '../../../../lib/rate-limit'

// POST /api/auth/cliente — Registro de nuevo cliente
export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip, 5, 60000)) {
      return NextResponse.json({ error: 'rate_limit_exceeded', message: 'Demasiadas peticiones.' }, { status: 429 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()
    const { email, password, nombre, telefono, fecha_nacimiento, domain } = body

    // Validar dominio — evitar path traversal e inyección
    if (!domain || !/^[a-z0-9-]{1,30}$/.test(domain)) {
      return NextResponse.json({ error: 'Dominio inválido' }, { status: 400 })
    }

    // Email y contraseña son los únicos requisitos mínimos
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    // Obtener la tienda por subdominio
    const { data: tienda, error: tiendaError } = await supabaseAdmin
      .from('tiendas')
      .select('id, nombre')
      .eq('subdominio', domain)
      .single()

    if (tiendaError || !tienda) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 })
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Sin verificación de email — acceso inmediato
      user_metadata: {
        nombre: nombre || '',
        tienda_id: tienda.id,
        rol: 'cliente'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ error: 'Este email ya tiene una cuenta. Por favor inicia sesión.' }, { status: 409 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id

    // Crear o actualizar el registro en la tabla clientes
    // Primero verificamos si ya existe un cliente con ese email en esta tienda
    const { data: clienteExistente } = await supabaseAdmin
      .from('clientes')
      .select('id')
      .eq('tienda_id', tienda.id)
      .eq('email', email)
      .maybeSingle()

    if (clienteExistente) {
      // Vincular cuenta existente con el nuevo user_id
      await supabaseAdmin
        .from('clientes')
        .update({
          user_id: userId,
          nombre: nombre || clienteExistente.nombre,
          telefono: telefono || clienteExistente.telefono,
          fecha_nacimiento: fecha_nacimiento || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', clienteExistente.id)
    } else {
      // Crear nuevo registro de cliente
      await supabaseAdmin
        .from('clientes')
        .insert({
          tienda_id: tienda.id,
          user_id: userId,
          nombre: nombre || '',
          email,
          telefono: telefono || '',
          fecha_nacimiento: fecha_nacimiento || null,
          deuda_actual: 0,
          total_gastado: 0
        })
    }

    return NextResponse.json({
      success: true,
      message: '¡Cuenta creada con éxito! Ya puedes iniciar sesión.',
      userId
    })

  } catch (err) {
    console.error('Error en registro de cliente:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/auth/cliente — Actualizar datos del perfil del cliente
export async function PUT(request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    const { nombre, telefono, fecha_nacimiento } = await request.json()

    const { error } = await supabaseAdmin
      .from('clientes')
      .update({
        nombre: nombre || '',
        telefono: telefono || '',
        fecha_nacimiento: fecha_nacimiento || null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Error actualizando perfil:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE /api/auth/cliente — Eliminar cuenta (GDPR)
export async function DELETE(request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    // Anonimizar datos del cliente (no borramos pedidos, solo desvinculamos)
    await supabaseAdmin
      .from('clientes')
      .update({
        user_id: null,
        nombre: 'Cliente eliminado',
        email: null,
        telefono: null,
        fecha_nacimiento: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    // Eliminar usuario de Supabase Auth
    await supabaseAdmin.auth.admin.deleteUser(user.id)

    return NextResponse.json({ success: true, message: 'Cuenta eliminada correctamente.' })

  } catch (err) {
    console.error('Error eliminando cuenta:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
