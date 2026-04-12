'use client'

import { useEffect, useState } from 'react'
import { useLang } from '../../../components/LanguageProvider'
import { DICTIONARY } from '../../../lib/dictionaries'

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

export default function UsuariosPage() {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['it']

  const [usuarios, setUsuarios] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filtro,   setFiltro]   = useState('todos')
  const [confirm,  setConfirm]  = useState(null) // { type, user }

  const cargar = () => {
    setLoading(true)
    fetch('/api/admin/usuarios')
      .then(r => r.json())
      .then(d => { setUsuarios(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const toggleEstado = async (user) => {
    const nuevoEstado = user.tienda?.estado === 'activo' ? 'bloqueado' : 'activo'
    await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tiendaId: user.tienda?.id, estado: nuevoEstado }),
    })
    cargar()
    setConfirm(null)
  }

  const eliminarUsuario = async (user) => {
    await fetch('/api/admin/usuarios', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, tiendaId: user.tienda?.id }),
    })
    cargar()
    setConfirm(null)
  }

  const filtrados = usuarios.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      u.email?.toLowerCase().includes(q) ||
      u.tienda?.nombre?.toLowerCase().includes(q) ||
      u.tienda?.subdominio?.toLowerCase().includes(q)
    const matchFiltro =
      filtro === 'todos'     ? true :
      filtro === 'activos'   ? u.tienda?.estado === 'activo' :
      filtro === 'bloqueados'? u.tienda?.estado === 'bloqueado' :
      filtro === 'sin-tienda'? !u.tienda : true
    return matchSearch && matchFiltro
  })

  return (
    <div style={{ color: C.text, maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 6px' }}>👥 {dict.gestioneUtenti}</h1>
        <p style={{ color: C.textMuted, margin: 0, fontSize: '0.9rem' }}>
          {usuarios.length} {dict.utentiRegistrati}
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder={dict.cercaNegoziPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '240px', padding: '10px 14px', background: C.card,
            border: `1px solid ${C.border}`, borderRadius: '10px', color: C.text,
            fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {['todos', 'activos', 'bloqueados', 'sin-tienda'].map(f => {
            const label = 
              f === 'todos' ? dict.filtroTutte : 
              f === 'activos' ? dict.filtroAttive : 
              f === 'bloqueados' ? dict.filtroBloccate : 
              dict.sinTienda
            return (
              <button key={f} onClick={() => setFiltro(f)} style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: filtro === f ? C.green : C.card,
                color: filtro === f ? C.white : C.textMuted,
                fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit',
                textTransform: 'capitalize',
              }}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden' }}>
        {/* Header tabla */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1.5fr', padding: '12px 20px', borderBottom: `1px solid ${C.border}`, background: C.bg }}>
          {[dict.tabEmail, dict.tabNegozio, dict.tabSotto, dict.tabWA, dict.tabStato, dict.tabAzioni].map(h => (
            <div key={h} style={{ color: C.textMuted, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: C.textMuted }}>{dict.caricando}...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: C.textMuted }}>{dict.nessunNegozioTrovato}</div>
        ) : (
          filtrados.map((u, i) => (
            <div key={u.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 1.5fr',
              padding: '14px 20px', borderBottom: i < filtrados.length - 1 ? `1px solid ${C.border}` : 'none',
              alignItems: 'center',
            }}>
              {/* Email */}
              <div>
                <div style={{ color: C.text, fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                <div style={{ color: C.textMuted, fontSize: '0.72rem' }}>{new Date(u.created_at).toLocaleDateString(lang === 'it' ? 'it-IT' : 'es-ES')}</div>
              </div>

              {/* Nombre tienda */}
              <div style={{ color: u.tienda ? C.text : C.textMuted, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {u.tienda?.nombre || '—'}
              </div>

              {/* Subdominio */}
              <div>
                {u.tienda ? (
                  <a href={`https://${u.tienda.subdominio}.tiendaonline.it`} target="_blank" rel="noreferrer"
                    style={{ color: C.green, fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>
                    {u.tienda.subdominio} ↗
                  </a>
                ) : <span style={{ color: C.textMuted, fontSize: '0.8rem' }}>—</span>}
              </div>

              {/* WhatsApp */}
              <div style={{ color: C.textMuted, fontSize: '0.8rem' }}>{u.tienda?.whatsapp || '—'}</div>

              {/* Estado */}
              <div>
                {u.tienda ? (
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '100px',
                    background: u.tienda.estado === 'activo' ? '#05966922' : '#ef444422',
                    color: u.tienda.estado === 'activo' ? C.green : C.red,
                  }}>
                    {u.tienda.estado === 'activo' ? dict.adminAttivo : dict.adminBloccato}
                  </span>
                ) : (
                  <span style={{ color: C.textMuted, fontSize: '0.75rem' }}>{dict.sinTienda}</span>
                )}
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {u.tienda && (
                  <button onClick={() => setConfirm({ type: 'toggle', user: u })} style={{
                    padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: u.tienda.estado === 'activo' ? '#f59e0b22' : '#05966922',
                    color: u.tienda.estado === 'activo' ? C.amber : C.green,
                    fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit',
                  }}>
                    {u.tienda.estado === 'activo' ? '🔒 ' + dict.blocca : '✅ ' + dict.attiva}
                  </button>
                )}
                <button onClick={() => setConfirm({ type: 'delete', user: u })} style={{
                  padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: '#ef444422', color: C.red,
                  fontSize: '0.75rem', fontWeight: 700, fontFamily: 'inherit',
                }}>
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmación */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ margin: '0 0 12px', color: C.text, fontSize: '1.1rem' }}>
              {confirm.type === 'delete' ? '🗑️ ' + dict.eliminaNegoziConfirm : confirm.user.tienda?.estado === 'activo' ? '🔒 ' + dict.blocca + ' ' + dict.perfilTienda : '✅ ' + dict.attiva + ' ' + dict.perfilTienda}
            </h3>
            <p style={{ color: C.textMuted, margin: '0 0 24px', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {confirm.type === 'delete'
                ? dict.eliminaNegoziConfirm.replace('?', '') + ` "${confirm.user.email}"?`
                : `${confirm.user.tienda?.estado === 'activo' ? dict.blocca : dict.attiva} "${confirm.user.email}"?`
              }
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirm(null)} style={{ padding: '9px 18px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.textMuted, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                {dict.annulla}
              </button>
              <button
                onClick={() => confirm.type === 'delete' ? eliminarUsuario(confirm.user) : toggleEstado(confirm.user)}
                style={{
                  padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
                  background: confirm.type === 'delete' ? C.red : confirm.user.tienda?.estado === 'activo' ? C.amber : C.green,
                  color: C.white,
                }}
              >
                {dict.confirmar}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
