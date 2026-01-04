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
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Filter, Grid3x3 as Grid3X3, Map, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { publicPropertyService } from '@/services/publicPropertyService';
import { listingImageService } from '@/services/listingImageService';
import { propertyTypeService } from '@/services/propertyTypeService';
import type { AdminProperty, PropertyType } from '@/services/types';

// Helper function to get image URL
function getImageUrl(imagePath?: string): string {
  if (!imagePath) {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" text-anchor="middle" dy=".3em" fill="%23999"%3ENo image%3C/text%3E%3C/svg%3E';
  }
  return `${process.env.NEXT_PUBLIC_API_URL}/../storage/listing_images/${imagePath}`;
}

// Property card skeleton
function PropertyCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-full h-48 rounded-lg" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-4" />
    </div>
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [allProperties, setAllProperties] = useState<AdminProperty[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<AdminProperty[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    type: searchParams?.get('type') || '',
    location: '',
    priceRangeMin: '0',
    priceRangeMax: '10000000',
    bedrooms: '',
    bathrooms: '',
    facilities: [] as string[],
    region: '',
    city: '',
  });

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  // Fetch property types
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const types = await propertyTypeService.getAllPropertyTypes();
        setPropertyTypes(types.filter(t => t.status === 1));
      } catch (error) {
        console.error('Failed to fetch property types:', error);
      }
    };
    fetchPropertyTypes();
  }, []);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const response = await publicPropertyService.getAllProperties({
          per_page: 100,
        });

        const properties = Array.isArray(response?.data) ? response.data : [];
        
        // Fetch images for each property
        const propertiesWithImages = await Promise.all(
          properties.map(async (property) => {
            try {
              const imagesResponse = await listingImageService.getImagesByListing(property.id);
              
              console.log("Images response: ", imagesResponse);
              return {
                ...property,
                images: (imagesResponse as any) || [],
              };

            } catch (err) {
              return {
                ...property,
                images: [],
              };
            }
          })
        );

        setAllProperties(propertiesWithImages);

      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...allProperties];

    // Filter by property type
    if (filters.type) {
      filtered = filtered.filter(property => 
        property.property_type?.name.toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    // Filter by region/location
    if (filters.region) {
      filtered = filtered.filter(property =>
        property.region.toLowerCase().includes(filters.region.toLowerCase())
      );
    }

    // Filter by city
    if (filters.city) {
      filtered = filtered.filter(property =>
        property.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Filter by price range
    const minPrice = parseFloat(filters.priceRangeMin) || 0;
    const maxPrice = parseFloat(filters.priceRangeMax) || Infinity;
    filtered = filtered.filter(property => {
      const price = Number(property.price);
      return price >= minPrice && price <= maxPrice;
    });

    // Filter by number available (minimum 1)
    filtered = filtered.filter(property => property.number_available >= 1 && property.is_available);

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        // Relevance - keep original order
        break;
    }

    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [filters, sortBy, allProperties]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      location: '',
      priceRangeMin: '0',
      priceRangeMax: '10000000',
      bedrooms: '',
      bathrooms: '',
      facilities: [],
      region: '',
      city: '',
    });
    setSortBy('relevance');
  };

  // Get unique regions and cities
  const uniqueRegions = Array.from(new Set(allProperties.map(p => p.region))).sort();
  const uniqueCities = Array.from(new Set(allProperties.map(p => p.city))).sort();

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
                {filters.region && ` in ${filters.region}`}
                {filters.city && ` - ${filters.city}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.type || filters.region || filters.city || filters.priceRangeMin !== '0' || filters.priceRangeMax !== '10000000') && (
            <div className="flex flex-wrap items-center gap-2 mt-4 p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {filters.type && (
                <Badge variant="secondary" className="bg-plp-purple text-white flex items-center gap-1">
                  {filters.type}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, type: ''})} />
                </Badge>
              )}
              {filters.region && (
                <Badge variant="secondary" className="bg-plp-purple text-white flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {filters.region}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, region: ''})} />
                </Badge>
              )}
              {filters.city && (
                <Badge variant="secondary" className="bg-plp-purple text-white flex items-center gap-1">
                  {filters.city}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, city: ''})} />
                </Badge>
              )}
              {(filters.priceRangeMin !== '0' || filters.priceRangeMax !== '10000000') && (
                <Badge variant="secondary" className="bg-plp-purple text-white flex items-center gap-1">
                  ${filters.priceRangeMin} - ${filters.priceRangeMax}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, priceRangeMin: '0', priceRangeMax: '10000000'})} />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-plp-purple hover:text-plp-pink ml-auto"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0 bg-white p-6 rounded-lg border h-fit">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-3 text-gray-900">Property Type</h3>
                  <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
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

                <div>
                  <h3 className="font-bold text-lg mb-3 text-gray-900">Region</h3>
                  <Select value={filters.region} onValueChange={(value) => setFilters({...filters, region: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {uniqueRegions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3 text-gray-900">City</h3>
                  <Select value={filters.city} onValueChange={(value) => setFilters({...filters, city: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {uniqueCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3 text-gray-900">Price Range</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-600">Min Price</label>
                      <input
                        type="number"
                        value={filters.priceRangeMin}
                        onChange={(e) => setFilters({...filters, priceRangeMin: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-plp-purple"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Max Price</label>
                      <input
                        type="number"
                        value={filters.priceRangeMax}
                        onChange={(e) => setFilters({...filters, priceRangeMax: e.target.value})}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-plp-purple"
                        placeholder="10000000"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3 text-gray-900">Availability</h3>
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Showing only available properties with inventory</p>
                  </div>
                </div>

                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Reset Filters
                </Button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria</p>
                <Button variant="outline" onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <>
                {/* Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {currentProperties.map((property) => {
                    const imageUrls = (property.images as any)?.map((img: any) => getImageUrl(img.image_path)) || [];
                    
                    return (
                      <PropertyCard
                        key={property.id}
                        property={{
                          id: String(property.id),
                          title: property.title,
                          location: `${property.city}, ${property.region}`,
                          price: Number(property.price),
                          priceUnit: 'unit',
                          rating: 4.5,
                          reviews: 0,
                          images: imageUrls.length > 0 ? imageUrls : [getImageUrl()],
                          amenities: [],
                          type: property.property_type?.name?.toLowerCase() || 'property',
                          bedrooms: 0,
                          bathrooms: 0,
                          area: 0,
                        }}
                      />
                    );
                  })}
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
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
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
                    
                    {totalPages > 5 && (
                      <>
                        <span className="text-gray-500">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                    
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