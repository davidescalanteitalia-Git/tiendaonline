'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const C = {
  green:      '#1a5c2a',
  greenLight: '#2d8a45',
  greenBg:    '#f0fdf4',
  greenBorder:'#d1fae5',
  white:      '#ffffff',
  text:       '#0f172a',
  textMuted:  '#64748b',
  grayBorder: '#e2e8f0',
  grayBg:     '#f8fafc',
}

export default function DashboardPage() {
  const [tienda,  setTienda]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const json = await res.json()
        setTienda(json.tienda || null)
      }
      setLoading(false)
    }
    load()
  }, [])

  const storeUrl = tienda?.subdominio
    ? `https://${tienda.subdominio}.tiendaonline.it`
    : null

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', color: C.textMuted, fontSize: '0.95rem' }}>
        Caricamento...
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '960px' }}>

      {/* Greeting */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 900, color: C.text, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          Benvenuto{tienda?.nombre ? `, ${tienda.nombre}` : ''} 👋
        </h1>
        <p style={{ color: C.textMuted, fontSize: '0.93rem', margin: 0 }}>
          Ecco un riepilogo della tua bottega oggi.
        </p>
      </div>

      {/* Store URL Banner */}
      {storeUrl && (
        <div style={{
          background: C.greenBg, border: `1px solid ${C.greenBorder}`,
          borderRadius: '14px', padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '10px', marginBottom: '28px',
        }}>
          <div>
            <div style={{ fontWeight: 700, color: C.green, fontSize: '0.8rem', marginBottom: '2px' }}>
              🛍️ La tua bottega è online
            </div>
            <div style={{ color: C.text, fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>
              {tienda.subdominio}.tiendaonline.it
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(storeUrl)
                alert('Link copiato!')
              }}
              style={{
                background: C.white, color: C.green,
                border: `1px solid ${C.greenBorder}`, padding: '7px 13px',
                borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              📋 Copia
            </button>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: C.green, color: C.white,
                padding: '7px 14px', borderRadius: '8px',
                fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none',
                boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
              }}
            >
              🌍 Apri
            </a>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '36px' }}>
        {[
          { label: 'Visite (Oggi)',    value: '—', icon: '👀', bg: '#eff6ff' },
          { label: 'Ordini Ricevuti', value: '—', icon: '📱', bg: '#f0fdf4' },
          { label: 'Prodotti Attivi', value: '—', icon: '📦', bg: '#fffbeb' },
        ].map((stat, i) => (
          <div key={i} style={{ background: C.white, borderRadius: '14px', padding: '20px', border: `1px solid ${C.grayBorder}` }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '12px' }}>
              {stat.icon}
            </div>
            <div style={{ color: C.textMuted, fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px' }}>{stat.label}</div>
            <div style={{ color: C.text, fontSize: '1.7rem', fontWeight: 900 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Next steps */}
      <div style={{ background: C.white, borderRadius: '16px', padding: '26px', border: `1px solid ${C.grayBorder}`, marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 20px', color: C.text }}>Prossimi passi</h2>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: '16px', borderBottom: `1px solid ${C.grayBorder}`, marginBottom: '16px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: '0.8rem', flexShrink: 0 }}>✓</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: C.text, marginBottom: '3px' }}>Crea il tuo account</div>
            <div style={{ fontSize: '0.85rem', color: C.textMuted }}>Hai registrato la tua bottega con successo. TIENDAONLINE è pronta.</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', border: `2px solid ${C.grayBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: '0.82rem', fontWeight: 600, flexShrink: 0 }}>2</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: C.text, marginBottom: '3px' }}>Aggiungi il tuo primo prodotto</div>
            <div style={{ fontSize: '0.85rem', color: C.textMuted, marginBottom: '14px' }}>Carica una foto, scrivi un titolo e dai un prezzo al tuo prodotto.</div>
            <a
              href="/dashboard/productos"
              style={{
                display: 'inline-block', background: C.text, color: C.white,
                padding: '8px 18px', borderRadius: '8px',
                fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
              }}
            >
              + Nuovo Prodotto
            </a>
          </div>
        </div>
      </div>

      {/* WhatsApp share */}
      {storeUrl && (
        <div style={{ background: C.green, borderRadius: '16px', padding: '24px', color: C.white }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>
            📲 Condividi la tua bottega su WhatsApp
          </div>
          <div style={{ opacity: 0.85, fontSize: '0.86rem', marginBottom: '14px' }}>
            Invia questo link ai tuoi clienti e inizia a ricevere ordini subito.
          </div>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Ordina dalla mia bottega online: ${storeUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: C.white, color: C.green,
              padding: '9px 18px', borderRadius: '8px',
              fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none',
              boxShadow: '0 2px 0 rgba(0,0,0,0.15)',
            }}
          >
            💬 Condividi su WhatsApp
          </a>
        </div>
      )}

    </div>
  )
}
