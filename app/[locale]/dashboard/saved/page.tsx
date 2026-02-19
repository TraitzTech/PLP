'use client'

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PropertyCard } from '@/components/properties/property-card';
import { Heart, Search, Grid3x3 as Grid3X3, List, Trash2, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminProperty } from '@/services/types';
import { savedPropertyService } from '@/services/savedPropertyService';

export default function SavedPropertiesPage() {
  const [savedProperties, setSavedProperties] = useState<AdminProperty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);

  useEffect(() => {
    const loadSavedProperties = async () => {
      setIsLoading(true);
      try {
        const response = await savedPropertyService.getSavedProperties();
        setSavedProperties(response.data || []);
      } catch (error) {
        toast.error('Failed to load saved properties');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return savedProperties;

    return savedProperties.filter((property) =>
      property.title.toLowerCase().includes(term) ||
      (property.city || '').toLowerCase().includes(term) ||
      (property.region || '').toLowerCase().includes(term) ||
      (property.location || '').toLowerCase().includes(term)
    );
  }, [savedProperties, searchTerm]);

  const getImageUrl = (property: AdminProperty): string => {
    const firstImage = property.images?.[0];
    const imagePath = firstImage?.image_path || firstImage?.image_url || firstImage?.url;

    if (!imagePath) {
      return 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg';
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    return `${process.env.NEXT_PUBLIC_API_URL}/../storage/listing_images/${imagePath}`;
  };

  const formatPrice = (price: string | number) => {
    const value = typeof price === 'string' ? Number(price) : price;
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(Number.isFinite(value) ? value : 0);
  };

  const handleRemoveProperty = async (propertyId: number) => {
    setIsRemoving(propertyId);
    try {
      await savedPropertyService.removeSavedProperty(propertyId);
      setSavedProperties((prev) => prev.filter((p) => p.id !== propertyId));
      setSelectedProperties((prev) => prev.filter((id) => id !== propertyId));
      toast.success('Property removed from saved list');
    } catch (error) {
      toast.error('Failed to remove property');
    } finally {
      setIsRemoving(null);
    }
  };

  const handleBulkRemove = async () => {
    try {
      await Promise.all(selectedProperties.map((id) => savedPropertyService.removeSavedProperty(id)));
      setSavedProperties((prev) => prev.filter((p) => !selectedProperties.includes(p.id)));
      setSelectedProperties([]);
      toast.success('Selected properties removed');
    } catch (error) {
      toast.error('Failed to remove selected properties');
    }
  };

  const togglePropertySelection = (propertyId: number) => {
    setSelectedProperties((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  return (
    <DashboardLayout userType="customer">
      <div className="space-y-8">
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

        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-10 h-10 mx-auto text-plp-purple animate-spin" />
              <p className="text-gray-600 mt-3">Loading saved properties...</p>
            </CardContent>
          </Card>
        ) : filteredProperties.length > 0 ? (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredProperties.map((property) => (
              <div key={property.id} className="relative group">
                {viewMode === 'grid' ? (
                  <div>
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedProperties.includes(property.id)}
                        onChange={() => togglePropertySelection(property.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </div>
                    <PropertyCard property={{ ...property, is_saved: true }} />
                  </div>
                ) : (
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-56 h-40">
                          <img
                            src={getImageUrl(property)}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4 flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">{property.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {property.city || property.location || 'Location not specified'}
                            </p>
                            <div className="text-lg font-bold text-plp-purple">{formatPrice(property.price)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedProperties.includes(property.id)}
                              onChange={() => togglePropertySelection(property.id)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Link href={`/property/${property.id}`}>
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isRemoving === property.id}
                  onClick={() => handleRemoveProperty(property.id)}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {isRemoving === property.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
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
                <Link href="/search">
                  <Button className="btn-primary">Explore Properties</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
