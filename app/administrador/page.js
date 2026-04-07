'use client'

import { useEffect, useState } from 'react'

import { C as ThemeC } from '../../lib/theme'

const C = {
  bg:       ThemeC.grayBg,
  card:     ThemeC.white,
  green:    ThemeC.green,
  white:    ThemeC.white,
  text:     ThemeC.text,
  textMuted:ThemeC.textMuted,
  border:   ThemeC.grayBorder,
  amber:    ThemeC.amber,
  red:      ThemeC.error,
  blue:     ThemeC.blue,
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        {sub && <span style={{ fontSize: '0.72rem', background: color + '22', color, padding: '2px 10px', borderRadius: '100px', fontWeight: 700 }}>{sub}</span>}
      </div>
      <div style={{ color: C.textMuted, fontSize: '0.82rem', fontWeight: 600 }}>{label}</div>
      <div style={{ color: C.text, fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>{value}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: C.textMuted }}>Cargando estadísticas...</div>
    </div>
  )

  return (
    <div style={{ color: C.text, maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          Panel de Control 🚀
        </h1>
        <p style={{ color: C.textMuted, margin: 0, fontSize: '0.9rem' }}>
          Vista general del sistema en tiempo real
        </p>
      </div>

      {/* Stats principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard icon="👥" label="Total Usuarios"     value={stats?.totalUsuarios  ?? 0} sub="Total"     color={C.blue}  />
        <StatCard icon="✨" label="Nuevos Hoy"         value={stats?.nuevosHoy      ?? 0} sub="Hoy"       color={C.green} />
        <StatCard icon="📅" label="Esta Semana"        value={stats?.nuevosSemana   ?? 0} sub="7 días"    color={C.amber} />
        <StatCard icon="🏪" label="Tiendas Activas"    value={stats?.tiendasActivas ?? 0} sub="Activas"   color={C.green} />
        <StatCard icon="🔒" label="Tiendas Bloqueadas" value={stats?.tiendasBloqueadas ?? 0} sub="Bloqueadas" color={C.red} />
        <StatCard icon="📦" label="Total Tiendas"      value={stats?.totalTiendas   ?? 0} sub="Total"     color={C.blue}  />
      </div>

      {/* Gráfica de crecimiento */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>

        {/* Barras crecimiento */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700, color: C.text }}>
            📈 Nuevos usuarios (últimos 7 días)
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
            {(stats?.crecimiento || []).map((d, i) => {
              const max = Math.max(...(stats?.crecimiento || []).map(x => x.usuarios), 1)
              const h = (d.usuarios / max) * 100
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ color: C.green, fontSize: '0.7rem', fontWeight: 700 }}>{d.usuarios > 0 ? d.usuarios : ''}</span>
                  <div style={{ width: '100%', height: `${Math.max(h, 4)}%`, background: d.usuarios > 0 ? C.green : C.border, borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} />
                  <span style={{ color: C.textMuted, fontSize: '0.62rem', textAlign: 'center' }}>{d.dia}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Estado tiendas */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700, color: C.text }}>
            🏪 Estado de tiendas
          </h3>
          {[
            { label: 'Activas',    val: stats?.tiendasActivas    || 0, color: C.green, total: stats?.totalTiendas || 1 },
            { label: 'Bloqueadas', val: stats?.tiendasBloqueadas || 0, color: C.red,   total: stats?.totalTiendas || 1 },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: C.textMuted, fontSize: '0.85rem' }}>{item.label}</span>
                <span style={{ color: C.text, fontWeight: 700, fontSize: '0.85rem' }}>{item.val}</span>
              </div>
              <div style={{ height: '8px', background: C.border, borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(item.val / item.total) * 100}%`, background: item.color, borderRadius: '4px', transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: '20px', padding: '12px', background: C.bg, borderRadius: '10px' }}>
            <div style={{ color: C.textMuted, fontSize: '0.75rem', marginBottom: '4px' }}>Tasa de activación</div>
            <div style={{ color: C.green, fontWeight: 900, fontSize: '1.4rem' }}>
              {stats?.totalTiendas ? Math.round((stats.tiendasActivas / stats.totalTiendas) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: C.text }}>
            🕐 Registros recientes
          </h3>
          <a href="/administrador/tiendas" style={{ color: C.green, fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>
            Ver todas →
          </a>
        </div>

        {(stats?.recientes || []).length === 0 ? (
          <p style={{ color: C.textMuted, textAlign: 'center', padding: '20px 0' }}>No hay tiendas registradas aún.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {(stats?.recientes || []).map((t, i) => (
              <div key={i} style={{
                display:       'flex',
                alignItems:    'center',
                justifyContent:'space-between',
                padding:       '12px 0',
                borderBottom:  i < stats.recientes.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🏪</div>
                  <div>
                    <div style={{ color: C.text, fontWeight: 600, fontSize: '0.88rem' }}>{t.nombre}</div>
                    <div style={{ color: C.textMuted, fontSize: '0.75rem' }}>{t.subdominio}.tiendaonline.it</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '100px',
                    background: t.estado === 'activo' ? '#05966922' : '#ef444422',
                    color: t.estado === 'activo' ? C.green : C.red,
                  }}>
                    {t.estado === 'activo' ? '● Activo' : '● Bloqueado'}
                  </span>
                  <span style={{ color: C.textMuted, fontSize: '0.75rem' }}>
                    {new Date(t.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
