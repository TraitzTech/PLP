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
        // Skip all internal paths (_next, api, static files)
        '/((?!_next|api|.*\\..*).*)',
    ],
};