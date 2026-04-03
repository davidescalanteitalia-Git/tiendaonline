import { supabaseAdmin } from '../../../../lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Total usuarios
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
    const totalUsuarios = usersData?.users?.length || 0

    // Nuevos hoy
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const nuevosHoy = usersData?.users?.filter(u =>
      new Date(u.created_at) >= hoy
    ).length || 0

    // Esta semana
    const semana = new Date()
    semana.setDate(semana.getDate() - 7)
    const nuevosSemana = usersData?.users?.filter(u =>
      new Date(u.created_at) >= semana
    ).length || 0

    // Total tiendas
    const { count: totalTiendas } = await supabaseAdmin
      .from('tiendas')
      .select('*', { count: 'exact', head: true })

    // Tiendas activas
    const { count: tiendasActivas } = await supabaseAdmin
      .from('tiendas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'activo')

    // Tiendas bloqueadas
    const { count: tiendasBloqueadas } = await supabaseAdmin
      .from('tiendas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'bloqueado')

    // Últimos 7 registros
    const { data: recientes } = await supabaseAdmin
      .from('tiendas')
      .select('nombre, subdominio, created_at, estado')
      .order('created_at', { ascending: false })
      .limit(7)

    // Crecimiento por día (últimos 7 días)
    const crecimiento = []
    for (let i = 6; i >= 0; i--) {
      const dia = new Date()
      dia.setDate(dia.getDate() - i)
      dia.setHours(0, 0, 0, 0)
      const siguiente = new Date(dia)
      siguiente.setDate(siguiente.getDate() + 1)
      const count = usersData?.users?.filter(u => {
        const d = new Date(u.created_at)
        return d >= dia && d < siguiente
      }).length || 0
      crecimiento.push({
        dia: dia.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        usuarios: count,
      })
    }

    return NextResponse.json({
      totalUsuarios,
      nuevosHoy,
      nuevosSemana,
      totalTiendas: totalTiendas || 0,
      tiendasActivas: tiendasActivas || 0,
      tiendasBloqueadas: tiendasBloqueadas || 0,
      recientes: recientes || [],
      crecimiento,
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
