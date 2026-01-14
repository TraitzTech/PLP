import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'fr'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
    // Check if locale is in pathname
    const pathname = request.nextUrl.pathname;
    const pathnameLocale = locales.find(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameLocale) return pathnameLocale;

    // Check Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
        const preferredLocale = acceptLanguage
            .split(',')
            .map((lang) => lang.split(';')[0].trim().toLowerCase())
            .find((lang) => locales.includes(lang.split('-')[0]));

        if (preferredLocale) {
            return preferredLocale.split('-')[0];
        }
    }

    return defaultLocale;
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // CRITICAL: Don't intercept Next.js internal requests or RSC payloads
    // These headers indicate RSC (React Server Components) requests
    const isRSC = request.headers.get('RSC') === '1' || 
                  request.headers.get('Next-Router-State-Tree') !== null ||
                  request.headers.get('Next-Router-Prefetch') !== null;
    
    // Let RSC payloads and Next.js internal requests pass through
    if (isRSC) {
        return NextResponse.next();
    }

    // Skip static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Check if pathname already has a locale
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) {
        return NextResponse.next();
    }

    // Redirect to locale-prefixed path
    const locale = getLocale(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);

    // Preserve search params
    newUrl.search = request.nextUrl.search;

    return NextResponse.redirect(newUrl);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files with extensions
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next/data).*)',
    ],
};