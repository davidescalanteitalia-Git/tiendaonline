'use client'

import { useState } from 'react'

export default function StoreClient({ tienda, groupedProducts, uncategorized, C }) {
  const [cart, setCart] = useState([])

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)

  const handleCheckout = () => {
    if (cart.length === 0) return

    const message = `*Nuovo Ordine da TIENDAONLINE*%0A%0A` +
      cart.map(item => `- ${item.quantity}x ${item.nombre} (€${item.price.toFixed(2)})`).join('%0A') +
      `%0A%0A*Totale: €${total.toFixed(2)}*%0A%0A_Inviato da: ${tienda.nombre}_`

    const whatsappUrl = `https://wa.me/${tienda.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <>
      {/* Categorías y Productos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
        
        {groupedProducts.map((cat) => (
          <div key={cat.id}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: C.text, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '4px', height: '1.2rem', background: C.green, borderRadius: '2px' }}></span>
              {cat.nombre}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cat.items.map((p) => (
                <ProductCard key={p.id} product={p} C={C} onAdd={() => addToCart(p)} />
              ))}
            </div>
          </div>
        ))}

        {uncategorized.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: C.text, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '4px', height: '1.2rem', background: C.green, borderRadius: '2px' }}></span>
              Altro
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {uncategorized.map((p) => (
                <ProductCard key={p.id} product={p} C={C} onAdd={() => addToCart(p)} />
              ))}
            </div>
          </div>
        )}

        {groupedProducts.length === 0 && uncategorized.length === 0 && (
           <div style={{ padding: '60px 20px', textAlign: 'center', color: C.textMuted }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
              <p style={{ fontWeight: 600 }}>Tornate a trovarci presto!</p>
              <p style={{ fontSize: '0.9rem' }}>Stiamo preparando i nuovi prodotti.</p>
           </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div 
          onClick={handleCheckout}
          style={{
            position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)', maxWidth: '560px',
            background: C.green, color: C.white, borderRadius: '18px', padding: '18px 24px',
            fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 12px 30px rgba(5, 150, 105, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            cursor: 'pointer', zIndex: 100, transition: 'all 0.2s', border: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '10px' }}>
                {totalItems}
             </div>
             <span>Invia ordine su WhatsApp</span>
          </div>
          <span>€{total.toFixed(2)}</span>
        </div>
      )}
    </>
  )
}

function ProductCard({ product, C, onAdd }) {
  return (
    <div style={{ 
      background: C.white, 
      borderRadius: '20px', 
      padding: '16px', 
      boxShadow: '0 2px 12px rgba(0,0,0,0.03)', 
      display: 'flex', 
      gap: '16px', 
      textAlign: 'left',
      border: `1px solid ${C.grayBorder}`,
    }}>
       <div style={{ 
         width: '85px', height: '85px', borderRadius: '14px', background: C.grayBg, 
         display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
         flexShrink: 0,
         overflow: 'hidden'
       }}>
         {product.imagen_url ? (
           <img src={product.imagen_url} alt={product.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
         ) : (
           product.emoji || '📦'
         )}
       </div>
       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
         <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: C.text }}>{product.nombre}</h3>
              <span style={{ fontWeight: 800, color: C.green, fontSize: '1.05rem' }}>€{parseFloat(product.price || product.precio).toFixed(2)}</span>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: '0.88rem', color: C.textMuted, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {product.descripcion}
            </p>
         </div>
         <button 
           onClick={onAdd}
           style={{ 
            background: '#ecfdf5', color: C.green, border: `1px solid #d1fae5`, 
            borderRadius: '12px', padding: '8px 20px', fontSize: '0.9rem', fontWeight: 700,
            cursor: 'pointer', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '6px'
          }}
         >
           <span>+</span> Aggiungi
         </button>
       </div>
    </div>
  )
}
