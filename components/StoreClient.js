'use client'

import { useState } from 'react'
import { useLang } from './LanguageProvider'
import { DICTIONARY } from '../lib/dictionaries'

export default function StoreClient({ tienda, groupedProducts, uncategorized, C }) {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']
  
  const [cart, setCart] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleCheckoutClick = () => {
    if (cart.length === 0) return
    setIsModalOpen(true)
  }

  const processOrder = async (e) => {
    e.preventDefault()
    if (!customerName.trim() || isSubmitting) return
    
    setIsSubmitting(true)

    try {
      // 1. Save to database
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tienda_id: tienda.id,
          cliente_nombre: customerName,
          items: cart,
          total: total
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // 2. Open WhatsApp with the generated code
        const pedido = data.pedido
        const message = `*${dict.ordini.toUpperCase()} ${pedido.codigo}*%0A` +
          `*Cliente:* ${customerName}%0A%0A` +
          cart.map(item => `- ${item.quantity}x ${item.nombre} (€${item.price.toFixed(2)})`).join('%0A') +
          `%0A%0A*${dict.total}: €${total.toFixed(2)}*%0A%0A_Inviato da: ${tienda.nombre}_`

        const whatsappUrl = `https://wa.me/${tienda.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}?text=${message}`
        window.open(whatsappUrl, '_blank')
        
        // 3. Reset
        setIsModalOpen(false)
        setCart([])
        setCustomerName('')
      }
    } catch (err) {
      console.error('Error saving order:', err)
      alert('Error saving order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
                <ProductCard key={p.id} product={p} C={C} onAdd={() => addToCart(p)} dict={dict} />
              ))}
            </div>
          </div>
        ))}

        {uncategorized.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: C.text, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '4px', height: '1.2rem', background: C.green, borderRadius: '2px' }}></span>
              {dict.sinCategoria || 'Altro'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {uncategorized.map((p) => (
                <ProductCard key={p.id} product={p} C={C} onAdd={() => addToCart(p)} dict={dict} />
              ))}
            </div>
          </div>
        )}

        {groupedProducts.length === 0 && uncategorized.length === 0 && (
           <div style={{ padding: '60px 20px', textAlign: 'center', color: C.textMuted }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
              <p style={{ fontWeight: 600 }}>{dict.sinProductosDesc || 'Tornate a trovarci presto!'}</p>
           </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div 
          onClick={handleCheckoutClick}
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
             <span>{dict.continuarWA || 'Invia ordine su WhatsApp'}</span>
          </div>
          <span>€{total.toFixed(2)}</span>
        </div>
      )}

      {/* Name Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: C.white, width: '100%', maxWidth: '400px',
            borderRadius: '24px', padding: '32px', textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s ease-out'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.text, marginBottom: '8px' }}>
              {dict.dinosTuNombre || 'Dinos tu nombre'}
            </h2>
            <p style={{ color: C.textMuted, fontSize: '0.95rem', marginBottom: '24px' }}>
              {dict.introducirNombreDesc || 'Por favor, introduce tu nombre para completar el pedido.'}
            </p>
            
            <form onSubmit={processOrder}>
              <input 
                autoFocus
                type="text"
                placeholder={dict.nombreCliente || 'Nombre...'}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px',
                  border: `2px solid ${C.grayBorder}`, background: C.grayBg,
                  fontSize: '1rem', outline: 'none', marginBottom: '20px',
                  textAlign: 'center', fontWeight: 600, color: C.text
                }}
              />
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1, padding: '16px', borderRadius: '12px', border: 'none',
                    background: '#f1f5f9', color: '#64748b', fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {dict.cerrar || 'Chiudi'}
                </button>
                <button 
                  disabled={isSubmitting}
                  style={{
                    flex: 2, padding: '16px', borderRadius: '12px', border: 'none',
                    background: C.green, color: C.white, fontWeight: 700,
                    cursor: 'pointer', transition: 'opacity 0.2s',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? (dict.caricamento || '...') : (dict.continuarWA || 'Continua')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

function ProductCard({ product, C, onAdd, dict }) {
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
           <span>+</span> {dict.añadirProducto?.split('+')[1]?.trim() || 'Aggiungi'}
         </button>
       </div>
    </div>
  )
}
