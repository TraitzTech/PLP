'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PropertyCard } from '@/components/properties/property-card';
import { Heart, Search, Grid3x3 as Grid3X3, List, Trash2 } from 'lucide-react';

// Mock saved properties data
const mockSavedProperties = [
  {
    id: '1',
    title: 'Luxury Ocean View Villa',
    location: 'Malibu, California',
    price: 720000, // XAF per night
    priceUnit: 'night',
    rating: 4.9,
    reviews: 127,
    images: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'],
    amenities: ['Ocean View', 'Private Pool', 'Spa', 'WiFi'],
    type: 'villa',
    bedrooms: 4,
    bathrooms: 3,
    area: 3200,
    savedDate: '2024-01-15',
  },
  {
    id: '3',
    title: 'Cozy Mountain Cabin',
    location: 'Aspen, Colorado',
    price: 168000, // XAF per night
    priceUnit: 'night',
    rating: 4.8,
    reviews: 156,
    images: ['https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg'],
    amenities: ['Mountain View', 'Fireplace', 'Hot Tub', 'Hiking'],
    type: 'cabin',
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    savedDate: '2024-01-20',
  },
  {
    id: '4',
    title: 'Beachfront Resort Suite',
    location: 'Miami Beach, FL',
    price: 270000, // XAF per night
    priceUnit: 'night',
    rating: 4.6,
    reviews: 203,
    images: ['https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg'],
    amenities: ['Beach Access', 'Pool', 'Restaurant', 'Spa'],
    type: 'resort',
    bedrooms: 1,
    bathrooms: 1,
    area: 800,
    savedDate: '2024-02-01',
  },
  {
    id: '5',
    title: 'Historic Townhouse',
    location: 'Boston, MA',
    price: 192000, // XAF per night
    priceUnit: 'night',
    rating: 4.5,
    reviews: 94,
    images: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
    amenities: ['Historic', 'Garden', 'Parking', 'WiFi'],
    type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    area: 2100,
    savedDate: '2024-02-05',
  },
  {
    id: '6',
    title: 'Prime Development Land',
    location: 'Austin, TX',
    price: 150000000, // XAF total
    priceUnit: 'total',
    rating: 4.3,
    reviews: 12,
    images: ['https://images.pexels.com/photos/1095814/pexels-photo-1095814.jpeg'],
    amenities: ['Utilities Ready', 'Zoned Commercial', 'Corner Lot'],
    type: 'land',
    area: 5000,
    savedDate: '2024-02-10',
  },
];

export default function SavedPropertiesPage() {
  const [savedProperties, setSavedProperties] = useState(mockSavedProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const filteredProperties = savedProperties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveProperty = (propertyId: string) => {
    setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
    setSelectedProperties(prev => prev.filter(id => id !== propertyId));
  };

  const handleBulkRemove = () => {
    setSavedProperties(prev => prev.filter(p => !selectedProperties.includes(p.id)));
    setSelectedProperties([]);
  };

  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  return (
    <DashboardLayout userType="customer">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saved Properties</h1>
            <p className="text-gray-600 mt-2">
              {savedProperties.length} properties saved for later viewing.
            </p>
          </div>
          
          {selectedProperties.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleBulkRemove}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Selected ({selectedProperties.length})
            </Button>
          )}
        </div>

        {/* Search and View Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search saved properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid/List */}
        {filteredProperties.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredProperties.map((property) => (
              <div key={property.id} className="relative group">
                {viewMode === 'grid' ? (
                  <PropertyCard property={property} />
                ) : (
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="w-48 h-32">
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                {property.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">{property.location}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>{property.type}</span>
                                {property.bedrooms && <span>{property.bedrooms} beds</span>}
                                {property.bathrooms && <span>{property.bathrooms} baths</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-plp-purple">
                                {new Intl.NumberFormat('fr-CM', {
                                  style: 'currency',
                                  currency: 'XAF',
                                  minimumFractionDigits: 0,
                                }).format(property.price)}
                                <span className="text-sm text-gray-500 font-normal">
                                  /{property.priceUnit}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Saved {property.savedDate}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Remove button overlay */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveProperty(property.id)}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No properties found' : 'No saved properties'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search criteria.'
                  : 'Start exploring properties and save your favorites here.'}
              </p>
              {!searchTerm && (
                <Button className="btn-primary">
                  Explore Properties
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}