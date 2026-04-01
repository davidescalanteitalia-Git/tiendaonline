export default function DashboardPage() {
  const C = {
    green: '#059669', white: '#ffffff', text: '#0f172a', textMuted: '#64748b', grayBorder: '#e2e8f0', greenBg: '#f0fdf4'
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: C.text, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
        Bentornato, Mario 👋
      </h1>
      <p style={{ color: C.textMuted, fontSize: '1rem', marginBottom: '32px' }}>
        Ecco un riepilogo della tua bottega oggi.
      </p>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: 'Visite (Oggi)', value: '124', icon: '👀', bg: '#eff6ff' },
          { label: 'Ordini Ricevuti', value: '12', icon: '📱', bg: '#f0fdf4' },
          { label: 'Prodotti Attivi', value: '45', icon: '📦', bg: '#fffbeb' },
        ].map((stat, i) => (
          <div key={i} style={{ background: C.white, borderRadius: '16px', padding: '24px', border: `1px solid ${C.grayBorder}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '16px' }}>
              {stat.icon}
            </div>
            <div style={{ color: C.textMuted, fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>{stat.label}</div>
            <div style={{ color: C.text, fontSize: '2rem', fontWeight: 900 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Setup */}
      <div style={{ background: C.white, borderRadius: '20px', padding: '32px', border: `1px solid ${C.grayBorder}`, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 24px', color: C.text }}>Prossimi passi</h2>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '20px', borderBottom: `1px solid ${C.grayBorder}`, marginBottom: '20px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: '0.9rem' }}>✓</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: C.text, marginBottom: '4px' }}>Crea il tuo account</div>
            <div style={{ fontSize: '0.9rem', color: C.textMuted }}>Hai registrato la tua bottega con successo. TiendaOnline è pronta.</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${C.grayBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: '0.9rem', fontWeight: 600 }}>2</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: C.text, marginBottom: '6px' }}>Aggiungi il tuo primo prodotto</div>
            <div style={{ fontSize: '0.9rem', color: C.textMuted, marginBottom: '16px' }}>Carica una foto, scrivi un titolo e dai un prezzo al tuo piatto o prodotto.</div>
            <button style={{ background: C.text, color: C.white, border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              + Nuovo Prodotto
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
