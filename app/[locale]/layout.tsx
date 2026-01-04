import './globals.css';
import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TranslationProvider } from '@/components/translation-provider';
import { getMessages, Locale } from "@/lib/i18n";

const urbanist = Urbanist({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-urbanist',
});

export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'fr' }];
}

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
    title: 'Property Listing Portal - Your Dream Property Awaits',
    description: 'Discover, book, and manage properties with ease. The trusted bridge for seamless property listing, booking, and discovery.',
    keywords: 'property, real estate, booking, hotels, houses, land, rental',
    authors: [{ name: 'Property Listing Portal' }],
    openGraph: {
        title: 'Property Listing Portal',
        description: 'Your Dream Property Awaits',
        siteName: 'Property Listing Portal',
        locale: 'en_US',
        type: 'website',
    },
};

import { SupportWidget } from '@/components/support/SupportWidget';

export default async function RootLayout({
                                             children,
                                             params
                                         }: {
    children: React.ReactNode;
    params: Promise<{ locale: Locale }>;
}) {
    const { locale } = await params;
    const validLocale = locale === 'fr' ? 'fr' : 'en';
    const messages = await getMessages(validLocale);

    return (
        <html lang={validLocale} suppressHydrationWarning>
        <body className={`${urbanist.variable} font-urbanist antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
            <TranslationProvider messages={messages}>
                {children}
                <SupportWidget />
            </TranslationProvider>
            <Toaster />
        </ThemeProvider>
        </body>
        </html>
    );
}