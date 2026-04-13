import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)',
  ],
};

export default function middleware(req) {
  const url = req.nextUrl.clone();

  // X-Forwarded-Host es enviado por el Cloudflare Worker cuando
  // un subdominio (ej: prueba.tiendaonline.it) es redirigido a tiendaonline.it.
  // Si no existe, usamos el Host normal (acceso directo al subdominio via Traefik).
  const hostname =
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    'tiendaonline.it';

  const rootDomains = [
    'tiendaonline.it',
    'www.tiendaonline.it',
    'localhost:3000',
  ];

  const isSubdomain = !rootDomains.includes(hostname);

  let currentHost;

  if (process.env.NODE_ENV === 'development' && hostname.includes('localhost')) {
    if (hostname.split('.')[0] !== 'localhost' && isSubdomain) {
      currentHost = hostname.split('.')[0];
    }
  } else if (isSubdomain) {
    currentHost = hostname.replace('.tiendaonline.it', '');
  }

  // Redirige subdominios → /store/[subdominio]
  if (currentHost && currentHost !== 'www') {
    return NextResponse.rewrite(
      new URL(`/store/${currentHost}${url.pathname}`, req.url)
    );
  }

  return NextResponse.next();
}
