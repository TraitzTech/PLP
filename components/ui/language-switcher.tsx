'use client'

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';
import { useTranslations } from '@/components/translation-provider';

type Language = {
  code: string;
  name: string;
  flag: string;
};

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export function LanguageSwitcher() {
  const t = useTranslations();
  const pathname = usePathname() || '/';
  const router = useRouter();

  // determine current code from path
  const parts = pathname.split('/').filter(Boolean);
  const currentCode = parts.length > 0 && ['en', 'fr'].includes(parts[0]) ? parts[0] : 'en';

  const handleLanguageChange = (lang: Language) => {
    // preserve current path and query but prefix with selected locale
    const rest = parts.length > 0 && ['en', 'fr'].includes(parts[0]) ? parts.slice(1) : parts;
    const newPath = `/${lang.code}/${rest.join('/')}`.replace(/\/\/$/, '/');
    // navigate
    router.push(newPath === '/' ? `/${lang.code}` : newPath);
  };

  const currentLang = languages.find((l) => l.code === currentCode) ?? languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <span className="mr-2">{currentLang.flag}</span>
          <Globe className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{t('nav.selectLanguage','Select Language')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
            {currentLang.code === language.code && (
              <Check className="w-4 h-4 text-plp-purple" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}