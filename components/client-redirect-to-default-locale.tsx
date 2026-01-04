'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const DEFAULT_LOCALE = 'en';
const SUPPORTED = ['en', 'fr'];

export default function ClientRedirectToDefaultLocale() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) return;

    // If root or no locale segment, redirect to default
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) {
      router.replace(`/${DEFAULT_LOCALE}`);
      return;
    }

    if (!SUPPORTED.includes(parts[0])) {
      // preserve path but prefix with default
      router.replace(`/${DEFAULT_LOCALE}${pathname}`);
      return;
    }
  }, [pathname, router]);

  return null;
}

