'use client'

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'agent' | 'customer')[];
  redirectAuthenticated?: boolean; // For auth pages (signin/signup)
}

export function AuthGuard({ 
  children, 
  allowedRoles,
  redirectAuthenticated = false 
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const segments = pathname.split('/').filter(Boolean);
        const locale = segments[0] || 'en';

        const isAuthenticated = await authService.isAuthenticated();
        
        // For auth pages (signin/signup) - redirect if already authenticated
        if (redirectAuthenticated) {
          if (isAuthenticated) {
            const user = await authService.getCurrentUser?.();
            
            // Redirect based on user type
            if (user?.user_type === 'admin') {
              router.replace(`/${locale}/admin`);
            } else if (user?.user_type === 'agent') {
              router.replace(`/${locale}/dashboard/agent`);
            } else {
              router.replace(`/${locale}/dashboard`);
            }
            return;
          }
          // Not authenticated, can access auth pages
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // For protected pages - check if authenticated
        if (!isAuthenticated) {
          router.replace(`/${locale}/auth/signin?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        // Check role-based access if roles are specified
        if (allowedRoles && allowedRoles.length > 0) {
          const user = await authService.getCurrentUser?.();
          
          if (!user || !user.user_type) {
            router.replace(`/${locale}/auth/signin`);
            return;
          }

          if (!allowedRoles.includes(user.user_type as 'admin' | 'agent' | 'customer')) {
            // User doesn't have permission - redirect to their appropriate dashboard
            if (user.user_type === 'admin') {
              router.replace(`/${locale}/admin`);
            } else if (user.user_type === 'agent') {
              router.replace(`/${locale}/dashboard/agent`);
            } else {
              router.replace(`/${locale}/dashboard`);
            }
            return;
          }
        }

        // User is authenticated and authorized
        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        const segments = pathname.split('/').filter(Boolean);
        const locale = segments[0] || 'en';
        
        if (!redirectAuthenticated) {
          router.replace(`/${locale}/auth/signin`);
        } else {
          setIsAuthorized(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, allowedRoles, redirectAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-plp-purple/5 via-white to-plp-pink/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-plp-purple" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
