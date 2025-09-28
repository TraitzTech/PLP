'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { PropertyCard } from '@/components/properties/property-card';
import { SearchFilters } from '@/components/search/search-filters';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Filter, Grid3x3 as Grid3X3, Map, ChevronLeft, ChevronRight } from 'lucide-react';

// Mock properties data
const mockProperties = [
  {
    id: '1',
    title: 'Luxury Ocean View Villa',
    location: 'Malibu, California',
    price: 1200,
    priceUnit: 'night',
    rating: 4.9,
    reviews: 127,
    images: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'],
    amenities: ['Ocean View', 'Private Pool', 'Spa', 'WiFi'],
    type: 'villa',
    bedrooms: 4,
    bathrooms: 3,
    area: 3200,
  },
  {
    id: '2',
    title: 'Modern Downtown Apartment',
    location: 'New York, NY',
    price: 350,
    priceUnit: 'night',
    rating: 4.7,
    reviews: 89,
    images: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
    amenities: ['City View', 'Gym', 'Concierge', 'WiFi'],
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
  },
  {
    id: '3',
    title: 'Cozy Mountain Cabin',
    location: 'Aspen, Colorado',
    price: 280,
    priceUnit: 'night',
    rating: 4.8,
    reviews: 156,
    images: ['https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg'],
    amenities: ['Mountain View', 'Fireplace', 'Hot Tub', 'Hiking'],
    type: 'cabin',
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
  },
  {
    id: '4',
    title: 'Beachfront Resort Suite',
    location: 'Miami Beach, FL',
    price: 450,
    priceUnit: 'night',
    rating: 4.6,
    reviews: 203,
    images: ['https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg'],
    amenities: ['Beach Access', 'Pool', 'Restaurant', 'Spa'],
    type: 'resort',
    bedrooms: 1,
    bathrooms: 1,
    area: 800,
  },
  {
    id: '5',
    title: 'Historic Townhouse',
    location: 'Boston, MA',
    price: 320,
    priceUnit: 'night',
    rating: 4.5,
    reviews: 94,
    images: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
    amenities: ['Historic', 'Garden', 'Parking', 'WiFi'],
    type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    area: 2100,
  },
  {
    id: '6',
    title: 'Prime Development Land',
    location: 'Austin, TX',
    price: 250000,
    priceUnit: 'total',
    rating: 4.3,
    reviews: 12,
    images: ['https://images.pexels.com/photos/1095814/pexels-photo-1095814.jpeg'],
    amenities: ['Utilities Ready', 'Zoned Commercial', 'Corner Lot'],
    type: 'land',
    area: 5000,
  },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState(mockProperties);
  const [filteredProperties, setFilteredProperties] = useState(mockProperties);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: searchParams?.get('type') || '',
    location: searchParams?.get('location') || '',
    priceRange: [0, 2000],
    bedrooms: '',
    bathrooms: '',
    amenities: [] as string[],
  });

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  useEffect(() => {
    let filtered = [...properties];

    // Apply filters
    if (filters.type) {
      filtered = filtered.filter(property => 
        property.type.toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(property =>
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.bedrooms) {
      filtered = filtered.filter(property =>
        property.bedrooms && property.bedrooms >= parseInt(filters.bedrooms)
      );
    }

    if (filters.bathrooms) {
      filtered = filtered.filter(property =>
        property.bathrooms && property.bathrooms >= parseInt(filters.bathrooms)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Mock newest sort
        break;
      default:
        // Relevance - keep original order
        break;
    }

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [filters, sortBy, properties]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      location: '',
      priceRange: [0, 2000],
      bedrooms: '',
      bathrooms: '',
      amenities: [],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {filters.type ? `${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)} Properties` : 'All Properties'}
              </h1>
              <p className="text-gray-600">
                {filteredProperties.length} properties found
                {filters.location && ` in ${filters.location}`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center bg-white rounded-lg border p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="px-3"
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.type || filters.location || filters.bedrooms || filters.bathrooms) && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.type && (
                <Badge variant="secondary" className="bg-plp-purple/10 text-plp-purple">
                  {filters.type}
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="bg-plp-purple/10 text-plp-purple">
                  <MapPin className="w-3 h-3 mr-1" />
                  {filters.location}
                </Badge>
              )}
              {filters.bedrooms && (
                <Badge variant="secondary" className="bg-plp-purple/10 text-plp-purple">
                  {filters.bedrooms}+ bedrooms
                </Badge>
              )}
              {filters.bathrooms && (
                <Badge variant="secondary" className="bg-plp-purple/10 text-plp-purple">
                  {filters.bathrooms}+ bathrooms
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-plp-purple hover:text-plp-pink"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <SearchFilters
                filters={filters}
                onFiltersChange={handleFilterChange}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {viewMode === 'grid' ? (
              <>
                {/* Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {currentProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? 'btn-primary' : ''}
                      >
                        {page}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* Map View */
              <div className="bg-white rounded-lg border h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Map View</h3>
                  <p className="text-gray-600">Interactive map coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}