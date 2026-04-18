'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DICTIONARY } from '../lib/dictionaries'
import { registrarEvento, EVENTOS } from './PostHogProvider'
import { supabase } from '../lib/supabase'

const CART_KEY_PREFIX = 'to_cart_'

function loadCartFromStorage(domain) {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(CART_KEY_PREFIX + domain) || '[]') } catch { return [] }
}
function saveCartToStorage(domain, cart) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY_PREFIX + domain, JSON.stringify(cart))
}

export default function StoreClient({ tienda, groupedProducts, uncategorized, C, config = {} }) {
  // Idioma con estado local propio — más confiable que el contexto global en rutas de store
  const [lang, setLang] = useState('es')

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('appLang') : null
    if (saved && ['it', 'es', 'en'].includes(saved)) {
      setLang(saved)
    }
  }, [])

  const changeLang = (newLang) => {
    setLang(newLang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('appLang', newLang)
    }
  }

  const dict = DICTIONARY[lang] || DICTIONARY['es']
  const router = useRouter()
  const searchParams = useSearchParams()

  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessageOpen, setSuccessMessageOpen] = useState(false)
  const [orderError, setOrderError] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null) // null = "Todos"
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMobileFilters, setActiveMobileFilters] = useState(false)
  const [selectedPriceRange, setSelectedPriceRange] = useState(null) // null | 'low' | 'mid' | 'high'
  const [showOnlyInStock, setShowOnlyInStock] = useState(false)

  const aceptarPedidos = tienda.aceptar_pedidos ?? true
  const enviarWhatsapp = tienda.enviar_whatsapp ?? true
  const mensajePost = tienda.mensaje_post_pedido || '¡Pedido recibido! Pronto nos pondremos en contacto.'

  const [checkoutStep, setCheckoutStep] = useState(1)
  const [metodoEnvio, setMetodoEnvio] = useState('')
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null)
  const [direccionCliente, setDireccionCliente] = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [cuponInput, setCuponInput] = useState('')
  const [cuponAplicado, setCuponAplicado] = useState(null)
  const [cuponError, setCuponError] = useState(null)

  const configPagos = config.pagos || {}
  const configEnvios = config.envios || {}
  const stockBehavior = config.mostrar_sin_stock || 'normal'

  // ── Sesión del cliente logueado ────────────────────
  const [clienteNombre, setClienteNombre] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Buscar nombre en la tabla clientes
        supabase
          .from('clientes')
          .select('nombre')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => {
            const nombre = data?.nombre || session.user.email?.split('@')[0] || null
            setClienteNombre(nombre)
          })
      }
    })
  }, [])

  // ── Sync cart with localStorage ────────────────────
  useEffect(() => {
    const stored = loadCartFromStorage(tienda.subdominio)
    if (stored.length > 0) setCart(stored)
  }, [tienda.subdominio])

  useEffect(() => {
    saveCartToStorage(tienda.subdominio, cart)
  }, [cart, tienda.subdominio])

  // ── Open cart if coming from product detail page ───
  useEffect(() => {
    if (searchParams?.get('openCart') === '1') {
      setIsCartOpen(true)
      // Remove the param from URL without causing navigation
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('openCart')
        window.history.replaceState({}, '', url.toString())
      }
    }
  }, [searchParams])

  const totalProductos = cart.reduce((acc, item) => acc + (parseFloat(item.price || item.precio) * item.quantity), 0)
  let discount = 0
  if (cuponAplicado) {
    discount = cuponAplicado.tipo === 'porcentaje'
      ? totalProductos * (cuponAplicado.valor / 100)
      : parseFloat(cuponAplicado.valor)
  }
  const shippingCost = metodoEnvio === 'domicilio' ? (zonaSeleccionada?.costo || 0) : 0
  const total = Math.max(0, totalProductos - discount) + shippingCost
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)

  // ── Horario ────────────────────────────────────────
  const getEstadoTienda = () => {
    const horario = tienda.horario || ''
    if (!horario) return null
    const now = new Date()
    const horaActual = now.getHours() * 60 + now.getMinutes()
    const match = horario.match(/(\d{1,2}):(\d{2})\s*[–\-]\s*(\d{1,2}):(\d{2})/)
    if (!match) return { abierto: null, texto: horario }
    const inicio = parseInt(match[1]) * 60 + parseInt(match[2])
    const fin    = parseInt(match[3]) * 60 + parseInt(match[4])
    return { abierto: horaActual >= inicio && horaActual < fin, texto: horario }
  }

  // ── Todos los productos flat ───────────────────────
  const allProducts = [
    ...groupedProducts.flatMap(cat => cat.items),
    ...uncategorized
  ]

  // ── Filtrar productos según búsqueda y filtros ─────
  const getFilteredItems = (items) => {
    let result = items
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.nombre?.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q) ||
        p.codigo_barras?.toLowerCase().includes(q)
      )
    }
    if (showOnlyInStock) {
      result = result.filter(p => (p.stock || 0) > 0)
    }
    if (selectedPriceRange === 'low') result = result.filter(p => parseFloat(p.precio || p.price) < 10)
    if (selectedPriceRange === 'mid') result = result.filter(p => { const pr = parseFloat(p.precio || p.price); return pr >= 10 && pr < 50 })
    if (selectedPriceRange === 'high') result = result.filter(p => parseFloat(p.precio || p.price) >= 50)
    return result
  }

  const isSearchActive = searchQuery.trim() !== '' || selectedPriceRange !== null || showOnlyInStock
  const searchResults = isSearchActive ? getFilteredItems(allProducts) : []

  // ── Carrito ────────────────────────────────────────
  const addToCart = (product) => {
    if (!aceptarPedidos) return
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId)
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item)
      }
      return prev.filter(item => item.id !== productId)
    })
  }

  const removeItemFull = (productId) => setCart(prev => prev.filter(item => item.id !== productId))

  const getItemQty = (productId) => cart.find(item => item.id === productId)?.quantity || 0

  const scrollToCategory = (id) => {
    if (id === null) {
      // "Todos" — reset a vista unificada, scroll al top
      setActiveCategory(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setActiveCategory(id)
    // Si está en modo separado, scroll a esa sección
    setTimeout(() => {
      const element = document.getElementById(`category-${id}`)
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 100
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }, 50)
  }

  const applyCupon = () => {
    setCuponError(null)
    if (!cuponInput.trim()) return
    const cupones = config.cupones || []
    const found = cupones.find(c => c.codigo.toUpperCase() === cuponInput.trim().toUpperCase())
    if (found) { setCuponAplicado(found); setCuponInput('') }
    else setCuponError('Cupón inválido')
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
          whatsapp: customerPhone,
          cupon_codigo: cuponAplicado?.codigo || null,
          descuento: discount
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
          const discountInfo = cuponAplicado ? `%0A*Descuento (${cuponAplicado.codigo}):* -€${discount.toFixed(2)}` : ''
          const message = `*ORDEN #${pedido.codigo || pedido.id.slice(0,5).toUpperCase()}*%0A*Cliente:* ${customerName}%0A%0A*PEDIDO:*%0A` +
            cart.map(item => `- ${item.quantity}x ${item.nombre} (€${parseFloat(item.price || item.precio).toFixed(2)})`).join('%0A') +
            `%0A%0A${shippingInfo}%0A%0A${paymentInfo}${bankDetails}${discountInfo}%0A%0A*Total: €${total.toFixed(2)}*%0A%0A_Enviado desde: ${tienda.nombre}_`
          window.open(`https://wa.me/${tienda.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}?text=${message}`, '_blank')
          registrarEvento(EVENTOS.WHATSAPP_ABIERTO, { tienda_id: tienda.id, total })
        }
        // PostHog: pedido completado
        registrarEvento(EVENTOS.PEDIDO_COMPLETADO, {
          tienda_id: tienda.id,
          tienda_nombre: tienda.nombre,
          total,
          num_productos: cart.reduce((s, i) => s + i.quantity, 0),
          metodo_pago: metodoPago,
          metodo_envio: metodoEnvio,
          cupon_usado: !!cuponAplicado,
        })
        setIsModalOpen(false); setIsCartOpen(false); setCart([])
        saveCartToStorage(tienda.subdominio, [])
        setCustomerName(''); setMetodoEnvio(''); setZonaSeleccionada(null)
        setDireccionCliente(''); setMetodoPago(''); setCuponAplicado(null)
        setCuponInput(''); setCheckoutStep(1); setSuccessMessageOpen(true)
      }
    } catch (err) {
      setOrderError('Hubo un problema al enviar tu pedido. Por favor intenta de nuevo.')
      setTimeout(() => setOrderError(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const allCategories = [
    ...groupedProducts,
    ...(uncategorized.length > 0 ? [{ id: 'uncategorized', nombre: dict.sinCategoria || 'Otros' }] : [])
  ]

  const estadoTienda = getEstadoTienda()
  const redes = config.redes_sociales || {}

  // ── Producto Card ──────────────────────────────────
  const ProductCard = ({ product }) => {
    const qty = getItemQty(product.id)
    const outOfStock = (stockBehavior !== 'normal') && (product.stock || 0) === 0
    const precio = parseFloat(product.precio || product.price || 0)

    return (
      <div
        className="product-card"
        onClick={() => router.push(`/store/${tienda.subdominio}/producto/${product.id}`)}
        style={{ cursor: 'pointer' }}
      >
        {/* Imagen */}
        <div className="product-img-wrap">
          {product.imagen_url
            ? <img src={product.imagen_url} alt={product.nombre} className="product-img" />
            : <div className="product-img-placeholder">{product.emoji || '📦'}</div>
          }
          {outOfStock && (
            <div className="product-badge product-badge-stock">Sin stock</div>
          )}
        </div>

        {/* Info */}
        <div className="product-info">
          {product.categoria_nombre && (
            <p className="product-brand">{product.categoria_nombre}</p>
          )}
          <p className="product-name">{product.nombre}</p>
          {product.descripcion && (
            <p className="product-desc">{product.descripcion}</p>
          )}
          <p className="product-price" style={{ color: C.primary }}>
            €{precio.toFixed(2)}
          </p>

          {/* Botón agregar / contador */}
          {aceptarPedidos && !outOfStock && (
            <div onClick={e => e.stopPropagation()}>
              {qty === 0 ? (
                <button
                  className="btn-add"
                  style={{ background: C.primary }}
                  onClick={() => addToCart(product)}
                >
                  + Agregar
                </button>
              ) : (
                <div className="qty-control" style={{ borderColor: C.primary }}>
                  <button className="qty-btn-inline" style={{ color: C.primary }} onClick={() => removeFromCart(product.id)}>−</button>
                  <span className="qty-num" style={{ color: C.primary }}>{qty}</span>
                  <button className="qty-btn-inline" style={{ color: C.primary }} onClick={() => addToCart(product)}>+</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', 'Fira Sans', sans-serif" }}>

      {/* ── Error Toast ─────────────────────────── */}
      {orderError && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: '#dc2626', color: '#fff', padding: '14px 20px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '14px', maxWidth: '90vw' }}>
          ⚠️ {orderError}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
           HEADER — Fila 1: Logo + Idioma + Mi cuenta
           FILA 2: Banner (ancho total)
           FILA 3 (sticky): Buscador + Carrito + Categorías
      ═══════════════════════════════════════════════════════ */}
      <header style={{ background: '#fff' }}>

        {/* ── Fila 1: Logo · Selector idioma · Mi cuenta ── */}
        <div style={{ borderBottom: '1px solid #e2e8f0', padding: '0 16px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px', height: '60px' }}>

            {/* Logo + Nombre */}
            <a href={`/store/${tienda.subdominio}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '9px', overflow: 'hidden', background: C.primary + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', border: `1.5px solid ${C.primary}25`, flexShrink: 0 }}>
                {tienda.logo_url
                  ? <img src={tienda.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (tienda.emoji || '🏪')}
              </div>
              <span style={{ fontWeight: 900, fontSize: '1rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                {tienda.nombre}
              </span>
            </a>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Selector de idioma */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#f1f5f9', borderRadius: '10px', padding: '3px', border: '1px solid #e2e8f0' }}>
              {[
                { code: 'es', label: 'ES' },
                { code: 'it', label: 'IT' },
                { code: 'en', label: 'EN' },
              ].map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => changeLang(code)}
                  aria-label={`Cambiar idioma a ${label}`}
                  style={{
                    background: lang === code ? C.primary : 'transparent',
                    color: lang === code ? '#fff' : '#64748b',
                    border: 'none',
                    borderRadius: '7px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: lang === code ? 800 : 600,
                    lineHeight: 1,
                    letterSpacing: '0.05em',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Mi cuenta — muestra nombre si está logueado */}
            <a
              href={clienteNombre ? `/store/${tienda.subdominio}/mis-pedidos` : `/store/${tienda.subdominio}/cuenta`}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none',
                fontWeight: 700, fontSize: '0.8rem', padding: '7px 12px', borderRadius: '10px',
                border: `1.5px solid ${clienteNombre ? C.primary + '40' : '#e2e8f0'}`,
                background: clienteNombre ? C.primary + '10' : '#fff',
                color: clienteNombre ? C.primary : '#475569',
                whiteSpace: 'nowrap', flexShrink: 0, maxWidth: '130px',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}
            >
              👤 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {clienteNombre ? clienteNombre.split(' ')[0] : <span className="hide-xs">Mi cuenta</span>}
              </span>
            </a>
          </div>
        </div>

        {/* ── Fila 2: Banner (ancho completo) ── */}
        {config.banner_url && (
          <div style={{ width: '100%', height: '360px', overflow: 'hidden', position: 'relative' }}>
            <img src={config.banner_url} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 55%, rgba(15,23,42,0.4) 100%)' }} />
          </div>
        )}

        {/* ── Fila 3 (sticky): Buscador + Carrito + Tabs de categorías ── */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 16px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

            {/* Barra buscador + carrito */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '56px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.95rem', pointerEvents: 'none', color: '#94a3b8' }}>🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={`Buscar en ${tienda.nombre}...`}
                  style={{
                    width: '100%', padding: '9px 36px 9px 38px', borderRadius: '12px',
                    border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.88rem',
                    color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = C.primary}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.9rem' }}>✕</button>
                )}
              </div>

              {/* Carrito */}
              <button
                onClick={() => setIsCartOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', background: totalItems > 0 ? C.primary : '#f1f5f9', color: totalItems > 0 ? '#fff' : '#64748b', border: 'none', borderRadius: '10px', padding: '9px 14px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
              >
                🛒
                {totalItems > 0 && (
                  <>
                    <span>{totalItems}</span>
                    <span style={{ opacity: 0.7 }}>·</span>
                    <span>€{total.toFixed(2)}</span>
                  </>
                )}
                {totalItems === 0 && <span className="hide-xs">Carrito</span>}
              </button>
            </div>

            {/* Tabs de categorías deslizantes */}
            {allCategories.length > 0 && !isSearchActive && (
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
                <button onClick={() => scrollToCategory(null)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: '99px', border: `1.5px solid ${activeCategory === null ? C.primary : '#e2e8f0'}`, background: activeCategory === null ? C.primary : '#fff', color: activeCategory === null ? '#fff' : '#475569', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                  Todos
                </button>
                {allCategories.map(cat => (
                  <button key={cat.id} onClick={() => scrollToCategory(cat.id)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: '99px', border: `1.5px solid ${activeCategory === cat.id ? C.primary : '#e2e8f0'}`, background: activeCategory === cat.id ? C.primary : '#fff', color: activeCategory === cat.id ? '#fff' : '#475569', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                    {cat.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── No acepta pedidos banner ──────────── */}
      {!aceptarPedidos && (
        <div style={{ background: '#fff7ed', borderBottom: '1px solid #fed7aa', color: '#c2410c', padding: '10px 24px', textAlign: 'center', fontSize: '0.88rem', fontWeight: 600 }}>
          🔒 No estamos aceptando pedidos en este momento.
        </div>
      )}

      {/* ── LAYOUT PRINCIPAL ────────────────────── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'flex-start', gap: '24px', padding: '24px 16px' }}>

        {/* ══ SIDEBAR FILTROS (desktop) ══════════ */}
        <aside style={{ width: '240px', flexShrink: 0, display: 'none', flexDirection: 'column', gap: '0', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', position: 'sticky', top: '88px' }} className="store-sidebar">

          {/* Info tienda */}
          <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9' }}>
            {tienda.descripcion && (
              <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>{tienda.descripcion}</p>
            )}
            {estadoTienda && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800, background: estadoTienda.abierto ? '#dcfce7' : '#fee2e2', color: estadoTienda.abierto ? '#15803d' : '#dc2626' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: estadoTienda.abierto ? '#22c55e' : '#ef4444' }} />
                {estadoTienda.abierto ? 'Abierto ahora' : 'Cerrado'} · {estadoTienda.texto}
              </span>
            )}
          </div>

          {/* Filtro: Categorías */}
          {allCategories.length > 0 && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Categorías</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {allCategories.map(cat => (
                  <li key={cat.id} onClick={() => scrollToCategory(cat.id)} style={{ padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeCategory === cat.id ? 800 : 500, color: activeCategory === cat.id ? C.primary : '#475569', background: activeCategory === cat.id ? C.primary + '12' : 'transparent', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {activeCategory === cat.id && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: C.primary, flexShrink: 0 }} />}
                    {cat.nombre}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Filtro: Precio */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <p style={{ margin: '0 0 10px', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Precio</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { key: null, label: 'Todos los precios' },
                { key: 'low', label: 'Menos de €10' },
                { key: 'mid', label: 'Entre €10 y €50' },
                { key: 'high', label: 'Más de €50' },
              ].map(opt => (
                <button key={opt.key} onClick={() => setSelectedPriceRange(opt.key)} style={{ textAlign: 'left', padding: '7px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.83rem', fontWeight: selectedPriceRange === opt.key ? 800 : 500, color: selectedPriceRange === opt.key ? C.primary : '#475569', background: selectedPriceRange === opt.key ? C.primary + '12' : 'transparent' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro: Stock */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
              <input type="checkbox" checked={showOnlyInStock} onChange={e => setShowOnlyInStock(e.target.checked)} style={{ accentColor: C.primary, width: '16px', height: '16px' }} />
              Solo con stock disponible
            </label>
          </div>

        </aside>

        {/* ══ CONTENIDO PRINCIPAL ════════════════ */}
        <main style={{ flex: 1, minWidth: 0 }}>

          {/* RESULTADOS DE BÚSQUEDA / FILTROS */}
          {isSearchActive ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                  {searchQuery && <span> para "<strong>{searchQuery}</strong>"</span>}
                </p>
                <button onClick={() => { setSearchQuery(''); setSelectedPriceRange(null); setShowOnlyInStock(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>
                  Limpiar filtros ✕
                </button>
              </div>
              {searchResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
                  <p style={{ fontWeight: 700, fontSize: '1rem' }}>No encontramos resultados</p>
                  <p style={{ fontSize: '0.85rem' }}>Intenta con otro término o limpia los filtros</p>
                </div>
              ) : (
                <div className="store-product-grid">
                  {searchResults.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          ) : activeCategory === null ? (
            /* MODO "TODOS" — todos los productos mezclados en un grid */
            <div>
              {allProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>¡Vuelve pronto!</p>
                </div>
              ) : (
                <div className="store-product-grid">
                  {allProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          ) : (
            /* MODO CATEGORÍA SELECCIONADA — solo los productos de esa categoría */
            <div>
              {(() => {
                const catSeleccionada = activeCategory === 'uncategorized'
                  ? { id: 'uncategorized', nombre: dict.sinCategoria || 'Otros', items: uncategorized }
                  : groupedProducts.find(c => c.id === activeCategory)
                if (!catSeleccionada) return null
                const items = catSeleccionada.items || []
                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '10px', borderBottom: '2px solid #f1f5f9' }}>
                      <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                        {catSeleccionada.emoji && <span style={{ marginRight: '8px' }}>{catSeleccionada.emoji}</span>}
                        {catSeleccionada.nombre}
                      </h2>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{items.length} producto{items.length !== 1 ? 's' : ''}</span>
                    </div>
                    {items.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        <p style={{ fontWeight: 600 }}>Sin productos en esta categoría</p>
                      </div>
                    ) : (
                      <div className="store-product-grid">
                        {items.map(p => <ProductCard key={p.id} product={p} />)}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}
        </main>
      </div>

      {/* ── FOOTER DE LA TIENDA ─────────────────── */}
      <footer style={{ background: '#0f172a', color: '#cbd5e1', marginTop: '60px', padding: '48px 16px 32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

          {/* Grid superior */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '36px', marginBottom: '40px' }}>

            {/* Columna 1 — Info de la tienda */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: C.primary + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                  {tienda.logo_url
                    ? <img src={tienda.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    : (tienda.emoji || '🏪')}
                </div>
                <span style={{ fontWeight: 900, fontSize: '1rem', color: '#f1f5f9' }}>{tienda.nombre}</span>
              </div>
              {tienda.descripcion && (
                <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>{tienda.descripcion}</p>
              )}
              {/* Horario */}
              {tienda.horario && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>🕐</span>
                  <div>
                    <p style={{ margin: '0', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Horario</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>{tienda.horario}</p>
                  </div>
                </div>
              )}
              {/* Estado abierto/cerrado */}
              {estadoTienda && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 800, background: estadoTienda.abierto ? '#14532d' : '#450a0a', color: estadoTienda.abierto ? '#86efac' : '#fca5a5', marginTop: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: estadoTienda.abierto ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
                  {estadoTienda.abierto ? 'Abierto ahora' : 'Cerrado'}
                </span>
              )}
            </div>

            {/* Columna 2 — Contacto */}
            <div>
              <h4 style={{ margin: '0 0 14px', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contacto</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tienda.whatsapp && (
                  <a href={`https://wa.me/${tienda.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ade80', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                    💬 WhatsApp
                  </a>
                )}
                {tienda.email && (
                  <a href={`mailto:${tienda.email}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                    ✉️ {tienda.email}
                  </a>
                )}
                {(config.redes_sociales?.instagram) && (
                  <a href={`https://instagram.com/${config.redes_sociales.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
                    📸 Instagram
                  </a>
                )}
                {config.envios?.retiro?.direccion && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                    <span style={{ flexShrink: 0 }}>📍</span>
                    <span>{config.envios.retiro.direccion}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Columna 3 — Mi cuenta */}
            <div>
              <h4 style={{ margin: '0 0 14px', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mi cuenta</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href={`/store/${tienda.subdominio}/cuenta`} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  👤 Mi perfil
                </a>
                <a href={`/store/${tienda.subdominio}/mis-pedidos`} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📦 Mis pedidos
                </a>
              </div>
            </div>

            {/* Columna 4 — Normas */}
            <div>
              <h4 style={{ margin: '0 0 14px', fontSize: '0.75rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Información legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="/cookie-policy" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>🍪 Política de Cookies</a>
                <a href="/privacy-policy" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>🔒 Política de Privacidad</a>
                <a href="/terminos" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>📄 Términos y Condiciones</a>
              </div>
              {/* Aviso datos */}
              <div style={{ marginTop: '16px', padding: '12px', background: '#1e293b', borderRadius: '10px', border: '1px solid #334155' }}>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', lineHeight: 1.6 }}>
                  🔐 <strong style={{ color: '#94a3b8' }}>Privacidad:</strong> Al realizar un pedido compartes tus datos únicamente con {tienda.nombre} para gestionar tu pedido. No se venden a terceros. Consulta nuestra política para más detalles.
                </p>
              </div>
            </div>
          </div>

          {/* Línea divisoria */}
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569' }}>
              © {new Date().getFullYear()} <strong style={{ color: '#64748b' }}>{tienda.nombre}</strong> · Todos los derechos reservados
            </p>
            <a href="https://tiendaonline.it" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                Desarrollado con <span style={{ color: '#60a5fa', fontWeight: 900 }}>TIENDAONLINE</span> 🛍️
              </p>
            </a>
          </div>
        </div>
      </footer>

      {/* ── CART DRAWER ─────────────────────────── */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setIsCartOpen(false)}>
          <div style={{ width: '100%', maxWidth: '420px', background: '#fff', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            {/* Head */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>🛒 Tu Carrito ({totalItems})</h2>
              <button onClick={() => setIsCartOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem', color: '#64748b' }}>✕</button>
            </div>
            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🛒</div>
                  <p style={{ fontWeight: 600 }}>El carrito está vacío</p>
                </div>
              ) : cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    {item.imagen_url ? <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (item.emoji || '📦')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</p>
                    <p style={{ margin: 0, fontWeight: 800, color: C.primary, fontSize: '0.95rem' }}>€{(parseFloat(item.price || item.precio) * item.quantity).toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => removeFromCart(item.id)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: `1.5px solid ${C.primary}`, background: '#fff', color: C.primary, fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer' }}>−</button>
                    <span style={{ fontWeight: 800, minWidth: '20px', textAlign: 'center', color: '#0f172a' }}>{item.quantity}</span>
                    <button onClick={() => addToCart(item)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: C.primary, color: '#fff', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer' }}>+</button>
                    <button onClick={() => removeItemFull(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: '1rem' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
            {/* Footer */}
            {cart.length > 0 && (
              <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                  <span>Total</span>
                  <span>€{totalProductos.toFixed(2)}</span>
                </div>
                <button onClick={() => { setIsCartOpen(false); setIsModalOpen(true) }} style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: C.primary, color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>
                  Finalizar pedido →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CHECKOUT MODAL ──────────────────────── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', padding: '32px 28px', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>
            {/* Progress */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
              {[1, 2].map(s => (
                <div key={s} style={{ height: '4px', flex: 1, borderRadius: '2px', background: checkoutStep >= s ? C.primary : '#e2e8f0', transition: 'background 0.3s' }} />
              ))}
            </div>

            {checkoutStep === 1 ? (
              <>
                <h2 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '1.3rem', fontWeight: 900 }}>Tus datos</h2>
                <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.88rem' }}>Completa tu información para el pedido.</p>

                <input type="text" placeholder="Tu nombre completo *" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' }} autoFocus />
                <input type="tel" placeholder="WhatsApp (ej: +39 340...)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: '0.95rem', marginBottom: '20px', boxSizing: 'border-box', outline: 'none' }} />

                <p style={{ margin: '0 0 10px', fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>¿Cómo quieres recibirlo?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {configEnvios.retiro?.habilitado !== false && (
                    <button onClick={() => setMetodoEnvio('retiro')} style={{ padding: '14px', borderRadius: '14px', textAlign: 'left', border: `2px solid ${metodoEnvio === 'retiro' ? C.primary : '#e2e8f0'}`, background: metodoEnvio === 'retiro' ? C.primary + '08' : 'transparent', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <span>🏪</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Retiro en local</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{configEnvios.retiro?.direccion}</div>
                      </div>
                    </button>
                  )}
                  {configEnvios.domicilio?.habilitado && (
                    <button onClick={() => setMetodoEnvio('domicilio')} style={{ padding: '14px', borderRadius: '14px', textAlign: 'left', border: `2px solid ${metodoEnvio === 'domicilio' ? C.primary : '#e2e8f0'}`, background: metodoEnvio === 'domicilio' ? C.primary + '08' : 'transparent', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <span>🛵</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Envío a domicilio</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Reparto en zonas disponibles</div>
                      </div>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                  <button disabled={!customerName.trim() || !customerPhone.trim() || !metodoEnvio} onClick={() => setCheckoutStep(2)} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: C.primary, color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: (!customerName.trim() || !customerPhone.trim() || !metodoEnvio) ? 0.5 : 1 }}>
                    Continuar →
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ margin: '0 0 20px', color: '#0f172a', fontSize: '1.3rem', fontWeight: 900 }}>Detalles finales</h2>
                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {metodoEnvio === 'domicilio' && (
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Zona de envío</p>
                      <select value={zonaSeleccionada?.id || ''} onChange={e => setZonaSeleccionada(configEnvios.domicilio.zonas.find(z => z.id.toString() === e.target.value))} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', marginBottom: '10px', outline: 'none', boxSizing: 'border-box' }}>
                        <option value="">Selecciona tu zona...</option>
                        {configEnvios.domicilio.zonas.map(z => <option key={z.id} value={z.id}>{z.nombre} (+€{z.costo.toFixed(2)})</option>)}
                      </select>
                      <textarea placeholder="Tu dirección completa..." value={direccionCliente} onChange={e => setDireccionCliente(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', height: '72px', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                    </div>
                  )}

                  <p style={{ margin: '0 0 10px', fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Método de pago</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                    {configPagos.efectivo?.habilitado !== false && (
                      <button onClick={() => setMetodoPago('efectivo')} style={{ padding: '12px', borderRadius: '12px', border: `2px solid ${metodoPago === 'efectivo' ? C.primary : '#e2e8f0'}`, background: metodoPago === 'efectivo' ? C.primary + '08' : 'transparent', fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', cursor: 'pointer' }}>
                        💵 Efectivo
                      </button>
                    )}
                    {configPagos.transferencia?.habilitado && (
                      <button onClick={() => setMetodoPago('transferencia')} style={{ padding: '12px', borderRadius: '12px', border: `2px solid ${metodoPago === 'transferencia' ? C.primary : '#e2e8f0'}`, background: metodoPago === 'transferencia' ? C.primary + '08' : 'transparent', fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', cursor: 'pointer' }}>
                        🏦 Transferencia
                      </button>
                    )}
                  </div>

                  {config.cupones?.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Cupón de descuento</p>
                      {cuponAplicado ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#dcfce7', color: '#15803d', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>
                          <span>✅ {cuponAplicado.codigo} (-€{discount.toFixed(2)})</span>
                          <button onClick={() => setCuponAplicado(null)} style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', fontWeight: 800 }}>✕</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" placeholder="Código de cupón..." value={cuponInput} onChange={e => { setCuponInput(e.target.value.toUpperCase()); setCuponError(null) }} style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: `1.5px solid ${cuponError ? '#ef4444' : '#e2e8f0'}`, background: '#f8fafc', outline: 'none', fontSize: '0.9rem' }} />
                          <button onClick={applyCupon} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: '12px', padding: '0 16px', fontWeight: 800, cursor: 'pointer' }}>Aplicar</button>
                        </div>
                      )}
                      {cuponError && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '6px 0 0', fontWeight: 600 }}>{cuponError}</p>}
                    </div>
                  )}

                  <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '14px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b', marginBottom: '6px' }}><span>Subtotal</span><span>€{totalProductos.toFixed(2)}</span></div>
                    {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#16a34a', marginBottom: '6px', fontWeight: 700 }}><span>Descuento</span><span>-€{discount.toFixed(2)}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px dashed #e2e8f0' }}><span>Envío</span><span>€{shippingCost.toFixed(2)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 900, color: '#0f172a' }}><span>Total</span><span>€{total.toFixed(2)}</span></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={() => setCheckoutStep(1)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>← Volver</button>
                  <button disabled={isSubmitting || (metodoEnvio === 'domicilio' && (!zonaSeleccionada || !direccionCliente)) || !metodoPago} onClick={processOrder} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: C.primary, color: '#fff', fontWeight: 800, cursor: 'pointer', opacity: (isSubmitting || (metodoEnvio === 'domicilio' && (!zonaSeleccionada || !direccionCliente)) || !metodoPago) ? 0.6 : 1 }}>
                    {isSubmitting ? '⏳ Enviando...' : 'Finalizar Pedido ✓'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── SUCCESS MODAL ───────────────────────── */}
      {successMessageOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '400px', padding: '32px 28px', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '1.4rem', fontWeight: 900 }}>¡Pedido enviado!</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{mensajePost}</p>
            <div style={{ margin: '20px 0 4px', background: 'linear-gradient(135deg, #f8f4ff 0%, #ede9fe 100%)', borderRadius: '16px', padding: '16px', border: '1.5px solid #ddd6fe', textAlign: 'left' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '0.85rem', color: '#5b21b6' }}>✨ ¿Quieres seguir tu pedido?</p>
              <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: '#7c3aed', lineHeight: 1.5 }}>Crea tu cuenta gratis y consulta el estado en tiempo real.</p>
              <a href={`/store/${tienda.subdominio}/cuenta`} style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '12px', textDecoration: 'none', background: '#7c3aed', color: '#fff', fontWeight: 800, fontSize: '0.85rem', textAlign: 'center', boxSizing: 'border-box' }}>
                Crear mi cuenta gratis →
              </a>
            </div>
            <button onClick={() => setSuccessMessageOpen(false)} style={{ marginTop: '12px', width: '100%', padding: '14px', borderRadius: '14px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ── ESTILOS ─────────────────────────────── */}
      <style jsx global>{`
        .hide-xs { display: none; }
        @media (min-width: 480px) { .hide-xs { display: inline; } }

        .store-sidebar { display: none; }
        @media (min-width: 768px) { .store-sidebar { display: flex !important; } }

        .store-product-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 480px) {
          .store-product-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
        @media (min-width: 640px) {
          .store-product-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }
        @media (min-width: 1024px) {
          .store-product-grid { grid-template-columns: repeat(4, 1fr); gap: 18px; }
        }

        .product-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .product-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          transform: translateY(-2px);
        }

        .product-img-wrap {
          position: relative;
          width: 100%;
          padding-top: 100%;
          background: #f8fafc;
          overflow: hidden;
        }
        .product-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        .product-card:hover .product-img { transform: scale(1.04); }
        .product-img-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          color: #cbd5e1;
        }

        .product-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 800;
        }
        .product-badge-stock {
          background: #fee2e2;
          color: #dc2626;
        }

        .product-info {
          padding: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .product-brand {
          margin: 0;
          font-size: 0.7rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .product-name {
          margin: 0;
          font-size: 0.88rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .product-desc {
          margin: 0;
          font-size: 0.75rem;
          color: #94a3b8;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .product-price {
          margin: 4px 0 8px;
          font-size: 1.05rem;
          font-weight: 900;
        }

        .btn-add {
          width: 100%;
          padding: 9px 0;
          border-radius: 10px;
          border: none;
          color: #fff;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
          margin-top: auto;
        }
        .btn-add:active { transform: scale(0.97); opacity: 0.9; }

        .qty-control {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 2px solid;
          border-radius: 10px;
          overflow: hidden;
          margin-top: auto;
        }
        .qty-btn-inline {
          background: none;
          border: none;
          padding: 8px 12px;
          font-size: 1.1rem;
          font-weight: 900;
          cursor: pointer;
          line-height: 1;
        }
        .qty-num {
          font-weight: 900;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  )
}
