import './globals.css';
import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const urbanist = Urbanist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-urbanist',
});

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${urbanist.variable} font-urbanist antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}