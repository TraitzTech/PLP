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
    description: 'The easiest way to buy, rent, or sell property in Cameroon. Discover verified homes, land, and rentals.',
    keywords: 'property, real estate, booking, hotels, houses, land, rental',
    authors: [{ name: 'Property Listing Portal' }],
    icons: {
        icon: '/logo-images/PlpLisitng-Fav-Icon-8.png',
        shortcut: '/logo-images/PlpLisitng-Fav-Icon-8.png',
        apple: '/logo-images/PlpLisitng-Fav-Icon-8.png',
    },
    openGraph: {
        title: 'Property Listing Portal',
        description: 'The easiest way to buy, rent, or sell property in Cameroon.',
        siteName: 'Property Listing Portal',
        locale: 'en_US',
        type: 'website',
    },
};

import { SupportWidget } from '@/components/support/SupportWidget';
import { PushNotificationProvider } from '@/components/push-notification-provider';
import { MaintenanceWrapper } from '@/components/maintenance/maintenance-wrapper';

export default async function LocaleLayout({
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
        <div lang={validLocale} className={`${urbanist.variable} font-urbanist antialiased min-h-screen`}>
            <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
            >
                <TranslationProvider messages={messages}>
                    <PushNotificationProvider>
                        <MaintenanceWrapper>
                            {children}
                        </MaintenanceWrapper>
                    </PushNotificationProvider>
                    <SupportWidget />
                </TranslationProvider>
                <Toaster />
            </ThemeProvider>
        </div>
    );
}