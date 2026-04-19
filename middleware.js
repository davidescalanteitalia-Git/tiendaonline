import { NextResponse } from 'next/server';
import { withAxiom } from 'next-axiom';

export const config = {
  matcher: [
    // Excluimos api, archivos estáticos, imágenes y assets — solo rutas de página
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.webp).*)',
  ],
};

export default withAxiom(function middleware(req) {
  const url = req.nextUrl.clone();

  // Leemos el host en orden de prioridad:
  // 1. x-tenant-host  → enviado por el Cloudflare Worker para subdominios (*.tiendaonline.it)
  // 2. x-forwarded-host → enviado por Traefik/Coolify como proxy
  // 3. host → valor por defecto del servidor
  let hostname =
    req.headers.get('x-tenant-host') ||
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    'tiendaonline.it';

  hostname = hostname.split(':')[0].toLowerCase();

  const rootDomains = [
    'tiendaonline.it',
    'www.tiendaonline.it',
    'localhost',
  ];

  const isSubdomain = !rootDomains.includes(hostname);

  let currentHost = null;

  if (isSubdomain) {
    // Si es un subdominio, extraemos la parte del subdominio
    // ej: prueba.tiendaonline.it -> prueba
    if (hostname.endsWith('.tiendaonline.it')) {
      currentHost = hostname.replace('.tiendaonline.it', '');
    } else {
      // Caso localhost o subdominios raros
      currentHost = hostname.split('.')[0];
    }
  }

  // Redirige subdominios → /store/[subdominio]
  if (currentHost && currentHost !== 'www' && currentHost !== 'localhost') {
    // Evitamos bucles infinitos si la URL ya empieza por /store
    if (!url.pathname.startsWith('/store')) {
      const rewriteUrl = new URL(`/store/${currentHost}${url.pathname}`, req.url);
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  return NextResponse.next();
})
