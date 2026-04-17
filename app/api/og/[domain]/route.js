import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function GET(request, { params }) {
  const { domain } = params

  try {
    // En Edge Runtime usamos el cliente anon (datos de tiendas son públicos via RLS)
    // No usamos getSupabaseAdmin (singleton Node.js) porque no es compatible con Edge Runtime
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data: tienda } = await supabase
      .from('tiendas')
      .select('nombre, descripcion, emoji, logo_url, whatsapp, config_diseno')
      .eq('subdominio', domain)
      .single()

    const nombre = tienda?.nombre || 'Mi Tienda'
    const descripcion = tienda?.descripcion || 'Bienvenido a nuestra tienda online'
    const emoji = tienda?.emoji || '🏪'
    const colorPrincipal = tienda?.config_diseno?.color_principal || '#2563EB'
    const logoUrl = tienda?.logo_url || null

    // Generar la imagen OG
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            background: '#0f172a',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Fondo con gradiente dinámico al color de la tienda */}
          <div
            style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: colorPrincipal,
              opacity: 0.15,
              filter: 'blur(80px)',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-80px',
              left: '-80px',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: colorPrincipal,
              opacity: 0.1,
              filter: 'blur(80px)',
              display: 'flex',
            }}
          />

          {/* Contenido principal */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              padding: '80px',
              height: '100%',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Logo o Emoji */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                height: '120px',
                borderRadius: '32px',
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.12)',
                marginBottom: '40px',
                overflow: 'hidden',
              }}
            >
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={nombre}
                  width={120}
                  height={120}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '64px' }}>{emoji}</span>
              )}
            </div>

            {/* Nombre de la tienda */}
            <div
              style={{
                fontSize: '72px',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.1,
                marginBottom: '20px',
                maxWidth: '800px',
              }}
            >
              {nombre}
            </div>

            {/* Descripción */}
            {descripcion && (
              <div
                style={{
                  fontSize: '28px',
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '48px',
                  maxWidth: '700px',
                  lineHeight: 1.4,
                }}
              >
                {descripcion.length > 80 ? descripcion.slice(0, 80) + '…' : descripcion}
              </div>
            )}

            {/* Badge TIENDAONLINE */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '100px',
                padding: '12px 24px',
              }}
            >
              <span style={{ fontSize: '22px' }}>🛍️</span>
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.8)',
                  letterSpacing: '0.05em',
                }}
              >
                tiendaonline.it
              </span>
            </div>
          </div>

          {/* Barra de color de acento derecha */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: '8px',
              height: '100%',
              background: colorPrincipal,
              display: 'flex',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (err) {
    // Fallback: imagen genérica si la tienda no existe
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <span style={{ fontSize: '80px' }}>🛍️</span>
            <span style={{ fontSize: '48px', fontWeight: 900, color: '#fff' }}>TIENDAONLINE</span>
            <span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.5)' }}>tiendaonline.it</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }
}
