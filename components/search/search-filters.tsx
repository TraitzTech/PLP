'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, MapPin } from 'lucide-react';

interface SearchFiltersProps {
  filters: {
    type: string;
    location: string;
    priceRangeMin: string;
    priceRangeMax: string;
    bedrooms: string;
    bathrooms: string;
    facilities: string[];
    region: string;
    city: string;
    purpose: string;
    bedroomsMin: string;
    bathroomsMin: string;
    floorAreaMin: string;
    floorAreaMax: string;
    landAreaMin: string;
    landAreaMax: string;
    roomsCountMin: string;
    starRating: string;
  };
  propertyTypes?: Array<{ id: number; name: string }>;
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export function SearchFilters({ filters, propertyTypes = [], onFiltersChange, onClose }: SearchFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      type: 'all',
      location: '',
      priceRangeMin: '0',
      priceRangeMax: '10000000',
      bedrooms: '',
      bathrooms: '',
      facilities: [],
      region: '',
      city: '',
      purpose: 'all',
      bedroomsMin: 'any',
      bathroomsMin: 'any',
      floorAreaMin: '',
      floorAreaMax: '',
      landAreaMin: '',
      landAreaMax: '',
      roomsCountMin: '',
      starRating: 'any',
    });
  };

  const selectedPropertyType = filters.type.toLowerCase();

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
        {/* Property Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Property Type</Label>
          <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type.id} value={type.name.toLowerCase()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Purpose */}
        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose</Label>
          <Select value={filters.purpose} onValueChange={(value) => updateFilter('purpose', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any Purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Purpose</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
              <SelectItem value="purchase">For Purchase</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="region"
              placeholder="Enter region"
              value={filters.region}
              onChange={(e) => updateFilter('region', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="Enter city"
            value={filters.city}
            onChange={(e) => updateFilter('city', e.target.value)}
          />
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceRangeMin}
                onChange={(e) => updateFilter('priceRangeMin', e.target.value)}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceRangeMax}
                onChange={(e) => updateFilter('priceRangeMax', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Property Type Specific Filters */}
        {selectedPropertyType && (
          <div className="pt-4 border-t">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="general">Specific Filters</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4 mt-4">
                {selectedPropertyType === 'house' && (
                  <>
                    <div className="space-y-2">
                      <Label>Minimum Bedrooms</Label>
                      <Select
                        value={filters.bedroomsMin}
                        onValueChange={(value) => updateFilter('bedroomsMin', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}+ Bedrooms
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Minimum Bathrooms</Label>
                      <Select
                        value={filters.bathroomsMin}
                        onValueChange={(value) => updateFilter('bathroomsMin', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}+ Bathrooms
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Floor Area (sqm)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.floorAreaMin}
                          onChange={(e) => updateFilter('floorAreaMin', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.floorAreaMax}
                          onChange={(e) => updateFilter('floorAreaMax', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedPropertyType === 'land' && (
                  <div className="space-y-2">
                    <Label>Land Area (sqm)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.landAreaMin}
                        onChange={(e) => updateFilter('landAreaMin', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.landAreaMax}
                        onChange={(e) => updateFilter('landAreaMax', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {selectedPropertyType === 'hotel' && (
                  <>
                    <div className="space-y-2">
                      <Label>Minimum Rooms</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 10"
                        value={filters.roomsCountMin}
                        onChange={(e) => updateFilter('roomsCountMin', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Minimum Star Rating</Label>
                      <Select
                        value={filters.starRating}
                        onValueChange={(value) => updateFilter('starRating', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any Rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Rating</SelectItem>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {rating}+ Stars
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Active Filters Count */}
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600">
            {Object.values(filters).filter((v) => v && v !== '' && (!Array.isArray(v) || v.length > 0)).length} active filters
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
