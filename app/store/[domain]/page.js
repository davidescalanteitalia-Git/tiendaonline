export default function StoreFrontPage({ params }) {
  // En Next.js 15+ los params son asincronos si se leen, pero en mock static los dejamos visuales en este scaffold.
  const domain = params?.domain || 'Demo';

  const C = {
    green: '#059669',
    white: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    grayBg: '#f8fafc',
    grayBorder: '#e2e8f0'
  }

  const products = [
    { title: 'Pizza Margherita', desc: 'Pomodoro San Marzano, Mozzarella di Bufala, Basilico fresco.', price: '8.00', emoji: '🍕' },
    { title: 'Pizza Diavola', desc: 'Salami piccante, Pomodoro, Mozzarella fior di latte.', price: '9.50', emoji: '🌶️' },
    { title: 'Tiramisù Artigianale', desc: 'Savoiardi, mascarpone, caffè espresso.', price: '5.00', emoji: '🍰' },
  ]

  return (
    <div style={{ backgroundColor: C.grayBg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Portada Móvil */}
      <div style={{ width: '100%', height: '180px', background: `linear-gradient(135deg, ${C.green} 0%, #10b981 100%)`, position: 'relative' }}>
        <div style={{ 
          position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', 
          width: '80px', height: '80px', borderRadius: '50%', background: C.white, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          🏪
        </div>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '60px 20px 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: C.text, margin: '0 0 8px' }}>
          {domain.toUpperCase()}
        </h1>
        <p style={{ color: C.textMuted, fontSize: '0.95rem', marginBottom: '32px' }}>
          Sfoglia il nostro menù e ordina comodamente su WhatsApp.
        </p>

        {/* Lista de Productos Estilo Linktree / Menú Móvil */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {products.map((p, i) => (
            <div key={i} style={{ 
              background: C.white, borderRadius: '16px', padding: '20px', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', gap: '16px', textAlign: 'left'
            }}>
               <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: C.grayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                 {p.emoji}
               </div>
               <div style={{ flex: 1 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                   <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: C.text }}>{p.title}</h3>
                   <span style={{ fontWeight: 800, color: C.green }}>€{p.price}</span>
                 </div>
                 <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: C.textMuted, lineHeight: 1.4 }}>{p.desc}</p>
                 <button style={{ 
                   background: '#f0fdf4', color: C.green, border: `1px solid #d1fae5`, 
                   borderRadius: '50px', padding: '6px 16px', fontSize: '0.8rem', fontWeight: 700,
                   cursor: 'pointer'
                 }}>
                   + Aggiungi
                 </button>
               </div>
            </div>
          ))}
        </div>

        {/* Floating Cart Button */}
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          background: C.green, color: C.white, borderRadius: '50px', padding: '16px 32px',
          fontWeight: 800, fontSize: '1.05rem', boxShadow: '0 8px 20px rgba(5, 150, 105, 0.4)',
          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', zIndex: 100
        }}>
          <span>🛒 Checkout (0)</span>
        </div>

      </div>
    </div>
  )
}
