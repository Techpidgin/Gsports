import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isCountryBlocked } from '@/lib/geo';

/**
 * Geo-blocking: redirect users from restricted countries to /geo.
 * Country is set by Vercel (x-vercel-ip-country) or by the platform's request.geo.
 * Locally, no geo header is present so all traffic is allowed.
 * @see https://vercel.com/docs/headers/request-headers (x-vercel-ip-country)
 * @see https://bookmakerxyz.app/geo (case study)
 */
export function middleware(request: NextRequest) {
  const country =
    request.geo?.country ?? request.headers.get('x-vercel-ip-country') ?? null;

  if (isCountryBlocked(country)) {
    if (request.nextUrl.pathname === '/geo') return NextResponse.next();
    return NextResponse.redirect(new URL('/geo', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on all pathnames except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|favicon.png|logo.png|.*\\.(?:ico|png|svg|webp)$).*)',
  ],
};
