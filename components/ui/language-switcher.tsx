'use client'

import React, { useState, useEffect } from 'react';
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
  const [currentLang, setCurrentLang] = useState(languages[0]);

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      const lang = languages.find(l => l.code === savedLang);
      if (lang) {
        setCurrentLang(lang);
        updateContent(lang.code);
      }
    }
  }, []);

  const updateContent = (langCode: string) => {
    // Update hero section
    const heroTitle = document.querySelector('[data-hero-title]');
    const heroSubtitle = document.querySelector('[data-hero-subtitle]');
    const heroDescription = document.querySelector('[data-hero-description]');
    
    if (heroTitle && heroSubtitle && heroDescription) {
      if (langCode === 'fr') {
        heroTitle.textContent = 'Votre Propriété de Rêve';
        heroSubtitle.textContent = 'Vous Attend';
        heroDescription.textContent = 'Le pont de confiance pour une inscription, réservation et découverte de propriétés sans faille. Trouvez votre séjour parfait des hôtels de luxe aux maisons de rêve.';
      } else {
        heroTitle.textContent = 'Your Dream Property';
        heroSubtitle.textContent = 'Awaits';
        heroDescription.textContent = 'The trusted bridge for seamless property listing, booking, and discovery. Find your perfect stay from luxury hotels to dream homes.';
      }
    }

    // Update search form
    const searchInput = document.querySelector('[data-search-location]') as HTMLInputElement;
    const searchButton = document.querySelector('[data-search-button]');
    
    if (searchInput && searchButton) {
      if (langCode === 'fr') {
        searchInput.placeholder = 'Où allez-vous?';
        searchButton.textContent = 'Rechercher';
      } else {
        searchInput.placeholder = 'Where are you going?';
        searchButton.textContent = 'Search';
      }
    }

    // Update stats
    const statsLabels = document.querySelectorAll('[data-stats-label]');
    if (statsLabels.length > 0) {
      const labels = langCode === 'fr' 
        ? ['Propriétés', 'Clients', 'Villes']
        : ['Properties', 'Customers', 'Cities'];
      
      statsLabels.forEach((label, index) => {
        if (labels[index]) {
          label.textContent = labels[index];
        }
      });
    }

    // Update categories
    const categoryTitles = document.querySelectorAll('[data-category-title]');
    if (categoryTitles.length > 0) {
      const titles = langCode === 'fr'
        ? ['Hôtels', 'Maisons', 'Terrain']
        : ['Hotels', 'Houses', 'Land'];
      
      categoryTitles.forEach((title, index) => {
        if (titles[index]) {
          title.textContent = titles[index];
        }
      });
    }
  };

  const handleLanguageChange = (language: typeof languages[0]) => {
    setCurrentLang(language);
    localStorage.setItem('language', language.code);
    updateContent(language.code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <span className="mr-2">{currentLang.flag}</span>
          <Globe className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Select Language</DropdownMenuLabel>
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