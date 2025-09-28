'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { X, MapPin, Chrome as Home, Building2, Bed, Bath, Wifi, Car, Utensils, Waves } from 'lucide-react';

interface SearchFiltersProps {
  filters: {
    type: string;
    location: string;
    priceRange: number[];
    bedrooms: string;
    bathrooms: string;
    amenities: string[];
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

const propertyTypes = [
  { value: 'hotels', label: 'Hotels', icon: Building2 },
  { value: 'houses', label: 'Houses', icon: Home },
  { value: 'apartments', label: 'Apartments', icon: Building2 },
  { value: 'land', label: 'Land', icon: MapPin },
  { value: 'villa', label: 'Villas', icon: Home },
  { value: 'cabin', label: 'Cabins', icon: Home },
];

const amenitiesList = [
  { value: 'wifi', label: 'WiFi', icon: Wifi },
  { value: 'parking', label: 'Parking', icon: Car },
  { value: 'kitchen', label: 'Kitchen', icon: Utensils },
  { value: 'pool', label: 'Pool', icon: Waves },
  { value: 'gym', label: 'Gym', icon: Building2 },
  { value: 'spa', label: 'Spa', icon: Building2 },
  { value: 'beach', label: 'Beach Access', icon: Waves },
  { value: 'garden', label: 'Garden', icon: Home },
];

export function SearchFilters({ filters, onFiltersChange, onClose }: SearchFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    updateFilter('amenities', newAmenities);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      type: '',
      location: '',
      priceRange: [0, 2000],
      bedrooms: '',
      bathrooms: '',
      amenities: [],
    });
  };

  return (
    <Card className="sticky top-24">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="location"
              placeholder="Enter city or area"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Property Type */}
        <div className="space-y-3">
          <Label>Property Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.value}
                  variant={filters.type === type.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('type', filters.type === type.value ? '' : type.value)}
                  className={`justify-start ${filters.type === type.value ? 'btn-primary' : ''}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {type.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label>Price Range</Label>
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value)}
              max={2000}
              min={0}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}+</span>
            </div>
          </div>
        </div>

        {/* Bedrooms */}
        <div className="space-y-2">
          <Label>Bedrooms</Label>
          <Select value={filters.bedrooms} onValueChange={(value) => updateFilter('bedrooms', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bathrooms */}
        <div className="space-y-2">
          <Label>Bathrooms</Label>
          <Select value={filters.bathrooms} onValueChange={(value) => updateFilter('bathrooms', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amenities */}
        <div className="space-y-3">
          <Label>Amenities</Label>
          <div className="space-y-2">
            {amenitiesList.map((amenity) => {
              const Icon = amenity.icon;
              return (
                <div key={amenity.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity.value}
                    checked={filters.amenities.includes(amenity.value)}
                    onCheckedChange={() => toggleAmenity(amenity.value)}
                  />
                  <Label
                    htmlFor={amenity.value}
                    className="flex items-center space-x-2 text-sm font-normal cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span>{amenity.label}</span>
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}