'use client'

import { useEffect, useState } from 'react'

const C = {
  card:     '#1e293b',
  green:    '#059669',
  white:    '#ffffff',
  text:     '#f1f5f9',
  textMuted:'#94a3b8',
  border:   '#334155',
  red:      '#ef4444',
  amber:    '#f59e0b',
  blue:     '#3b82f6',
  bg:       '#0f172a',
}

export default function TiendasPage() {
  const [tiendas,  setTiendas]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filtro,   setFiltro]   = useState('todas')
  const [confirm,  setConfirm]  = useState(null)

  const cargar = () => {
    setLoading(true)
    fetch('/api/admin/tiendas')
      .then(r => r.json())
      .then(d => { setTiendas(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const toggleEstado = async (tienda) => {
    const nuevoEstado = tienda.estado === 'activo' ? 'bloqueado' : 'activo'
    await fetch('/api/admin/tiendas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tienda.id, estado: nuevoEstado }),
    })
    cargar()
    setConfirm(null)
  }

  const eliminar = async (tienda) => {
    await fetch('/api/admin/tiendas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tienda.id }),
    })
    cargar()
    setConfirm(null)
  }

  const filtradas = tiendas.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      t.nombre?.toLowerCase().includes(q) ||
      t.subdominio?.toLowerCase().includes(q) ||
      t.whatsapp?.includes(q)
    const matchFiltro =
      filtro === 'todas'     ? true :
      filtro === 'activas'   ? t.estado === 'activo' :
      filtro === 'bloqueadas'? t.estado === 'bloqueado' : true
    return matchSearch && matchFiltro
  })

  return (
    <div style={{ color: C.text, maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 6px' }}>🏪 Gestión de Tiendas</h1>
        <p style={{ color: C.textMuted, margin: 0, fontSize: '0.9rem' }}>
          {tiendas.length} tiendas registradas · {tiendas.filter(t => t.estado === 'activo').length} activas
        </p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, subdominio, WhatsApp..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '240px', padding: '10px 14px', background: C.card,
            border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text,
            fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {['todas', 'activas', 'bloqueadas'].map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{
              padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: filtro === f ? C.green : C.card,
              color: filtro === f ? C.white : C.textMuted,
              fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit',
              textTransform: 'capitalize',
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: C.textMuted }}>Cargando tiendas...</div>
      ) : filtradas.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: C.textMuted }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏪</div>
          No se encontraron tiendas.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtradas.map((t) => (
            <div key={t.id} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px',
              padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              {/* Header card */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                    🏪
                  </div>
                  <div>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: '0.95rem' }}>{t.nombre}</div>
                    <a href={`http://${t.subdominio}.tiendaonline.it`} target="_blank" rel="noreferrer"
                      style={{ color: C.green, fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600 }}>
                      {t.subdominio}.tiendaonline.it ↗
                    </a>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', flexShrink: 0,
                  background: t.estado === 'activo' ? '#05966922' : '#ef444422',
                  color: t.estado === 'activo' ? C.green : C.red,
                }}>
                  {t.estado === 'activo' ? '● Activo' : '● Bloqueado'}
                </span>
              </div>

              {/* Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem' }}>📱</span>
                  <span style={{ color: C.textMuted, fontSize: '0.82rem' }}>{t.whatsapp}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem' }}>📅</span>
                  <span style={{ color: C.textMuted, fontSize: '0.82rem' }}>
                    Registrada {new Date(t.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => setConfirm({ type: 'toggle', tienda: t })} style={{
                  flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: t.estado === 'activo' ? '#f59e0b22' : '#05966922',
                  color: t.estado === 'activo' ? C.amber : C.green,
                  fontSize: '0.8rem', fontWeight: 700, fontFamily: 'inherit',
                }}>
                  {t.estado === 'activo' ? '🔒 Bloquear' : '✅ Activar'}
                </button>
                <button onClick={() => setConfirm({ type: 'delete', tienda: t })} style={{
                  padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: '#ef444422', color: C.red,
                  fontSize: '0.8rem', fontFamily: 'inherit',
                }}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal confirmación */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ margin: '0 0 12px', color: C.text, fontSize: '1.1rem' }}>
              {confirm.type === 'delete' ? '🗑️ Eliminar tienda' : confirm.tienda.estado === 'activo' ? '🔒 Bloquear tienda' : '✅ Activar tienda'}
            </h3>
            <p style={{ color: C.textMuted, margin: '0 0 24px', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {confirm.type === 'delete'
                ? `¿Eliminar permanentemente "${confirm.tienda.nombre}"? Esta acción no se puede deshacer.`
                : `¿${confirm.tienda.estado === 'activo' ? 'Bloquear' : 'Activar'} la tienda "${confirm.tienda.nombre}"?`
              }
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirm(null)} style={{ padding: '9px 18px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.textMuted, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                Cancelar
              </button>
              <button
                onClick={() => confirm.type === 'delete' ? eliminar(confirm.tienda) : toggleEstado(confirm.tienda)}
                style={{
                  padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
                  background: confirm.type === 'delete' ? C.red : confirm.tienda.estado === 'activo' ? C.amber : C.green,
                  color: C.white,
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
