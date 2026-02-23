'use client'

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';

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
  const pathnameRef = useRef(pathname);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Keep ref in sync
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Only check auth once on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentPath = pathnameRef.current;
        const segments = currentPath.split('/').filter(Boolean);
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
          router.replace(`/${locale}/auth/signin?redirect=${encodeURIComponent(currentPath)}`);
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
        const currentPath = pathnameRef.current;
        const segments = currentPath.split('/').filter(Boolean);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, allowedRoles, redirectAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-plp-purple/5 via-white to-plp-pink/5 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-8 space-y-6">
          <div className="flex justify-center">
            <div className="h-10 w-32 bg-gray-200/60 rounded animate-pulse" />
          </div>
          <div className="bg-white/80 rounded-xl shadow-sm p-8 space-y-5">
            <div className="h-7 w-40 mx-auto bg-gray-200 rounded animate-pulse" />
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
