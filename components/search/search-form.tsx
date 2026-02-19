'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Search, Home, Building2, Mountain, Hotel, DollarSign, Building, Loader2 } from 'lucide-react';
import { useTranslations } from '@/components/translation-provider';
import { cn } from '@/lib/utils';
import { propertyTypeService } from '@/services/propertyTypeService';
import type { PropertyType as PropertyTypeModel } from '@/services/types';

type ListingPurpose = 'rent' | 'purchase' | '';

// Map property type names to icons
const propertyTypeIcons: Record<string, React.ReactNode> = {
  'hotel': <Hotel className="w-4 h-4" />,
  'house': <Home className="w-4 h-4" />,
  'land': <Mountain className="w-4 h-4" />,
  'apartment': <Building2 className="w-4 h-4" />,
  'villa': <Home className="w-4 h-4" />,
};

const getPropertyTypeIcon = (name: string): React.ReactNode => {
  const lowerName = name.toLowerCase();
  return propertyTypeIcons[lowerName] || <Building className="w-4 h-4" />;
};

export function SearchForm() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [purpose, setPurpose] = useState<ListingPurpose>('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeModel[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const t = useTranslations();

  // Fetch property types on mount
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        setIsLoadingTypes(true);
        const types = await propertyTypeService.getAllPropertyTypes();
        // Filter only active property types (status === 1)
        setPropertyTypes(types.filter(type => type.status === 1));
      } catch (error) {
        console.error('Failed to fetch property types:', error);
      } finally {
        setIsLoadingTypes(false);
      }
    };
    fetchPropertyTypes();
  }, []);

  const priceRanges = [
    { value: '0-50000', label: t('search.price.budget', 'Under $50,000') },
    { value: '50000-100000', label: '$50,000 - $100,000' },
    { value: '100000-250000', label: '$100,000 - $250,000' },
    { value: '250000-500000', label: '$250,000 - $500,000' },
    { value: '500000-1000000', label: '$500,000 - $1M' },
    { value: '1000000+', label: t('search.price.luxury', '$1M+') },
  ];

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (location) searchParams.set('location', location);
    if (purpose) searchParams.set('purpose', purpose);
    if (selectedPropertyType) searchParams.set('type', selectedPropertyType);
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      if (min) searchParams.set('priceMin', min.replace('+', ''));
      if (max) searchParams.set('priceMax', max);
    }
    
    router.push(`/search?${searchParams.toString()}`);
  };

  const handlePropertyTypeClick = (typeName: string) => {
    setSelectedPropertyType(typeName === selectedPropertyType ? '' : typeName);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
      {/* Purpose Toggle - Rent or Buy */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-white/20 rounded-full p-1">
          <button
            onClick={() => setPurpose(purpose === 'rent' ? '' : 'rent')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
              purpose === 'rent'
                ? "bg-plp-accent text-white shadow-md"
                : "text-white hover:bg-white/10"
            )}
          >
            {t('search.forRent', 'For Rent')}
          </button>
          <button
            onClick={() => setPurpose(purpose === 'purchase' ? '' : 'purchase')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
              purpose === 'purchase'
                ? "bg-plp-accent text-white shadow-md"
                : "text-white hover:bg-white/10"
            )}
          >
            {t('search.forSale', 'For Sale')}
          </button>
        </div>
      </div>

      {/* Property Type Selection - Visual Cards */}
      <div className="mb-6">
        <Label className="text-white/80 text-sm mb-3 block">
          {t('search.selectPropertyType', 'What are you looking for?')}
        </Label>
        {isLoadingTypes ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {propertyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handlePropertyTypeClick(type.name)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                  selectedPropertyType === type.name
                    ? "bg-plp-accent border-plp-accent text-white shadow-lg scale-105"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40"
                )}
              >
                <span className="mb-2">{getPropertyTypeIcon(type.name)}</span>
                <span className="text-sm font-medium">{type.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Search Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Location */}
        <div className="md:col-span-1">
          <Label className="text-white/80 text-xs mb-1 block">
            {t('search.location', 'Location')}
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={t('search.locationPlaceholder', 'City, region, or area...')}
              data-search-location
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 h-12 bg-white border-gray-300 focus:border-plp-purple focus:ring-plp-purple"
            />
          </div>
        </div>

        {/* Price Range */}
        <div className="md:col-span-1">
          <Label className="text-white/80 text-xs mb-1 block">
            {t('search.priceRange', 'Price Range')}
          </Label>
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="h-12 bg-white border-gray-300">
              <DollarSign className="mr-2 h-4 w-4 text-gray-400" />
              <SelectValue placeholder={t('search.anyPrice', 'Any Price')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{t('search.anyPrice', 'Any Price')}</SelectItem>
              {priceRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <div className="md:col-span-1 flex items-end">
          <Button 
            onClick={handleSearch} 
            className="w-full h-12 btn-accent font-semibold text-base" 
            data-search-button
          >
            <Search className="mr-2 h-5 w-5" />
            {t('search.searchButton', 'Search Properties')}
          </Button>
        </div>
      </div>

      {/* Quick Stats or Suggestions */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <span className="text-white/60 text-xs">
          {t('search.popular', 'Popular:')}
        </span>
        {['Douala', 'Yaoundé', 'Bafoussam', 'Kribi'].map((city) => (
          <button
            key={city}
            onClick={() => setLocation(city)}
            className="text-white/80 text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}