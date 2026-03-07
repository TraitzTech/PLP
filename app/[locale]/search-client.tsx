'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname } from 'next/navigation';
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
import { SearchMap } from '@/components/search/search-map';
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

export function SearchClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const language = pathname?.startsWith('/fr') ? 'fr' : 'en';

  const searchContent = {
    en: {
      properties: 'Properties',
      allProperties: 'All Properties',
      propertiesFound: 'properties found',
      inRegion: 'in',
      sortBy: 'Sort by',
      mostRelevant: 'Most Relevant',
      priceLowHigh: 'Price: Low to High',
      priceHighLow: 'Price: High to Low',
      newest: 'Newest',
      hideFilters: 'Hide',
      showFilters: 'Show',
      filters: 'Filters',
      activeFilters: 'Active filters:',
      clearAllFilters: 'Clear all filters',
      clearFilters: 'Clear Filters',
      noProperties: 'No properties found',
      tryAdjusting: 'Try adjusting your filters or search criteria',
    },
    fr: {
      properties: 'Propriétés',
      allProperties: 'Toutes les Propriétés',
      propertiesFound: 'propriétés trouvées',
      inRegion: 'à',
      sortBy: 'Trier par',
      mostRelevant: 'Plus Pertinent',
      priceLowHigh: 'Prix : Croissant',
      priceHighLow: 'Prix : Décroissant',
      newest: 'Plus Récent',
      hideFilters: 'Masquer',
      showFilters: 'Afficher',
      filters: 'Filtres',
      activeFilters: 'Filtres actifs :',
      clearAllFilters: 'Effacer tous les filtres',
      clearFilters: 'Effacer les Filtres',
      noProperties: 'Aucune propriété trouvée',
      tryAdjusting: 'Essayez de modifier vos filtres ou critères de recherche',
    },
  };
  const t = searchContent[language];

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
    location: searchParams?.get('location') || '',
    priceRangeMin: searchParams?.get('priceMin') || '0',
    priceRangeMax: searchParams?.get('priceMax') || '1000000000000',
    bedrooms: '',
    bathrooms: '',
    facilities: [] as string[],
    region: '',
    city: '',
    purpose: searchParams?.get('purpose') || '', // 'rent', 'purchase', or ''
    // House filters
    bedroomsMin: '',
    bathroomsMin: '',
    floorAreaMin: '',
    floorAreaMax: '',
    // Land filters
    landAreaMin: '',
    landAreaMax: '',
    // Hotel filters
    roomsCountMin: '',
    starRating: '',
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

    // Filter by purpose (rent/purchase)
    if (filters.purpose === 'rent') {
      filtered = filtered.filter(property => property.for_rent === true);
    } else if (filters.purpose === 'purchase') {
      filtered = filtered.filter(property => property.for_purchase === true);
    }

    // Filter by location (searches city, region, neighborhood, address)
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter(property =>
        property.city?.toLowerCase().includes(locationLower) ||
        property.region?.toLowerCase().includes(locationLower) ||
        (property as any).neighborhood?.toLowerCase().includes(locationLower) ||
        property.address?.toLowerCase().includes(locationLower)
      );
    }

    // Filter by region/location
    if (filters.region) {
      filtered = filtered.filter(property =>
        property.region?.toLowerCase().includes(filters.region.toLowerCase())
      );
    }

    // Filter by city
    if (filters.city) {
      filtered = filtered.filter(property =>
        property.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    

    // Filter by price range
    const minPrice = parseFloat(filters.priceRangeMin) || 0;
    const maxPrice = parseFloat(filters.priceRangeMax) || Infinity;
    filtered = filtered.filter(property => {
      const price = Number(property.price);
      return price >= minPrice && price <= maxPrice;
    });

    // House-specific filters - only apply if value exists AND is greater than 0
    if (filters.bedroomsMin && !isNaN(Number(filters.bedroomsMin)) && Number(filters.bedroomsMin) > 0) {
      const minBedrooms = parseInt(filters.bedroomsMin);
      filtered = filtered.filter(property => 
        property.bedrooms != null && property.bedrooms >= minBedrooms
      );
    }
    
    if (filters.bathroomsMin && !isNaN(Number(filters.bathroomsMin)) && Number(filters.bathroomsMin) > 0) {
      const minBathrooms = parseInt(filters.bathroomsMin);
      filtered = filtered.filter(property => 
        property.bathrooms != null && property.bathrooms >= minBathrooms
      );
    }
    
    if (filters.floorAreaMin && !isNaN(Number(filters.floorAreaMin)) && Number(filters.floorAreaMin) > 0) {
      const minArea = parseFloat(filters.floorAreaMin);
      filtered = filtered.filter(property => 
        property.floor_area != null && Number(property.floor_area) >= minArea
      );
    }
    
    if (filters.floorAreaMax && !isNaN(Number(filters.floorAreaMax)) && Number(filters.floorAreaMax) > 0) {
      const maxArea = parseFloat(filters.floorAreaMax);
      filtered = filtered.filter(property => 
        property.floor_area != null && Number(property.floor_area) <= maxArea
      );
    }

    // Land-specific filters - only apply if value exists AND is greater than 0
    if (filters.landAreaMin && !isNaN(Number(filters.landAreaMin)) && Number(filters.landAreaMin) > 0) {
      const minArea = parseFloat(filters.landAreaMin);
      filtered = filtered.filter(property => 
        property.land_area != null && Number(property.land_area) >= minArea
      );
    }
    
    if (filters.landAreaMax && !isNaN(Number(filters.landAreaMax)) && Number(filters.landAreaMax) > 0) {
      const maxArea = parseFloat(filters.landAreaMax);
      filtered = filtered.filter(property => 
        property.land_area != null && Number(property.land_area) <= maxArea
      );
    }

    // Hotel-specific filters - only apply if value exists AND is greater than 0
    if (filters.roomsCountMin && !isNaN(Number(filters.roomsCountMin)) && Number(filters.roomsCountMin) > 0) {
      const minRooms = parseInt(filters.roomsCountMin);
      filtered = filtered.filter(property => 
        property.rooms_count != null && property.rooms_count >= minRooms
      );
    }
    
    if (filters.starRating && !isNaN(Number(filters.starRating)) && Number(filters.starRating) > 0) {
      const rating = parseInt(filters.starRating);
      filtered = filtered.filter(property => 
        property.star_rating != null && property.star_rating >= rating
      );
    }

    // Filter by approval status (only show approved properties on public search)
    filtered = filtered.filter(property => property.is_approved === true);

    // Filter by availability (show properties that are available or have availability unset)
    filtered = filtered.filter(property => 
      property.is_available !== false && 
      (property.number_available === undefined || property.number_available === null || property.number_available >= 1)
    );

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
      priceRangeMax: '1000000000000',
      bedrooms: '',
      bathrooms: '',
      facilities: [],
      region: '',
      city: '',
      purpose: '',
      bedroomsMin: '',
      bathroomsMin: '',
      floorAreaMin: '',
      floorAreaMax: '',
      landAreaMin: '',
      landAreaMax: '',
      roomsCountMin: '',
      starRating: '',
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
                {filters.type ? `${filters.type.charAt(0).toUpperCase() + filters.type.slice(1)} ${t.properties}` : t.allProperties}
              </h1>
              <p className="text-gray-600">
                {filteredProperties.length} {t.propertiesFound}
                {filters.region && ` ${t.inRegion} ${filters.region}`}
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
                  <SelectValue placeholder={t.sortBy} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">{t.mostRelevant}</SelectItem>
                  <SelectItem value="price-low">{t.priceLowHigh}</SelectItem>
                  <SelectItem value="price-high">{t.priceHighLow}</SelectItem>
                  <SelectItem value="newest">{t.newest}</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? t.hideFilters : t.showFilters} {t.filters}
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.type || filters.region || filters.city || filters.priceRangeMin !== '0' || (filters.priceRangeMax !== '1000000000000' && filters.priceRangeMax !== '10000000')) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 p-4 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{t.activeFilters}</span>
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
              {(filters.priceRangeMin !== '0' || (filters.priceRangeMax !== '1000000000000' && filters.priceRangeMax !== '10000000')) && (
                <Badge variant="secondary" className="bg-plp-purple text-white flex items-center gap-1">
                  XAF{filters.priceRangeMin} - XAF{filters.priceRangeMax}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({...filters, priceRangeMin: '0', priceRangeMax: '1000000000000'})} />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-plp-purple hover:text-plp-pink ml-auto"
              >
                {t.clearAllFilters}
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
                propertyTypes={propertyTypes}
                onFiltersChange={handleFilterChange}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className={`grid grid-cols-1 md:grid-cols-2 ${showFilters ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-6`}>
                {[...Array(12)].map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noProperties}</h3>
                <p className="text-gray-600 mb-4">{t.tryAdjusting}</p>
                <Button variant="outline" onClick={clearFilters}>
                  {t.clearFilters}
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <>
                {/* Properties Grid */}
                <div className={`grid grid-cols-1 md:grid-cols-2 ${showFilters ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-6 mb-8`}>
                  {currentProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                    />
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
              <SearchMap 
                properties={filteredProperties}
                height="600px"
              />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
