'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Search, Home, Building2, Mountain, Hotel, Building, Loader2 } from 'lucide-react';
import { useTranslations } from '@/components/translation-provider';
import { cn } from '@/lib/utils';
import { propertyTypeService } from '@/services/propertyTypeService';
import { searchAnalyticsService, type PopularSearchItem } from '@/services/searchAnalyticsService';
import { settingsService } from '@/services/settingsService';
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

const formatXaf = (amount: number): string => `${amount.toLocaleString('en-US')} XAF`;

export function SearchForm() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [purpose, setPurpose] = useState<ListingPurpose>('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeModel[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [launchCities, setLaunchCities] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearchItem[]>([]);
  const [launchRentalsOnly, setLaunchRentalsOnly] = useState(true);
  const [launchSalesEnabled, setLaunchSalesEnabled] = useState(false);
  const t = useTranslations();

  const isTypeActive = (type: PropertyTypeModel) => type.status === 1 || type.status === true;

  // Fetch property types and launch cities on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingTypes(true);
        
        // Fetch property types
        const [types, launchSettings, popular] = await Promise.all([
          propertyTypeService.getAllPropertyTypes(),
          settingsService.getPublicSettings(['launch_rentals_only', 'launch_sales_enabled']),
          searchAnalyticsService.getPopularSearches(6),
        ]);
        setPropertyTypes(types);
        setLaunchRentalsOnly(launchSettings.launch_rentals_only !== false);
        setLaunchSalesEnabled(launchSettings.launch_sales_enabled === true);
        setPopularSearches(Array.isArray(popular) ? popular.slice(0, 6) : []);
        
        // Fetch launch cities from settings
        const cities = await settingsService.getLaunchRolloutCities();
        setLaunchCities(cities.length > 0 ? cities : ['Douala', 'Bamenda']);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to default cities if fetch fails
        setLaunchCities(['Douala', 'Bamenda']);
        setPopularSearches([]);
      } finally {
        setIsLoadingTypes(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (launchRentalsOnly) {
      setPurpose('rent');
      return;
    }

    if (!launchSalesEnabled && purpose === 'purchase') {
      setPurpose('');
    }
  }, [launchRentalsOnly, launchSalesEnabled, purpose]);

  const priceRanges = [
    { value: '0-50000', label: t('search.price.budget', `Under ${formatXaf(50000)}`) },
    { value: '50000-100000', label: `${formatXaf(50000)} - ${formatXaf(100000)}` },
    { value: '100000-250000', label: `${formatXaf(100000)} - ${formatXaf(250000)}` },
    { value: '250000-500000', label: `${formatXaf(250000)} - ${formatXaf(500000)}` },
    { value: '500000-1000000', label: `${formatXaf(500000)} - ${formatXaf(1000000)}` },
    { value: '1000000+', label: t('search.price.luxury', `${formatXaf(1000000)}+`) },
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

  const handlePopularSearchClick = (item: PopularSearchItem) => {
    if (item.link) {
      router.push(item.link);
      return;
    }

    setLocation(item.label);
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
            onClick={() => {
              if (!launchSalesEnabled || launchRentalsOnly) return;
              setPurpose(purpose === 'purchase' ? '' : 'purchase');
            }}
            disabled={!launchSalesEnabled || launchRentalsOnly}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
              purpose === 'purchase'
                ? "bg-plp-accent text-white shadow-md"
                : "text-white hover:bg-white/10",
              (!launchSalesEnabled || launchRentalsOnly) && "opacity-50 cursor-not-allowed hover:bg-transparent"
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
                onClick={() => {
                  if (!isTypeActive(type)) return;
                  handlePropertyTypeClick(type.name);
                }}
                disabled={!isTypeActive(type)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
                  selectedPropertyType === type.name
                    ? "bg-plp-accent border-plp-accent text-white shadow-lg scale-105"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40",
                  !isTypeActive(type) && "opacity-60 cursor-not-allowed hover:bg-white/10 hover:border-white/20"
                )}
              >
                <span className="mb-2">{getPropertyTypeIcon(type.name)}</span>
                <span className="text-sm font-medium">{type.name}</span>
                {!isTypeActive(type) && <span className="mt-1 text-[10px] uppercase tracking-wide">Coming soon</span>}
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
              <span className="mr-2 text-xs font-semibold text-gray-500">XAF</span>
              <SelectValue placeholder={t('search.anyPrice', 'Any Price (XAF)')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{t('search.anyPrice', 'Any Price (XAF)')}</SelectItem>
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

      <div className="mt-4 rounded-xl border border-white/20 bg-black/20 px-4 py-3">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {t('search.cities', 'Cities')}
          </span>
          {launchCities.map((city) => (
            <button
              key={city}
              onClick={() => setLocation(city)}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90 transition-colors hover:bg-white/20"
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/20 bg-black/30 p-4">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-white/75">
          Popular Searches
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {popularSearches.length > 0 ? (
            popularSearches.map((item, index) => (
              <button
                key={`${item.label}-${index}`}
                onClick={() => handlePopularSearchClick(item)}
                className="rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs text-white transition-colors hover:bg-black/55"
              >
                {item.label}
              </button>
            ))
          ) : (
            <span className="text-xs text-white/60">Popular searches will appear as people use the platform.</span>
          )}
        </div>
      </div>
    </div>
  );
}