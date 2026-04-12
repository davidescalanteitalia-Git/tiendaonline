import Link from 'next/link'

export const metadata = {
  title: '404 — Tienda no encontrada | TIENDAONLINE',
}

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: '24px',
    }}>
      {/* Dots decoration */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: '4px', height: '4px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            left: `${(i % 10) * 40}px`,
            top: `${Math.floor(i / 10) * 40}px`,
          }} />
        ))}
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '32px',
        padding: '60px 48px',
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Emoji */}
        <div style={{ fontSize: '72px', marginBottom: '16px', lineHeight: 1 }}>🏪</div>

        {/* 404 badge */}
        <div style={{
          display: 'inline-block',
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#6ee7b7',
          padding: '6px 18px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '24px',
        }}>
          Error 404
        </div>

        {/* Título */}
        <h1 style={{
          color: '#ffffff',
          fontSize: '2rem',
          fontWeight: '900',
          margin: '0 0 12px',
          lineHeight: 1.2,
          letterSpacing: '-0.5px',
        }}>
          Esta tienda no existe
        </h1>

        {/* Subtítulo */}
        <p style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '1rem',
          lineHeight: 1.6,
          margin: '0 0 40px',
        }}>
          El subdominio que buscas no está registrado en TIENDAONLINE.
          ¿Quieres crear tu propia tienda gratis en 10 minutos?
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link href="/register" style={{
            display: 'block',
            background: '#10b981',
            color: '#ffffff',
            padding: '16px 32px',
            borderRadius: '14px',
            textDecoration: 'none',
            fontWeight: '800',
            fontSize: '1rem',
            transition: 'all 0.2s',
            boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
          }}>
            🛍️ Crear mi tienda gratis →
          </Link>

          <Link href="/" style={{
            display: 'block',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
            padding: '14px 32px',
            borderRadius: '14px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.95rem',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            ← Volver al inicio
          </Link>
        </div>

        {/* Footer */}
        <p style={{
          color: 'rgba(255,255,255,0.25)',
          fontSize: '0.75rem',
          marginTop: '40px',
          marginBottom: 0,
          fontWeight: '500',
        }}>
          TIENDAONLINE · tiendaonline.it
        </p>
      </div>
    </div>
  )
}
