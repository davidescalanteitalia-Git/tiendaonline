import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)',
  ],
};

export default function middleware(req) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || 'tiendaonline.it';

  const rootDomains = ['tiendaonline.it', 'www.tiendaonline.it', 'localhost:3000'];
  const isSubdomain = !rootDomains.includes(hostname);

  let currentHost;
  
  if (process.env.NODE_ENV === 'development' && hostname.includes('localhost')) {
     if(hostname.split('.')[0] !== 'localhost' && isSubdomain) {
        currentHost = hostname.split('.')[0];
     }
  } else if (isSubdomain) {
     currentHost = hostname.replace(`.tiendaonline.it`, '');
  }

  // Rewrite standard subdomain requests to the dynamic path /store/[domain]
  if (currentHost && currentHost !== 'www') {
    return NextResponse.rewrite(new URL(`/store/${currentHost}${url.pathname}`, req.url));
  }

  return NextResponse.next();
}
