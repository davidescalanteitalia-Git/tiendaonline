'use client'

import { useState, useRef, useEffect } from 'react'
import { useLang } from './LanguageProvider'
import { DICTIONARY } from '../lib/dictionaries'

export default function StoreClient({ tienda, groupedProducts, uncategorized, C, config = {} }) {
  const { lang } = useLang()
  const dict = DICTIONARY[lang] || DICTIONARY['es']

  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessageOpen, setSuccessMessageOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(groupedProducts[0]?.id || 'uncategorized')

  const aceptarPedidos = tienda.aceptar_pedidos ?? true
  const enviarWhatsapp = tienda.enviar_whatsapp ?? true
  const modoCatalogo = config.modo_exhibicion || tienda.modo_catalogo || 'cuadricula'
  const stockBehavior = config.mostrar_sin_stock || 'normal'

  const mensajePost = tienda.mensaje_post_pedido || '¡Pedido recibido! Pronto nos pondremos en contacto.'
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [metodoEnvio, setMetodoEnvio] = useState('')
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null)
  const [direccionCliente, setDireccionCliente] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  const configPagos = config.pagos || {}
  const configEnvios = config.envios || {}

  const totalProductos = cart.reduce((acc, item) => acc + (parseFloat(item.price || item.precio) * item.quantity), 0)
  const shippingCost = metodoEnvio === 'domicilio' ? (zonaSeleccionada?.costo || 0) : 0
  const total = totalProductos + shippingCost
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)

  const addToCart = (product) => {
    if (!aceptarPedidos) return
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId, delta) => {
    if (!aceptarPedidos) return
    setCart((prev) => prev.map((item) => {
      if (item.id === productId) {
        const newQ = item.quantity + delta
        return newQ > 0 ? { ...item, quantity: newQ } : item
      }
      return item
    }))
  }

  const removeFromCart = (productId) => setCart((prev) => prev.filter((item) => item.id !== productId))

  const scrollToCategory = (id) => {
    setActiveCategory(id)
    const element = document.getElementById(`category-${id}`)
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 130
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const processOrder = async (e) => {
    if (e) e.preventDefault()
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
          total,
          metodo_envio: metodoEnvio,
          metodo_pago: metodoPago,
          direccion: direccionCliente,
          shipping_cost: shippingCost,
          whatsapp: customerPhone
        })
      })
      const data = await response.json()
      if (data.success) {
        const pedido = data.pedido
        if (enviarWhatsapp && tienda.whatsapp) {
          const shippingInfo = metodoEnvio === 'domicilio'
            ? `*Envío a domicilio*%0A- *Zona:* ${zonaSeleccionada?.nombre}%0A- *Dirección:* ${direccionCliente}`
            : `*Retiro en local*%0A- *Dirección:* ${configEnvios.retiro?.direccion || 'A coordinar'}`
          const paymentInfo = metodoPago === 'transferencia'
            ? `*Pago:* Transferencia bancaria%0A_Enviar comprobante a este chat._`
            : `*Pago:* Efectivo`
          const bankDetails = metodoPago === 'transferencia'
            ? `%0A%0A*DATOS BANCARIOS:*%0A- *Banco:* ${configPagos.transferencia?.banco}%0A- *Alias/CBU:* ${configPagos.transferencia?.cbu}%0A- *Titular:* ${configPagos.transferencia?.titular}%0A`
            : ''
          const message = `*ORDEN #${pedido.codigo || pedido.id.slice(0,5).toUpperCase()}*%0A*Cliente:* ${customerName}%0A%0A*PEDIDO:*%0A` +
            cart.map(item => `- ${item.quantity}x ${item.nombre} (€${parseFloat(item.price || item.precio).toFixed(2)})`).join('%0A') +
            `%0A%0A${shippingInfo}%0A%0A${paymentInfo}${bankDetails}%0A%0A*Total: €${total.toFixed(2)}*%0A%0A_Enviado desde: ${tienda.nombre}_`
          window.open(`https://wa.me/${tienda.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}?text=${message}`, '_blank')
        }
        setIsModalOpen(false)
        setIsCartOpen(false)
        setCart([])
        setCustomerName('')
        setMetodoEnvio('')
        setZonaSeleccionada(null)
        setDireccionCliente('')
        setMetodoPago('')
        setCheckoutStep(1)
        setSuccessMessageOpen(true)
      }
    } catch (err) {
      console.error('Error saving order:', err)
      alert('Error al procesar pedido. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // All categories including "uncategorized"
  const allCategories = [
    ...groupedProducts,
    ...(uncategorized.length > 0 ? [{ id: 'uncategorized', nombre: dict.sinCategoria || 'Otros' }] : [])
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: cart.length > 0 ? '100px' : '0' }}>

      {/* ─── LAYOUT PRINCIPAL: Sidebar + Contenido ─── */}
      <div className="kyte-layout">

        {/* ═══════════════════════════════════
            SIDEBAR IZQUIERDA (desktop)
        ═══════════════════════════════════ */}
        <aside className="kyte-sidebar">

          {/* Bloque: CONÓCENOS */}
          <div className="sidebar-block">
            <p className="sidebar-label">CONÓCENOS</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', background: C.primary + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', overflow: 'hidden', flexShrink: 0,
                border: `2px solid ${C.primary}20`
              }}>
                {tienda.logo_url
                  ? <img src={tienda.logo_url} alt={tienda.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (tienda.emoji || '🏪')}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', lineHeight: 1.2 }}>{tienda.nombre}</p>
              </div>
            </div>
            {tienda.descripcion && (
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>{tienda.descripcion}</p>
            )}
          </div>

          {/* Bloque: CONTACTO */}
          {(tienda.whatsapp || tienda.instagram || tienda.email || configEnvios.retiro?.direccion) && (
            <div className="sidebar-block">
              <p className="sidebar-label">ENTRA EN CONTACTO</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tienda.whatsapp && (
                  <a href={`https://wa.me/${tienda.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}`}
                    target="_blank" rel="noopener noreferrer" className="sidebar-contact-row">
                    <span className="sidebar-contact-icon">💬</span>
                    <span>{tienda.whatsapp}</span>
                  </a>
                )}
                {tienda.instagram && (
                  <a href={`https://instagram.com/${tienda.instagram.replace('@', '')}`}
                    target="_blank" rel="noopener noreferrer" className="sidebar-contact-row">
                    <span className="sidebar-contact-icon">📷</span>
                    <span>@{tienda.instagram.replace('@', '')}</span>
                  </a>
                )}
                {tienda.email && (
                  <a href={`mailto:${tienda.email}`} className="sidebar-contact-row">
                    <span className="sidebar-contact-icon">✉️</span>
                    <span style={{ wordBreak: 'break-all' }}>{tienda.email}</span>
                  </a>
                )}
                {configEnvios.retiro?.direccion && (
                  <div className="sidebar-contact-row" style={{ cursor: 'default' }}>
                    <span className="sidebar-contact-icon">📍</span>
                    <span>{configEnvios.retiro.direccion}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bloque: ENTREGA */}
          <div className="sidebar-block">
            <p className="sidebar-label">ENTREGA</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {configEnvios.retiro?.habilitado !== false && (
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  🏪 {configEnvios.retiro?.tipo === 'coordinar'
                    ? 'COORDINAR CON TU VENDEDOR'
                    : (configEnvios.retiro?.direccion || 'Retiro en el local')}
                </div>
              )}
              {configEnvios.domicilio?.habilitado && (
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  🛵 Envío a domicilio disponible
                </div>
              )}
              {!configEnvios.retiro?.habilitado && !configEnvios.domicilio?.habilitado && (
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>A coordinar con el vendedor</div>
              )}
            </div>
          </div>

          {/* Bloque: CATEGORÍAS */}
          {allCategories.length > 0 && (
            <div className="sidebar-block" style={{ paddingBottom: '8px' }}>
              <p className="sidebar-label">CATEGORÍAS</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {allCategories.map((cat) => (
                  <li
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`sidebar-cat-item ${activeCategory === cat.id ? 'sidebar-cat-active' : ''}`}
                    style={{ '--primary': C.primary }}
                  >
                    {activeCategory === cat.id && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.primary, display: 'inline-block', marginRight: '8px', flexShrink: 0 }} />}
                    {cat.nombre}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer sidebar */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#cbd5e1', textAlign: 'center', fontWeight: 500 }}>
              Desarrollado por <span style={{ color: C.primary, fontWeight: 700 }}>TIENDAONLINE</span>
            </p>
          </div>
        </aside>

        {/* ═══════════════════════════════════
            ÁREA PRINCIPAL (Banner + Tabs + Productos)
        ═══════════════════════════════════ */}
        <main className="kyte-main">

          {/* Banner */}
          {config.banner_url && (
            <div style={{ width: '100%', maxHeight: '280px', overflow: 'hidden', borderRadius: '0' }}>
              <img
                src={config.banner_url}
                alt={`Banner de ${tienda.nombre}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {/* Tabs de categorías (visible en móvil y como complemento en desktop) */}
          {allCategories.length > 1 && (
            <div className="kyte-tabs-bar">
              {allCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => scrollToCategory(cat.id)}
                  className={`kyte-tab ${activeCategory === cat.id ? 'kyte-tab-active' : ''}`}
                  style={{ '--primary': C.primary }}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          )}

          {/* Botones vista (grid / lista) + carrito info */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '12px 20px 0', gap: '8px' }}>
            {cart.length > 0 && (
              <button
                onClick={() => setIsCartOpen(true)}
                style={{
                  background: C.primary, color: '#fff', border: 'none',
                  borderRadius: '20px', padding: '8px 16px', fontWeight: 700,
                  fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                🛒 {totalItems} · €{total.toFixed(2)}
              </button>
            )}
          </div>

          {/* Secciones de productos */}
          <div style={{ padding: '16px 20px 40px' }}>
            {groupedProducts.map((cat) => (
              <div key={cat.id} id={`category-${cat.id}`} style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {cat.nombre}
                    <span style={{ marginLeft: '8px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'none' }}>
                      Ver todo ({cat.items.length})
                    </span>
                  </h2>
                </div>

                {modoCatalogo === 'lista' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {cat.items.map((p) => (
                      <ProductCardList key={p.id} product={p} C={C} dict={dict} onAdd={() => addToCart(p)} hideAddBtn={!aceptarPedidos} stockBehavior={stockBehavior} />
                    ))}
                  </div>
                ) : (
                  <div className="kyte-product-grid">
                    {cat.items.map((p) => (
                      <ProductCard key={p.id} product={p} C={C} dict={dict} onAdd={() => addToCart(p)} hideAddBtn={!aceptarPedidos} stockBehavior={stockBehavior} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {uncategorized.length > 0 && (
              <div id="category-uncategorized" style={{ marginBottom: '40px' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 900, color: C.primary, textTransform: 'uppercase' }}>
                  {dict.sinCategoria || 'Otros'}
                  <span style={{ marginLeft: '8px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, textTransform: 'none' }}>
                    ({uncategorized.length})
                  </span>
                </h2>
                <div className="kyte-product-grid">
                  {uncategorized.map((p) => (
                    <ProductCard key={p.id} product={p} C={C} dict={dict} onAdd={() => addToCart(p)} hideAddBtn={!aceptarPedidos} stockBehavior={stockBehavior} />
                  ))}
                </div>
              </div>
            )}

            {groupedProducts.length === 0 && uncategorized.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
                <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{dict.sinProductosDesc || '¡Vuelve pronto!'}</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* No-pedidos banner */}
      {!aceptarPedidos && (
        <div style={{
          background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c',
          padding: '12px 24px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600
        }}>
          🔒 No estamos aceptando pedidos en este momento.
        </div>
      )}

      {/* ─── Botón flotante del Carrito ─── */}
      {cart.length > 0 && (
        <div
          onClick={() => setIsCartOpen(true)}
          className="floating-cart"
          style={{ background: C.primary }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '3px 10px', fontWeight: 800 }}>
              {totalItems}
            </div>
            <span>{dict.verCarrito || 'Ver Carrito'}</span>
          </div>
          <span style={{ fontWeight: 900 }}>€{total.toFixed(2)}</span>
        </div>
      )}

      {/* ─── Cart Drawer ─── */}
      {isCartOpen && (
        <div className="overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>
                {dict.tuCarrito || 'Tu Pedido'}
              </h2>
              <button className="close-x" onClick={() => setIsCartOpen(false)}>✕</button>
            </div>
            <div className="drawer-body">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div>
                    <p style={{ margin: '0 0 2px', fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>{item.nombre}</p>
                    <p style={{ margin: 0, fontWeight: 700, color: C.primary, fontSize: '0.95rem' }}>€{parseFloat(item.price || item.precio).toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>−</button>
                    <span style={{ fontWeight: 800, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px', fontWeight: 600 }}>
                  {dict.carritoVacio || 'El carrito está vacío.'}
                </p>
              )}
            </div>
            <div className="drawer-foot">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 900, marginBottom: '16px' }}>
                <span style={{ color: '#64748b' }}>{dict.total}</span>
                <span style={{ color: '#0f172a' }}>€{total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => { setIsCartOpen(false); setIsModalOpen(true) }}
                disabled={cart.length === 0}
                style={{
                  width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
                  background: cart.length > 0 ? C.primary : '#e2e8f0',
                  color: cart.length > 0 ? '#fff' : '#94a3b8',
                  fontWeight: 800, fontSize: '1rem', cursor: cart.length > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                {dict.continuarWA || 'Enviar pedido por WhatsApp'} →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Checkout Modal ─── */}
      {isModalOpen && (
        <div className="overlay">
          <div className="modal-box" style={{ background: '#fff' }}>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '24px' }}>
              {[1, 2].map(s => (
                <div key={s} style={{ height: '4px', width: '32px', borderRadius: '2px', background: checkoutStep >= s ? C.primary : '#e2e8f0' }} />
              ))}
            </div>

            {checkoutStep === 1 ? (
              <>
                <h2 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '1.3rem', fontWeight: 900 }}>
                  {dict.dinosTuNombre || 'Tus Datos'}
                </h2>
                <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.9rem' }}>
                  {dict.introducirNombreDesc || 'Completa tu información para el pedido.'}
                </p>

                <input type="text" placeholder={dict.nombreCliente || 'Tu nombre...'} value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)} className="modal-input"
                  style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#0f172a' }} autoFocus />

                <input type="tel" placeholder="WhatsApp (ej: +39 340...)" value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)} className="modal-input"
                  style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#0f172a' }} />

                <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                  <p style={{ margin: '0 0 12px', fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {dict.entregaRetirada || '¿Cómo quieres recibirlo?'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {configEnvios.retiro?.habilitado !== false && (
                      <button onClick={() => setMetodoEnvio('retiro')} style={{
                        padding: '14px', borderRadius: '14px', textAlign: 'left',
                        border: `2px solid ${metodoEnvio === 'retiro' ? C.primary : '#e2e8f0'}`,
                        background: metodoEnvio === 'retiro' ? C.primary + '10' : 'transparent',
                        display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>🏪</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{dict.retiroEnLocal || 'Retiro en local'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{configEnvios.retiro?.direccion}</div>
                        </div>
                      </button>
                    )}
                    {configEnvios.domicilio?.habilitado && (
                      <button onClick={() => setMetodoEnvio('domicilio')} style={{
                        padding: '14px', borderRadius: '14px', textAlign: 'left',
                        border: `2px solid ${metodoEnvio === 'domicilio' ? C.primary : '#e2e8f0'}`,
                        background: metodoEnvio === 'domicilio' ? C.primary + '10' : 'transparent',
                        display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>🛵</span>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{dict.envioADomicilio || 'Envío a domicilio'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Reparto en zonas seleccionadas</div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>
                    {dict.cerrar || 'Cerrar'}
                  </button>
                  <button
                    disabled={!customerName.trim() || !customerPhone.trim() || !metodoEnvio}
                    onClick={() => setCheckoutStep(2)}
                    style={{
                      flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
                      background: C.primary, color: '#fff', fontWeight: 800, cursor: 'pointer',
                      opacity: (!customerName.trim() || !customerPhone.trim() || !metodoEnvio) ? 0.5 : 1
                    }}
                  >
                    Continuar →
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ margin: '0 0 20px', color: '#0f172a', fontSize: '1.3rem', fontWeight: 900 }}>Detalles Finales</h2>
                <div style={{ maxHeight: '320px', overflowY: 'auto', marginBottom: '20px' }}>
                  {metodoEnvio === 'domicilio' && (
                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                      <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Zona de Envío</p>
                      <select value={zonaSeleccionada?.id || ''} onChange={(e) => setZonaSeleccionada(configEnvios.domicilio.zonas.find(z => z.id.toString() === e.target.value))}
                        className="modal-input" style={{ borderColor: '#e2e8f0', textAlign: 'left', fontSize: '0.9rem', marginBottom: '10px' }}>
                        <option value="">Selecciona tu zona...</option>
                        {configEnvios.domicilio.zonas.map(z => (
                          <option key={z.id} value={z.id}>{z.nombre} (+€{z.costo.toFixed(2)})</option>
                        ))}
                      </select>
                      <textarea placeholder="Tu dirección completa..." value={direccionCliente} onChange={(e) => setDireccionCliente(e.target.value)}
                        className="modal-input" style={{ borderColor: '#e2e8f0', textAlign: 'left', fontSize: '0.9rem', height: '72px', paddingTop: '12px' }} />
                    </div>
                  )}

                  <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                    <p style={{ margin: '0 0 10px', fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>{dict.metodosDePago}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {configPagos.efectivo?.habilitado !== false && (
                        <button onClick={() => setMetodoPago('efectivo')} style={{
                          padding: '12px', borderRadius: '12px', border: `2px solid ${metodoPago === 'efectivo' ? C.primary : '#e2e8f0'}`,
                          background: metodoPago === 'efectivo' ? C.primary + '10' : 'transparent',
                          fontWeight: 800, fontSize: '0.8rem', color: '#0f172a', cursor: 'pointer'
                        }}>
                          💵 {dict.pagosEnEfectivo || 'Efectivo'}
                        </button>
                      )}
                      {configPagos.transferencia?.habilitado && (
                        <button onClick={() => setMetodoPago('transferencia')} style={{
                          padding: '12px', borderRadius: '12px', border: `2px solid ${metodoPago === 'transferencia' ? C.primary : '#e2e8f0'}`,
                          background: metodoPago === 'transferencia' ? C.primary + '10' : 'transparent',
                          fontWeight: 800, fontSize: '0.8rem', color: '#0f172a', cursor: 'pointer'
                        }}>
                          🏦 {dict.transferenciaBancaria || 'Transferencia'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '14px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>
                      <span>Subtotal</span><span>€{totalProductos.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px dashed #e2e8f0' }}>
                      <span>Envío</span><span>€{shippingCost.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}>
                      <span>Total</span><span>€{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setCheckoutStep(1)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>
                    ← Volver
                  </button>
                  <button
                    disabled={isSubmitting || (metodoEnvio === 'domicilio' && (!zonaSeleccionada || !direccionCliente)) || !metodoPago}
                    onClick={processOrder}
                    style={{
                      flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
                      background: C.primary, color: '#fff', fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    {isSubmitting ? '...' : 'Finalizar Pedido ✓'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Success Modal ─── */}
      {successMessageOpen && (
        <div className="overlay">
          <div className="modal-box" style={{ background: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>✅</div>
            <h2 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '1.4rem', fontWeight: 900 }}>¡Pedido enviado!</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{mensajePost}</p>
            <button onClick={() => setSuccessMessageOpen(false)} style={{
              marginTop: '24px', width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
              background: C.primary, color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer'
            }}>
              {dict.cerrar || 'Cerrar'}
            </button>
          </div>
        </div>
      )}

      {/* ─── ESTILOS GLOBALES ─── */}
      <style jsx global>{`
        /* ── Layout principal Kyte ── */
        .kyte-layout {
          display: flex;
          flex-direction: column;
          min-height: calc(100vh - 81px);
        }
        @media (min-width: 768px) {
          .kyte-layout {
            flex-direction: row;
            align-items: flex-start;
          }
        }

        /* ── Sidebar ── */
        .kyte-sidebar {
          display: none;
          width: 265px;
          flex-shrink: 0;
          background: #fff;
          border-right: 1px solid #f1f5f9;
          position: sticky;
          top: 81px;
          height: calc(100vh - 81px);
          overflow-y: auto;
          flex-direction: column;
          scrollbar-width: none;
        }
        .kyte-sidebar::-webkit-scrollbar { display: none; }
        @media (min-width: 768px) {
          .kyte-sidebar {
            display: flex;
          }
        }

        .sidebar-block {
          padding: 18px 20px;
          border-bottom: 1px solid #f1f5f9;
        }
        .sidebar-label {
          margin: 0 0 12px;
          font-size: 0.7rem;
          font-weight: 900;
          color: var(--primary, #2563EB);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .sidebar-contact-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.82rem;
          color: #475569;
          text-decoration: none;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.15s;
        }
        .sidebar-contact-row:hover { color: #0f172a; }
        .sidebar-contact-icon {
          font-size: 1rem;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .sidebar-cat-item {
          display: flex;
          align-items: center;
          padding: 9px 12px;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s;
          list-style: none;
        }
        .sidebar-cat-item:hover {
          background: #f8fafc;
          color: #0f172a;
        }
        .sidebar-cat-active {
          color: var(--primary);
          background: color-mix(in srgb, var(--primary) 8%, transparent);
          font-weight: 800;
        }

        /* ── Main ── */
        .kyte-main {
          flex: 1;
          min-width: 0;
          background: #f8fafc;
        }

        /* ── Category Tabs (horizontal, mobile + desktop) ── */
        .kyte-tabs-bar {
          display: flex;
          overflow-x: auto;
          gap: 0;
          background: #fff;
          border-bottom: 1px solid #f1f5f9;
          padding: 0 16px;
          scrollbar-width: none;
          position: sticky;
          top: 81px;
          z-index: 20;
        }
        .kyte-tabs-bar::-webkit-scrollbar { display: none; }
        @media (min-width: 768px) {
          .kyte-tabs-bar {
            display: none;
          }
        }

        .kyte-tab {
          padding: 14px 16px;
          white-space: nowrap;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          font-size: 0.9rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .kyte-tab:hover { color: #0f172a; }
        .kyte-tab-active {
          color: var(--primary);
          border-bottom-color: var(--primary);
          font-weight: 800;
        }

        /* ── Product Grid ── */
        .kyte-product-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) {
          .kyte-product-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }
        @media (min-width: 1024px) {
          .kyte-product-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* ── Product Card ── */
        .kyte-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: box-shadow 0.2s, transform 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .kyte-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
        .kyte-card-img {
          width: 100%;
          aspect-ratio: 1 / 1;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3.5rem;
          position: relative;
          overflow: hidden;
        }
        .kyte-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .kyte-add-btn {
          position: absolute;
          bottom: -14px;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          color: #fff;
          font-size: 1.4rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: transform 0.15s;
          line-height: 1;
          padding-bottom: 1px;
        }
        .kyte-add-btn:active { transform: scale(0.88); }
        .kyte-add-btn:disabled { background: #cbd5e1 !important; cursor: not-allowed; }
        .kyte-card-info {
          padding: 20px 14px 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .kyte-card-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
        }
        .kyte-card-price {
          font-size: 1rem;
          font-weight: 900;
          margin-top: auto;
        }
        .kyte-out-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(0,0,0,0.55);
          color: #fff;
          padding: 3px 7px;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 900;
          text-transform: uppercase;
          backdrop-filter: blur(4px);
        }

        /* ── List Card ── */
        .kyte-list-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #f1f5f9;
          background: #fff;
        }
        .kyte-list-img {
          width: 72px;
          height: 72px;
          border-radius: 12px;
          background: #f8fafc;
          flex-shrink: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }
        .kyte-list-img img { width: 100%; height: 100%; object-fit: cover; }

        /* ── Floating Cart ── */
        .floating-cart {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 40px);
          max-width: 520px;
          border-radius: 18px;
          padding: 16px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 800;
          font-size: 1rem;
          color: #fff;
          cursor: pointer;
          z-index: 100;
          border: none;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        /* ── Overlay + Drawers + Modals ── */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }
        .cart-drawer {
          width: 100%;
          max-width: 400px;
          height: 100%;
          background: #fff;
          display: flex;
          flex-direction: column;
          animation: slideRight 0.28s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes slideRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .drawer-head {
          padding: 22px 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .close-x {
          background: #f1f5f9;
          border: none;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          font-size: 0.9rem;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }
        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid #f8fafc;
        }
        .qty-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          width: 28px;
          height: 28px;
          font-weight: 800;
          cursor: pointer;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .drawer-foot {
          padding: 20px 24px;
          border-top: 1px solid #f1f5f9;
        }
        .modal-box {
          background: #fff;
          border-radius: 24px;
          padding: 28px 24px;
          width: calc(100% - 40px);
          max-width: 420px;
          margin: auto;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          align-self: center;
        }
        .overlay:has(.modal-box) {
          justify-content: center;
          align-items: center;
        }
        .modal-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          font-size: 0.95rem;
          outline: none;
          margin-bottom: 14px;
          font-family: inherit;
          box-sizing: border-box;
        }
        .modal-input:focus { border-color: currentColor; }
      `}</style>
    </div>
  )
}

/* ══════════════════════════════════════════
   PRODUCT CARD — Vista Grilla (Kyte Style)
══════════════════════════════════════════ */
function ProductCard({ product, C, dict, onAdd, hideAddBtn, stockBehavior }) {
  const outOfStock = (product.stock || 0) <= 0
  const isNoDisponible = stockBehavior === 'no_disponible' && outOfStock

  return (
    <div className="kyte-card" style={{ opacity: isNoDisponible ? 0.6 : 1 }}>
      <div className="kyte-card-img" style={{ background: product.imagen_url ? '#fff' : (C.primary + '12') }}>
        {outOfStock && <div className="kyte-out-badge">{dict.sinStock || 'Esaurito'}</div>}
        {product.imagen_url
          ? <img src={product.imagen_url} alt={product.nombre} loading="lazy" />
          : <span style={{ opacity: 0.4 }}>{product.emoji || '🛍️'}</span>
        }
        {!hideAddBtn && (
          <button className="kyte-add-btn" onClick={onAdd} disabled={isNoDisponible} style={{ background: C.primary }}>
            +
          </button>
        )}
      </div>
      <div className="kyte-card-info">
        <h3 className="kyte-card-name">{product.nombre}</h3>
        {product.descripcion && (
          <p style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.descripcion}
          </p>
        )}
        <span className="kyte-card-price" style={{ color: C.primary }}>
          €{parseFloat(product.price || product.precio).toFixed(2)}
        </span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   PRODUCT CARD — Vista Lista
══════════════════════════════════════════ */
function ProductCardList({ product, C, dict, onAdd, hideAddBtn, stockBehavior }) {
  const outOfStock = (product.stock || 0) <= 0
  const isNoDisponible = stockBehavior === 'no_disponible' && outOfStock

  return (
    <div className="kyte-list-item" style={{ opacity: isNoDisponible ? 0.6 : 1 }}>
      <div className="kyte-list-img" style={{ background: product.imagen_url ? '#fff' : (C.primary + '12') }}>
        {product.imagen_url
          ? <img src={product.imagen_url} alt={product.nombre} loading="lazy" />
          : <span style={{ opacity: 0.4 }}>{product.emoji || '🛍️'}</span>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.nombre}
        </p>
        {product.descripcion && (
          <p style={{ margin: '0 0 6px', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.descripcion}
          </p>
        )}
        <span style={{ fontWeight: 900, fontSize: '0.95rem', color: C.primary }}>
          €{parseFloat(product.price || product.precio).toFixed(2)}
        </span>
      </div>
      {!hideAddBtn && (
        <button onClick={onAdd} disabled={isNoDisponible} style={{
          background: isNoDisponible ? '#e2e8f0' : C.primary, color: isNoDisponible ? '#94a3b8' : '#fff',
          border: 'none', borderRadius: '10px', padding: '8px 14px', fontWeight: 800,
          fontSize: '0.85rem', cursor: isNoDisponible ? 'not-allowed' : 'pointer', flexShrink: 0
        }}>
          + {dict.aggiungi || 'Añadir'}
        </button>
      )}
    </div>
  )
}
