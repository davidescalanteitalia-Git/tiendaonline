import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)',
  ],
};

export default function middleware(req) {
  const url = req.nextUrl.clone();

  // x-tenant-host es un header personalizado enviado por el Cloudflare Worker.
  // Traefik NO sobreescribe headers personalizados, solo x-forwarded-*.
  // Fallback al host normal para accesos directos (Coolify/desarrollo).
  const hostname =
    req.headers.get('x-tenant-host') ||
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
    const response = NextResponse.rewrite(
      new URL(`/store/${currentHost}${url.pathname}`, req.url)
    );
    response.headers.set('x-debug-host', hostname);
    response.headers.set('x-debug-current-host', currentHost);
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('x-debug-host', hostname);
  return response;
}
