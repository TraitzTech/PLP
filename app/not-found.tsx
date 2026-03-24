import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-plp-purple via-plp-pink to-plp-yellow p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-black/10 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
      </div>

      <Card className="relative z-10 w-full max-w-3xl border-0 shadow-2xl bg-white/95 backdrop-blur">
        <CardContent className="p-0">
          <div className="border-b border-gray-200 p-6 flex items-center justify-between">
            <Link href="/" className="transition-transform hover:scale-110">
              <Logo showText={false} className="w-8 h-8" disableLink />
            </Link>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Page Not Found</p>
          </div>

          <div className="p-10 md:p-12 text-center">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gray-600 bg-gray-100 rounded-full px-3 py-1 w-max mx-auto">
              <span className="w-2 h-2 rounded-full bg-plp-pink animate-pulse" />
              Error 404
            </p>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-gray-900">We could not find that page</h1>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              The page may have moved, the link may be outdated, or the URL may be incorrect.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              <Button asChild className="w-full btn-primary justify-center">
                <Link href="/en">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-center">
                <Link href="/en/search">
                  <Search className="w-4 h-4 mr-2" />
                  Search Properties
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
