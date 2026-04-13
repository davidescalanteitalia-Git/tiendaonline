import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    // Excluimos api, archivos estáticos, imágenes y assets — solo rutas de página
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.webp).*)',
  ],
};

export default function middleware(req) {
  const url = req.nextUrl.clone();

  // Leemos el host: primero x-forwarded-host (enviado por Cloudflare Worker),
  // luego host normal. Limpiamos el puerto si viene incluido.
  let hostname =
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

  // Debug headers para ver en el navegador
  const headers = new Headers(req.headers);
  headers.set('x-debug-hostname-detected', hostname);
  headers.set('x-debug-is-subdomain', isSubdomain.toString());
  headers.set('x-debug-current-host', currentHost || 'none');

  // Redirige subdominios → /store/[subdominio]
  if (currentHost && currentHost !== 'www' && currentHost !== 'localhost') {
    // Evitamos bucles infinitos si la URL ya empieza por /store
    if (!url.pathname.startsWith('/store')) {
      const rewriteUrl = new URL(`/store/${currentHost}${url.pathname}`, req.url);
      console.log(`Middleware Rewrite: ${hostname} -> ${rewriteUrl.pathname}`);
      const response = NextResponse.rewrite(rewriteUrl);
      response.headers.set('x-debug-final-path', rewriteUrl.pathname);
      return response;
    }
  }

  return NextResponse.next();
}
