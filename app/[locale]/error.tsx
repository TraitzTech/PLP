'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { useTranslations } from '@/components/translation-provider';
import { Home, AlertTriangle, RefreshCw, LayoutGrid } from 'lucide-react';
import { authService } from '@/services/authService';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale || 'en').toLowerCase() === 'fr' ? 'fr' : 'en';
  const router = useRouter();
  const t = useTranslations();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userType, setUserType] = React.useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        setIsAuthenticated(authenticated);
        if (authenticated) {
          const user = await authService.getCurrentUser();
          setUserType(user?.user_type ?? null);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const getDashboardLink = () => {
    switch (userType) {
      case 'admin':
        return `/${locale}/admin`;
      case 'agent':
        return `/${locale}/dashboard/agent`;
      default:
        return `/${locale}/dashboard`;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-plp-purple via-plp-pink to-plp-yellow p-6">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-black/10 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
      </div>

      <Card className="relative z-10 w-full max-w-4xl border-0 shadow-2xl bg-white/95 backdrop-blur">
        <CardContent className="p-0">
          {/* Header with Logo */}
          <div className="border-b border-gray-200 p-6 flex items-center justify-between">
            <Link href={`/${locale}`}>
              <Logo showText={false} className="w-8 h-8" disableLink />
            </Link>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {t('errors.errorOccurred', 'Error Occurred')}
            </p>
          </div>

          <div className="p-10 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Illustration */}
              <div className="relative order-2 md:order-1">
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img
                    src="https://images.pexels.com/photos/3483098/pexels-photo-3483098.jpeg"
                    alt="Error"
                    className="w-full h-64 md:h-80 object-cover"
                  />
                  {/* Animated alert icon */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg">
                    <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="order-1 md:order-2 flex flex-col justify-center space-y-6">
                <div>
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gray-600 bg-gray-100 rounded-full px-3 py-1 w-max mb-4">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    {t('errors.error', 'Error')}
                  </p>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                    {t('errors.somethingWentWrong', "Oops! Something went wrong")}
                  </h1>
                  <p className="text-lg text-gray-600">
                    {error?.message || t('errors.unexpectedError', 'An unexpected error occurred. Please try again.')}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={reset}
                    className="flex items-center gap-2 bg-plp-purple hover:bg-plp-purple/90"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t('errors.tryAgain', 'Try Again')}
                  </Button>

                  <Button asChild variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                    <Link href={`/${locale}`}>
                      <Home className="w-4 h-4" />
                      {t('nav.home', 'Home')}
                    </Link>
                  </Button>

                  {isAuthenticated && (
                    <Button asChild variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                      <Link href={getDashboardLink()}>
                        <LayoutGrid className="w-4 h-4" />
                        {t('nav.dashboard', 'Dashboard')}
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Helpful text */}
                <p className="text-sm text-gray-500 pt-2">
                  {t('errors.needHelp', "Need help?")} {' '}
                  <Link href={`/${locale}/help`} className="text-plp-purple hover:underline font-medium">
                    {t('help.badge', 'Contact Support')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
