import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'horizontal' | 'vertical' | 'mark-only';
}

export function Logo({ className = '', showText = true, variant = 'horizontal' }: LogoProps) {
  const logoMark = (
    <div className="flex items-center gap-0">
      {/* Three stacked rounded rectangles representing Hotels, Houses, Lands */}
      <div className="relative">
        <div className="w-6 h-8 bg-plp-purple rounded-lg transform -rotate-12 relative z-10"></div>
        <div className="w-6 h-8 bg-plp-pink rounded-lg transform -rotate-6 absolute top-0 left-1 z-20"></div>
        <div className="w-6 h-8 bg-plp-yellow rounded-lg transform rotate-0 absolute top-0 left-2 z-30"></div>
      </div>
    </div>
  );

  const logoText = (
    <div className="font-urbanist font-bold">
      <span className="text-plp-purple">Property</span>
      <br className={variant === 'vertical' ? 'block' : 'hidden'} />
      <span className={variant === 'vertical' ? '' : ' '}>
        <span className="text-plp-pink">Listing</span>{' '}
        <span className="text-plp-yellow">Portal</span>
      </span>
    </div>
  );

  if (variant === 'mark-only') {
    return (
      <Link href="/" className={`flex items-center ${className}`}>
        {logoMark}
      </Link>
    );
  }

  return (
    <Link 
      href="/" 
      className={`flex items-center gap-3 ${variant === 'vertical' ? 'flex-col text-center' : ''} ${className}`}
    >
      {logoMark}
      {showText && (
        <div className={`text-lg ${variant === 'vertical' ? 'text-center' : ''}`}>
          {logoText}
        </div>
      )}
    </Link>
  );
}