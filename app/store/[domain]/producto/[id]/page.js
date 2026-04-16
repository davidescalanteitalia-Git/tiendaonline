'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'

// ── Cart helpers via localStorage ──────────────────────────────────────────────
const CART_KEY_PREFIX = 'to_cart_'

function getCart(domain) {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(CART_KEY_PREFIX + domain) || '[]') } catch { return [] }
}
function saveCart(domain, cart) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY_PREFIX + domain, JSON.stringify(cart))
}
function addToCart(domain, product) {
  const cart = getCart(domain)
  const existing = cart.find(i => i.id === product.id)
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1
    saveCart(domain, cart)
    return cart
  }
  const newCart = [...cart, {
    id: product.id,
    nombre: product.nombre,
    precio: product.precio,
    price: product.precio,
    emoji: product.emoji,
    imagen_url: product.imagen_url,
    stock: product.stock,
    quantity: 1,
  }]
  saveCart(domain, newCart)
  return newCart
}
function getCartCount(domain) {
  return getCart(domain).reduce((s, i) => s + (i.quantity || 1), 0)
}

// ── Main Page Component ─────────────────────────────────────────────────────────
export default function ProductoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const domain = params.domain
  const id = params.id

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const [qty, setQty] = useState(1)
  const [imgError, setImgError] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    setCartCount(getCartCount(domain))
    // check if product already in cart
    const cart = getCart(domain)
    const inCart = cart.find(i => String(i.id) === String(id))
    if (inCart) { setAddedToCart(true); setQty(inCart.quantity || 1) }
  }, [domain, id])

  useEffect(() => {
    if (!domain || !id) return
    setLoading(true)
    fetch(`/api/store/${domain}/producto/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setLoading(false); return }
        setData(d)
        setSelectedImage(d.producto?.imagen_url || null)
        setLoading(false)
      })
      .catch(() => { setError('Error cargando producto'); setLoading(false) })
  }, [domain, id])

  const handleAddToCart = useCallback(() => {
    if (!data?.producto) return
    addToCart(domain, data.producto)
    setAddedToCart(true)
    setCartCount(getCartCount(domain))
    // small bounce animation flag
    setTimeout(() => {}, 300)
  }, [data, domain])

  const handleQtyChange = useCallback((delta) => {
    if (!data?.producto) return
    const cart = getCart(domain)
    const item = cart.find(i => String(i.id) === String(id))
    if (!item) return
    const newQty = Math.max(1, (item.quantity || 1) + delta)
    if (delta > 0 && data.producto.stock !== null && newQty > data.producto.stock) return
    item.quantity = newQty
    saveCart(domain, cart)
    setQty(newQty)
    setCartCount(getCartCount(domain))
  }, [data, domain, id])

  const handleGoToCart = () => {
    router.push(`/store/${domain}?openCart=1`)
  }

  const C = data?.tienda
    ? {
        primary: data.tienda.config_diseno?.color_principal || data.tienda.color_principal || '#2563EB',
        white: '#ffffff',
        text: '#0f172a',
        textMuted: '#64748b',
        grayBg: '#f8fafc',
        grayBorder: '#e2e8f0',
      }
    : { primary: '#2563EB', white: '#fff', text: '#0f172a', textMuted: '#64748b', grayBg: '#f8fafc', grayBorder: '#e2e8f0' }

  // ── Loading state ────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `4px solid #e2e8f0`, borderTopColor: '#2563EB', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Cargando producto…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <div style={{ fontSize: '3rem' }}>😕</div>
        <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem' }}>Producto no encontrado</p>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{error}</p>
        <button onClick={() => router.push(`/store/${domain}`)} style={{ padding: '10px 24px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
          ← Volver al catálogo
        </button>
      </div>
    )
  }

  const { producto, tienda, categoria, relacionados } = data
  const outOfStock = producto.stock !== null && producto.stock <= 0
  const hasImage = (selectedImage || producto.emoji) && !imgError
  const configDiseno = tienda.config_diseno || {}

  return (
    <div style={{ minHeight: '100vh', background: C.grayBg, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: C.white, borderBottom: `1px solid ${C.grayBorder}`,
        padding: '0 20px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <button
          onClick={() => router.push(`/store/${domain}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.text, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', padding: '6px 0' }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {tienda.logo_url
              ? <img src={tienda.logo_url} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} alt="Logo" />
              : <span style={{ fontSize: '1.1rem' }}>{tienda.emoji || '🏪'}</span>
            }
            <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tienda.nombre}</span>
          </span>
        </button>

        {/* Cart button */}
        <button
          onClick={handleGoToCart}
          style={{
            position: 'relative', display: 'flex', alignItems: 'center', gap: 6,
            background: cartCount > 0 ? C.primary : C.grayBg,
            color: cartCount > 0 ? C.white : C.textMuted,
            border: `1.5px solid ${cartCount > 0 ? C.primary : C.grayBorder}`,
            borderRadius: 24, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            transition: 'all 0.2s',
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          {cartCount > 0
            ? <span>Ver pedido · {cartCount}</span>
            : <span>Carrito</span>
          }
        </button>
      </nav>

      {/* ── Main Content ───────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 48px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: C.textMuted, marginBottom: 20 }}>
          <button onClick={() => router.push(`/store/${domain}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.primary, fontWeight: 500, padding: 0 }}>
            Catálogo
          </button>
          <span>›</span>
          {categoria && (
            <>
              <span style={{ color: C.textMuted }}>{categoria.emoji} {categoria.nombre}</span>
              <span>›</span>
            </>
          )}
          <span style={{ color: C.text, fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{producto.nombre}</span>
        </div>

        {/* Product card grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 24,
        }}
          className="product-detail-grid"
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 24,
          }} className="product-detail-inner">

            {/* Image */}
            <div style={{
              background: C.white, borderRadius: 20, overflow: 'hidden',
              border: `1px solid ${C.grayBorder}`,
              aspectRatio: '1 / 1', maxHeight: 440,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              {outOfStock && (
                <div style={{
                  position: 'absolute', top: 12, left: 12,
                  background: 'rgba(0,0,0,0.6)', color: '#fff',
                  borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700,
                  zIndex: 1,
                }}>
                  Sin stock
                </div>
              )}
              {selectedImage && !imgError ? (
                <img
                  src={selectedImage}
                  alt={producto.nombre}
                  onError={() => setImgError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '5rem', lineHeight: 1 }}>{producto.emoji || '📦'}</span>
              )}
            </div>

            {/* Info panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Category badge */}
              {categoria && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: `${C.primary}15`, color: C.primary,
                  borderRadius: 20, padding: '4px 12px', fontSize: '0.78rem', fontWeight: 600,
                  width: 'fit-content',
                }}>
                  {categoria.emoji} {categoria.nombre}
                </span>
              )}

              {/* Name */}
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: C.text, lineHeight: 1.25 }}>
                {producto.nombre}
              </h1>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: C.primary }}>
                  {configDiseno.moneda || '€'}{parseFloat(producto.precio).toFixed(2)}
                </span>
                {producto.precio_antes && (
                  <span style={{ fontSize: '1rem', color: C.textMuted, textDecoration: 'line-through' }}>
                    {configDiseno.moneda || '€'}{parseFloat(producto.precio_antes).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock indicator */}
              {producto.stock !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: outOfStock ? '#ef4444' : producto.stock <= 5 ? '#f59e0b' : '#22c55e',
                  }} />
                  <span style={{ fontSize: '0.82rem', color: C.textMuted, fontWeight: 500 }}>
                    {outOfStock
                      ? 'Sin stock disponible'
                      : producto.stock <= 5
                        ? `Solo quedan ${producto.stock} unidades`
                        : `${producto.stock} disponibles`
                    }
                  </span>
                </div>
              )}

              {/* Description */}
              {producto.descripcion && (
                <div style={{
                  background: C.grayBg, borderRadius: 12, padding: 16,
                  border: `1px solid ${C.grayBorder}`,
                }}>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: C.textMuted, lineHeight: 1.65 }}>
                    {producto.descripcion}
                  </p>
                </div>
              )}

              {/* Barcode / SKU */}
              {producto.codigo_barras && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: C.textMuted, fontWeight: 500 }}>SKU / Código:</span>
                  <span style={{ fontSize: '0.75rem', color: C.text, fontFamily: 'monospace', background: C.grayBg, padding: '2px 8px', borderRadius: 6, border: `1px solid ${C.grayBorder}` }}>
                    {producto.codigo_barras}
                  </span>
                </div>
              )}

              {/* ── Add to Cart ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {!addedToCart ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={outOfStock}
                    style={{
                      padding: '16px 24px', borderRadius: 16, border: 'none',
                      background: outOfStock ? '#e2e8f0' : C.primary,
                      color: outOfStock ? '#94a3b8' : C.white,
                      fontSize: '1rem', fontWeight: 700, cursor: outOfStock ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.15s',
                      boxShadow: outOfStock ? 'none' : `0 4px 20px ${C.primary}40`,
                    }}
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* Qty control */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 0,
                      border: `2px solid ${C.primary}`, borderRadius: 14,
                      overflow: 'hidden', height: 52, flex: 1,
                    }}>
                      <button onClick={() => handleQtyChange(-1)} style={{ width: 48, height: '100%', background: 'none', border: 'none', color: C.primary, fontSize: '1.4rem', fontWeight: 700, cursor: 'pointer' }}>−</button>
                      <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', color: C.text }}>{qty}</span>
                      <button onClick={() => handleQtyChange(+1)} disabled={producto.stock !== null && qty >= producto.stock} style={{ width: 48, height: '100%', background: 'none', border: 'none', color: C.primary, fontSize: '1.4rem', fontWeight: 700, cursor: 'pointer', opacity: producto.stock !== null && qty >= producto.stock ? 0.4 : 1 }}>+</button>
                    </div>
                    {/* Go to cart */}
                    <button
                      onClick={handleGoToCart}
                      style={{
                        flex: 2, padding: '14px 20px', borderRadius: 14, border: `2px solid ${C.primary}`,
                        background: C.primary, color: C.white,
                        fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      Ver pedido
                    </button>
                  </div>
                )}

                {/* WhatsApp direct inquiry */}
                {tienda.whatsapp && (
                  <a
                    href={`https://wa.me/${tienda.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola! Me interesa el producto: *${producto.nombre}* (${configDiseno.moneda || '€'}${parseFloat(producto.precio).toFixed(2)}). ¿Está disponible?`)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      padding: '14px 24px', borderRadius: 16,
                      border: `1.5px solid #25D366`,
                      background: '#f0fdf4', color: '#15803d',
                      fontSize: '0.92rem', fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      textDecoration: 'none', transition: 'all 0.15s',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Consultar por WhatsApp
                  </a>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ── Related Products ─────────────────────────────── */}
        {relacionados && relacionados.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '1.2rem', fontWeight: 800, color: C.text }}>
              {categoria ? `Más de "${categoria.nombre}"` : 'Productos relacionados'}
            </h2>
            <div style={{
              display: 'grid',
              gap: 14,
            }} className="related-grid">
              {relacionados.slice(0, 8).map(rel => {
                const relOutOfStock = rel.stock !== null && rel.stock <= 0
                return (
                  <div
                    key={rel.id}
                    onClick={() => !relOutOfStock && router.push(`/store/${domain}/producto/${rel.id}`)}
                    style={{
                      background: C.white, borderRadius: 14,
                      border: `1px solid ${C.grayBorder}`,
                      overflow: 'hidden', cursor: relOutOfStock ? 'default' : 'pointer',
                      opacity: relOutOfStock ? 0.6 : 1,
                      transition: 'all 0.2s',
                      display: 'flex', flexDirection: 'column',
                    }}
                    onMouseEnter={e => { if (!relOutOfStock) e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    {/* Image */}
                    <div style={{ aspectRatio: '1/1', background: C.grayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {rel.imagen_url
                        ? <img src={rel.imagen_url} alt={rel.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '2rem' }}>{rel.emoji || '📦'}</span>
                      }
                    </div>
                    {/* Info */}
                    <div style={{ padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: C.text, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {rel.nombre}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: C.primary }}>
                        {configDiseno.moneda || '€'}{parseFloat(rel.precio).toFixed(2)}
                      </p>
                      {relOutOfStock && (
                        <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>Sin stock</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── CSS ─────────────────────────────────────────────── */}
      <style>{`
        * { box-sizing: border-box; }

        /* Product detail: side-by-side on desktop */
        @media (min-width: 768px) {
          .product-detail-inner {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        /* Related grid */
        .related-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
        @media (min-width: 480px) {
          .related-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 768px) {
          .related-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .related-grid { grid-template-columns: repeat(5, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
