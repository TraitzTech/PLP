import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import ClientRedirectToDefaultLocale from '@/components/client-redirect-to-default-locale';

const urbanist = Urbanist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-urbanist',
  fallback: ['system-ui', 'arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Property Listing Portal',
  description: 'Your Dream Property Awaits',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${urbanist.variable} font-urbanist antialiased`}>
        {/* Redirect any non-localized path to default locale. Middleware also handles this. */}
        <ClientRedirectToDefaultLocale />
        {children}
      </body>
    </html>
  );
}
