'use client'

import { useState, useRef, useEffect } from 'react'
import { useLang } from './LanguageProvider'
import { DICTIONARY } from '../lib/dictionaries'

export default function StoreClient({ tienda, groupedProducts, uncategorized, C }) {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']
  
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessageOpen, setSuccessMessageOpen] = useState(false)
  
  const aceptarPedidos = tienda.aceptar_pedidos ?? true
  const enviarWhatsapp = tienda.enviar_whatsapp ?? true
  const modoCatalogo = tienda.modo_catalogo || 'cuadricula'
  const mensajePost = tienda.mensaje_post_pedido || 'Pronto nos pondremos en contacto para confirmar los detalles de tu compra. ¡Gracias por elegirnos!'
  const [activeCategory, setActiveCategory] = useState(groupedProducts[0]?.id || 'uncategorized')

  const addToCart = (product) => {
    if(!aceptarPedidos) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setIsCartOpen(true) // Opcional: abrir el carrito o mostrar feedback
  }

  const updateQuantity = (productId, delta) => {
    if(!aceptarPedidos) return;
    setCart((prev) => prev.map((item) => {
      if (item.id === productId) {
        const newQ = item.quantity + delta
        return newQ > 0 ? { ...item, quantity: newQ } : item
      }
      return item
    }))
  }

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)

  const scrollToCategory = (id) => {
    setActiveCategory(id)
    const element = document.getElementById(`category-${id}`)
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100 // offset header
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const processOrder = async (e) => {
    e.preventDefault()
    if (!customerName.trim() || isSubmitting) return
    setIsSubmitting(true)

    try {
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
        const pedido = data.pedido
        
        if (enviarWhatsapp && tienda.whatsapp) {
          const message = `*${dict.ordini.toUpperCase()} ${pedido.codigo}*%0A` +
            `*Cliente:* ${customerName}%0A%0A` +
            cart.map(item => `- ${item.quantity}x ${item.nombre} (€${item.price.toFixed(2)})`).join('%0A') +
            `%0A%0A*${dict.total}: €${total.toFixed(2)}*%0A%0A_Inviato da: ${tienda.nombre}_`

          const whatsappUrl = `https://wa.me/${tienda.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}?text=${message}`
          window.open(whatsappUrl, '_blank')
        }
        
        setIsModalOpen(false)
        setIsCartOpen(false)
        setCart([])
        setCustomerName('')
        
        // Show success message
        setSuccessMessageOpen(true)
      }
    } catch (err) {
      console.error('Error saving order:', err)
      alert('Error saving order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: '90px' }}>
      
      {/* Container Principal Responsive */}
      <div className="store-container">
        
        {/* Barra de Categorías (Sidebar en Desktop / Horizontal en Móvil) */}
        <div className="store-sidebar">
          <ul className="category-list">
            {groupedProducts.map((cat) => (
              <li 
                key={cat.id} 
                onClick={() => scrollToCategory(cat.id)}
                className={`category-item ${activeCategory === cat.id ? 'active' : ''}`}
                style={{ '--primary': C.primary }}
              >
                {cat.nombre}
              </li>
            ))}
            {uncategorized.length > 0 && (
              <li 
                onClick={() => scrollToCategory('uncategorized')}
                className={`category-item ${activeCategory === 'uncategorized' ? 'active' : ''}`}
                style={{ '--primary': C.primary }}
              >
                {dict.sinCategoria || 'Altro'}
              </li>
            )}
          </ul>
        </div>

        {/* Área de Productos (Grilla) */}
        <div className="store-content">
          {groupedProducts.map((cat) => (
            <div key={cat.id} id={`category-${cat.id}`} className="category-section">
              <h2 className="category-title" style={{ color: C.text }}>{cat.nombre}</h2>
              <div className={`product-grid ${modoCatalogo === 'lista' ? 'product-list' : 'product-grid-view'}`}>
                {cat.items.map((p) => (
                  <ProductCard key={p.id} product={p} C={C} dict={dict} onAdd={() => addToCart(p)} hideAddBtn={!aceptarPedidos} modo={modoCatalogo} />
                ))}
              </div>
            </div>
          ))}

          {uncategorized.length > 0 && (
            <div id={`category-uncategorized`} className="category-section">
              <h2 className="category-title" style={{ color: C.text }}>{dict.sinCategoria || 'Altro'}</h2>
              <div className={`product-grid ${modoCatalogo === 'lista' ? 'product-list' : 'product-grid-view'}`}>
                {uncategorized.map((p) => (
                  <ProductCard key={p.id} product={p} C={C} dict={dict} onAdd={() => addToCart(p)} hideAddBtn={!aceptarPedidos} modo={modoCatalogo} />
                ))}
              </div>
            </div>
          )}

          {groupedProducts.length === 0 && uncategorized.length === 0 && (
             <div className="empty-state" style={{ color: C.textMuted }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
                <p style={{ fontWeight: 600 }}>{dict.sinProductosDesc || 'Tornate a trovarci presto!'}</p>
             </div>
          )}
        </div>
      </div>

      {!aceptarPedidos && cart.length === 0 && (
         <div className="closed-banner" style={{ background: C.grayBorder, color: C.text }}>
            <span>No estamos aceptando pedidos temporalmente.</span>
         </div>
      )}

      {/* Floating Action Button for Cart (Mobile / Desktop) */}
      {cart.length > 0 && (
        <div 
          onClick={() => setIsCartOpen(true)}
          className="floating-cart-button"
          style={{ background: C.primary, color: C.white }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div className="cart-badge">
                {totalItems}
             </div>
             <span>{dict.verCarrito || 'Ver Carrito'}</span>
          </div>
          <span>€{total.toFixed(2)}</span>
        </div>
      )}

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer fade-in-right" onClick={(e) => e.stopPropagation()}>
            
            <div className="drawer-header">
              <h2 style={{ color: C.text }}>{dict.tuCarrito || 'Tu Pedido'}</h2>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>✖</button>
            </div>

            <div className="drawer-body">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.nombre}</h4>
                    <p style={{ color: C.primary }}>€{parseFloat(item.price || item.precio).toFixed(2)}</p>
                  </div>
                  <div className="cart-item-actions">
                    <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    <button onClick={() => removeFromCart(item.id)} className="remove-btn">🗑️</button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="empty-cart">{dict.carritoVacio || 'El carrito está vacío.'}</p>
              )}
            </div>

            <div className="drawer-footer">
              <div className="drawer-total">
                <span>{dict.total}</span>
                <span style={{ color: C.text }}>€{total.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => { setIsCartOpen(false); setIsModalOpen(true); }}
                className="checkout-btn"
                disabled={cart.length === 0}
                style={{ background: cart.length > 0 ? C.primary : C.grayBorder, color: cart.length > 0 ? C.white : C.textMuted }}
              >
                {dict.continuarWA || 'Invia ordine su WhatsApp'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Name Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content scale-in" style={{ background: C.white }}>
            <h2 style={{ color: C.text }}>{dict.dinosTuNombre || 'Dinos tu nombre'}</h2>
            <p style={{ color: C.textMuted }}>{dict.introducirNombreDesc || 'Por favor, introduce tu nombre para completar el pedido.'}</p>
            
            <form onSubmit={processOrder}>
              <input 
                autoFocus
                type="text"
                placeholder={dict.nombreCliente || 'Nombre...'}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="modal-input"
                style={{ borderColor: C.grayBorder, background: C.grayBg, color: C.text }}
              />
              
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="modal-btn-cancel">
                  {dict.cerrar || 'Chiudi'}
                </button>
                <button type="submit" disabled={isSubmitting} className="modal-btn-confirm" style={{ background: C.primary, color: C.white }}>
                  {isSubmitting ? (dict.caricamento || '...') : (dict.continuarWA || 'Continua')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successMessageOpen && (
        <div className="modal-overlay">
          <div className="modal-content scale-in" style={{ background: C.white, textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <h2 style={{ color: C.text, marginBottom: '8px' }}>¡Pedido enviado!</h2>
            <p style={{ color: C.textMuted, fontSize: '15px', lineHeight: '1.5' }}>{mensajePost}</p>
            
            <button 
              onClick={() => setSuccessMessageOpen(false)} 
              className="modal-btn-confirm" 
              style={{ background: C.primary, color: C.white, marginTop: '24px', width: '100%' }}
            >
              {dict.cerrar || 'Cerrar'}
            </button>
          </div>
        </div>
      )}

      {/* Global Scoped Styles via JSX (Kyte Format implementation) */}
      <style jsx global>{`
        .store-container {
          display: flex;
          flex-direction: column;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .store-sidebar {
          background: #fff;
          position: sticky;
          top: 81px; /* Just below header */
          z-index: 30;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .category-list {
          list-style: none;
          padding: 0 16px;
          margin: 0;
          display: flex;
          overflow-x: auto;
          gap: 20px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .category-list::-webkit-scrollbar { display: none; }

        .category-item {
          padding: 16px 4px;
          white-space: nowrap;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          font-size: 0.95rem;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }

        .category-item.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
          font-weight: 800;
        }

        .store-content {
          flex: 1;
          padding: 24px;
        }

        .category-section {
          margin-bottom: 48px;
        }

        .category-title {
          font-size: 1.5rem;
          font-weight: 900;
          margin: 0 0 20px 0;
        }

        .product-grid-view {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .product-list {
          display: flex;
          flex-direction: column;
        }

        .product-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        .product-card-list {
          flex-direction: row;
          border-radius: 0;
          box-shadow: none;
          border: none;
          border-bottom: 1px solid #e2e8f0;
          padding: 16px 0;
          gap: 16px;
        }

        .product-img-wrapper {
          width: 100%;
          aspect-ratio: 1 / 1;
          background: #f8fafc;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
        }

        .img-list-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          flex-shrink: 0;
          overflow: hidden;
        }

        .product-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-add-btn {
          position: absolute;
          bottom: -16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          transition: transform 0.2s;
          padding-bottom: 2px;
        }
        .product-add-btn:active { transform: scale(0.9); }

        .product-info {
          padding: 20px 16px 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-info-list {
          padding: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .product-name {
          font-weight: 800;
          font-size: 1rem;
          margin: 0 0 4px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-desc {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0 0 12px 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .product-price {
          font-weight: 900;
          font-size: 1.1rem;
        }

        .price-row-list {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-add-btn-list {
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 0.85rem;
          cursor: pointer;
        }

        /* Floating Cart */
        .floating-cart-button {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 40px);
          max-width: 560px;
          border-radius: 20px;
          padding: 18px 24px;
          font-weight: 800;
          font-size: 1.1rem;
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          z-index: 100;
          border: none;
        }

        .cart-badge {
          background: rgba(255,255,255,0.2);
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.95rem;
        }

        /* Drawer Overlay */
        .drawer-overlay {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          backdrop-filter: blur(4px);
        }

        .cart-drawer {
          width: 100%;
          max-width: 420px;
          height: 100%;
          background: #fff;
          display: flex;
          flex-direction: column;
          box-shadow: -10px 0 30px rgba(0,0,0,0.1);
        }

        .fade-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .drawer-header {
          padding: 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .drawer-header h2 { margin: 0; font-size: 1.5rem; font-weight: 900; }
        .close-btn { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 1rem; color: #64748b; cursor: pointer; }

        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          margin-bottom: 20px;
          border-bottom: 1px solid #f1f5f9;
        }
        .cart-item-info h4 { margin: 0 0 4px; font-weight: 800; color: #0f172a; }
        .cart-item-info p { margin: 0; font-weight: 900; }
        
        .cart-item-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          padding: 4px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .cart-item-actions button { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; width: 28px; height: 28px; font-weight: bold; cursor: pointer; color: #0f172a;}
        .cart-item-actions span { font-weight: 800; width: 16px; text-align: center; }
        .cart-item-actions .remove-btn { border: none; background: transparent; font-size: 1rem; width: auto; height: auto; padding: 4px; }

        .drawer-footer {
          padding: 24px;
          border-top: 1px solid #e2e8f0;
          background: #fff;
        }
        .drawer-total {
          display: flex;
          justify-content: space-between;
          font-size: 1.25rem;
          font-weight: 900;
          margin-bottom: 20px;
          color: #64748b;
        }
        .checkout-btn {
          width: 100%;
          padding: 18px;
          border-radius: 16px;
          border: none;
          font-size: 1.1rem;
          font-weight: 800;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .checkout-btn:active { opacity: 0.8; }

        .empty-cart { text-align: center; color: #64748b; margin-top: 40px; font-weight: 600; }

        /* Modal Overlays */
        .modal-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 20px;
        }
        .modal-content {
          width: 100%; max-width: 400px; border-radius: 24px; padding: 32px; text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        
        .modal-input {
          width: 100%; padding: 16px; border-radius: 12px; border: 2px solid;
          font-size: 1rem; outline: none; margin-bottom: 20px; text-align: center; font-weight: 600;
        }
        .modal-actions { display: flex; gap: 12px; }
        .modal-btn-cancel { flex: 1; padding: 16px; border-radius: 12px; border: none; background: #f1f5f9; color: #64748b; font-weight: 700; cursor: pointer; }
        .modal-btn-confirm { flex: 2; padding: 16px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }

        /* Desktop Layout Overrides */
        @media (min-width: 768px) {
          .store-container {
            flex-direction: row;
            align-items: flex-start;
          }
          .store-sidebar {
            width: 260px;
            height: calc(100vh - 81px);
            overflow-y: auto;
            border-right: 1px solid #e2e8f0;
            background: transparent;
            box-shadow: none;
          }
          .category-list {
            flex-direction: column;
            padding: 24px;
            gap: 4px;
          }
          .category-item {
            padding: 12px 16px;
            border-bottom: none;
            border-left: 4px solid transparent;
            border-radius: 0 12px 12px 0;
          }
          .category-item.active {
            border-bottom-color: transparent;
            border-left-color: var(--primary);
            background: #fff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          }
          .store-content {
            padding: 32px 48px;
          }
          .product-grid-view {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }
        @media (min-width: 1024px) {
          .product-grid-view {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  )
}

function ProductCard({ product, C, onAdd, hideAddBtn, modo }) {
  const isList = modo === 'lista';
  return (
    <div className={`product-card ${isList ? 'product-card-list' : ''}`}>
       <div className={`product-img-wrapper ${isList ? 'img-list-wrapper' : ''}`} style={{ background: product.imagen_url ? '#fff' : C.primary + '15' }}>
         {product.imagen_url ? (
           <img src={product.imagen_url} alt={product.nombre} loading="lazy" />
         ) : (
           <span style={{ opacity: 0.5, fontSize: isList ? '2rem' : '4rem' }}>{product.emoji || '🛍️'}</span>
         )}
         
         {/* Botón flotante al estilo Kyte */}
         {!isList && !hideAddBtn && (
           <button 
             className="product-add-btn" 
             onClick={onAdd}
             style={{ background: C.primary }}
           >
             +
           </button>
         )}
       </div>
       <div className={`product-info ${isList ? 'product-info-list' : ''}`}>
         <div className="product-info-top">
           <h3 className="product-name" style={{ color: C.text }}>{product.nombre}</h3>
           {!isList && <p className="product-desc">{product.descripcion}</p>}
         </div>
         
         <div className={`product-price-row ${isList ? 'price-row-list' : ''}`}>
           <span className="product-price" style={{ color: C.text }}>
             €{parseFloat(product.price || product.precio).toFixed(2)}
           </span>
           
           {isList && !hideAddBtn && (
             <button 
               className="product-add-btn-list" 
               onClick={onAdd}
               style={{ background: C.primary }}
             >
               + Añadir
             </button>
           )}
         </div>
       </div>
    </div>
  )
}
