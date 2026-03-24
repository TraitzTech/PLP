import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'horizontal' | 'vertical' | 'mark-only';
  /** Use 'dark' theme for dark backgrounds (e.g., footer) */
  theme?: 'light' | 'dark';
  /** Render as plain content (no internal Link) when parent already provides navigation */
  disableLink?: boolean;
}

/**
 * Logo component using real brand images from /logo-images/
 *
 * Image variants:
 * - Full-Blk: Full logo with "Property Listing Portal" text (dark)
 * - Half_Blk: Compact logo with "plp" text (dark)
 * - Half_White: Compact logo with "plp" text (white, for dark bgs)
 * - Fav-Icon: Just the icon mark
 * - Profile: Icon in a circle (for avatars)
 */
export function Logo({ className = '', showText = true, variant = 'horizontal', theme, disableLink = false }: LogoProps) {
  // Auto-detect dark theme from className if not explicitly set
  const isDark = theme === 'dark' || className.includes('text-white');

  // Select the appropriate image based on variant and theme
  const getLogoSrc = () => {
    if (variant === 'mark-only') {
      return '/logo-images/Plp-NewLogo.svg';
    }
    if (!showText) {
      return isDark
        ? '/logo-images/PlpLisitng-Half_White.svg'
        : '/logo-images/PlpLisitng-Half_Blk.svg';
    }
    // showText=true: use full logo for light, compact white for dark (no full-white variant exists)
    return isDark
      ? '/logo-images/PlpLisitng-Half_White.svg'
      : '/logo-images/Plp-NewLogo.svg';
  };

  const getLogoDimensions = () => {
    if (variant === 'mark-only') {
      return { width: 40, height: 40 };
    }
    if (!showText || isDark) {
      return { width: 100, height: 40 };
    }
    // Full logo with text
    return { width: 180, height: 45 };
  };

  const src = getLogoSrc();
  const { width, height } = getLogoDimensions();
  const wrapperClass = `flex items-center ${variant === 'vertical' ? 'flex-col text-center' : ''} ${className}`;

  if (disableLink) {
    return (
      <div className={wrapperClass}>
        <Image
          src={src}
          alt="Property Listing Portal"
          width={width}
          height={height}
          className="object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <Link
      href="/"
      className={wrapperClass}
    >
      <Image
        src={src}
        alt="Property Listing Portal"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </Link>
  );
}