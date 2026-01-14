'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { PropertyCard } from '@/components/properties/property-card';
import { PropertyReviews } from '@/components/reviews/property-reviews';
import { PropertyMap } from '@/components/properties/property-map';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Star, 
  Heart, 
  Share2, 
  Bed, 
  Bath, 
  Square, 
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MessageSquare,
  MapPin,
  Home,
  Building2,
  Ruler,
  Zap
} from 'lucide-react';
import { 
  getPropertyTypeSummary, 
  getPropertyPurposeBadges, 
  formatPrice,
  getPriceLabel,
  getPriceContext,
  isHouseProperty,
  isLandProperty,
  isHotelProperty
} from '@/lib/propertyHelpers';

interface PropertyDetailsClientProps {
  property: any;
  similarProperties: any[];
  reviews: any[];
  language?: string;
}

export function PropertyDetailsClient({ property, similarProperties, reviews, language = 'en' }: PropertyDetailsClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [isFavorite, setIsFavorite] = useState(false);

  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' dy='.3em' fill='%23999'%3EImage coming soon%3C/text%3E%3C/svg%3E";
  const images = property?.images?.length ? property.images : [placeholderImage];
  // Use facilities objects if available, otherwise fallback to amenities strings
  const facilities = property?.facilities && Array.isArray(property.facilities) && property.facilities.length > 0
    ? property.facilities
    : (property?.amenities || []).map((name: string) => ({ name }));
  const agent = property?.agent;

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights * property.price;
  };

  // Normalize boolean values (handles 0, 1, true, false, string "1", "true")
  const normalizeBoolean = (value: any): boolean => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
    return false;
  };

  // Determine if property is for rent or sale
  const isForRent = normalizeBoolean(property.for_rent);
  const isForSale = normalizeBoolean(property.for_purchase);
  const isBothRentAndSale = isForRent && isForSale;

  console.log(
    "Property Object - for_rent:", property.for_rent, "for_purchase:", property.for_purchase,
    "isForRent:", isForRent, "isForSale:", isForSale,
    "Full property:", property
  )

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {property.title}
            </h1>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {getPropertyPurposeBadges(property).map((badge, index) => (
                <Badge key={index} className="bg-plp-purple text-white">
                  {badge}
                </Badge>
              ))}
              {property.is_approved && (
                <Badge className="bg-green-100 text-green-800">✓ Approved</Badge>
              )}
              {property.is_featured && (
                <Badge className="bg-blue-100 text-blue-800">⭐ Featured</Badge>
              )}
              {property.number_available > 0 && (
                <Badge className="bg-emerald-100 text-emerald-800">Available</Badge>
              )}
              {property.is_negotiable && (
                <Badge className="bg-amber-100 text-amber-800">Negotiable</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{property.rating}</span>
                <span className="ml-1">({property.reviews} reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className={isFavorite ? 'text-red-500 border-red-200' : ''}
            >
              <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden">
          <Image
            src={images[currentImageIndex]}
            alt={property.title}
            fill
            className="object-cover"
          />
          
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Property Info */}
          <div>
            <div className="flex items-center gap-6 mb-4">
              <Badge variant="secondary" className="bg-plp-purple/10 text-plp-purple">
                {property.type}
              </Badge>
                {property.bedrooms && (
                <div className="flex items-center text-gray-600">
                  <Bed className="w-4 h-4 mr-1" />
                  {property.bedrooms} bedrooms
                </div>
              )}
                {property.bathrooms && (
                <div className="flex items-center text-gray-600">
                  <Bath className="w-4 h-4 mr-1" />
                  {property.bathrooms} bathrooms
                </div>
              )}
                {property.area && (
                <div className="flex items-center text-gray-600">
                  <Square className="w-4 h-4 mr-1" />
                  {property.area} sq ft
                </div>
              )}
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              {property.description}
            </p>

            {/* Purpose Badges */}
            <div className="flex flex-wrap gap-2">
              {getPropertyPurposeBadges(property).map((badge, index) => (
                <Badge key={index} className="bg-plp-purple text-white">
                  {badge}
                </Badge>
              ))}
              {property.is_negotiable && (
                <Badge className="bg-green-100 text-green-800">
                  💰 Negotiable Price
                </Badge>
              )}
            </div>

            {/* Property Type Specific Details */}
            {isHouseProperty(property) && (property.bedrooms || property.bathrooms || property.floor_area) && (
              <Card className="bg-blue-50 mt-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    House Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {property.bedrooms && (
                      <div className="flex items-center gap-2">
                        <Bed className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Bedrooms</p>
                          <p className="font-semibold">{property.bedrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-2">
                        <Bath className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Bathrooms</p>
                          <p className="font-semibold">{property.bathrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.floor_area && (
                      <div className="flex items-center gap-2">
                        <Square className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Floor Area</p>
                          <p className="font-semibold">
                            {property.floor_area} {property.floor_area_unit || 'sqm'}
                          </p>
                        </div>
                      </div>
                    )}
                    {property.year_built && (
                      <div>
                        <p className="text-sm text-gray-600">Year Built</p>
                        <p className="font-semibold">{property.year_built}</p>
                      </div>
                    )}
                  </div>
                  {property.house_type && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-sm text-gray-600">House Type</p>
                      <p className="font-semibold capitalize">{property.house_type.replace('-', ' ')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isLandProperty(property) && (property.land_area || property.land_dimensions) && (
              <Card className="bg-green-50 border-green-200 mt-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="h-5 w-5" />
                    Land Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.land_area && (
                      <div>
                        <p className="text-sm text-gray-600">Land Area</p>
                        <p className="font-semibold text-lg">
                          {property.land_area} {property.land_area_unit || 'sqm'}
                        </p>
                      </div>
                    )}
                    {property.land_dimensions && (
                      <div>
                        <p className="text-sm text-gray-600">Dimensions</p>
                        <p className="font-semibold">{property.land_dimensions}</p>
                      </div>
                    )}
                  </div>
                  {property.zoning && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-sm text-gray-600">Zoning</p>
                      <Badge className="bg-green-600 text-white capitalize mt-1">
                        {property.zoning}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isHotelProperty(property) && (property.rooms_count || property.star_rating) && (
              <Card className="bg-purple-50 border-purple-200 mt-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Hotel Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {property.rooms_count && (
                      <div>
                        <p className="text-sm text-gray-600">Rooms</p>
                        <p className="font-semibold text-lg">{property.rooms_count}</p>
                      </div>
                    )}
                    {property.star_rating && (
                      <div>
                        <p className="text-sm text-gray-600">Rating</p>
                        <p className="font-semibold flex items-center gap-1">
                          {property.star_rating}
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        </p>
                      </div>
                    )}
                    {property.has_restaurant !== null && property.has_restaurant !== undefined && (
                      <div>
                        <p className="text-sm text-gray-600">Restaurant</p>
                        <p className="font-semibold">{property.has_restaurant ? '✓ Yes' : '✗ No'}</p>
                      </div>
                    )}
                    {property.has_pool !== null && property.has_pool !== undefined && (
                      <div>
                        <p className="text-sm text-gray-600">Swimming Pool</p>
                        <p className="font-semibold">{property.has_pool ? '✓ Yes' : '✗ No'}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Facilities & Amenities ({facilities?.length || 0})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {facilities && facilities.length > 0 ? facilities.map((facility: any, idx: number) => (
                <div key={facility?.id || `facility-${idx}`} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 text-sm">{facility?.name || facility || 'Facility'}</span>
                </div>
              )) : (
                <p className="text-gray-600 col-span-2 md:col-span-3">No amenities listed yet.</p>
              )}
            </div>
          </div>

          {agent && (
            <Card>
              <CardHeader>
                <CardTitle>Agent Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={agent?.user?.avatar} alt={agent?.user?.name} />
                    <AvatarFallback>
                      {(agent?.user?.name || "A").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{agent?.user?.name || 'Agent'}</p>
                    <p className="text-gray-600 text-sm">Agent Name</p>
                  </div>
                </div>
                {agent?.user?.email && (
                  <div className="border-t pt-3">
                    <p className="text-gray-600 text-sm">Agent Email</p>
                    <p className="font-medium text-gray-900">{agent.user.email}</p>
                  </div>
                )}
                {agent?.user?.phone && (
                  <div className="border-t pt-3">
                    <p className="text-gray-600 text-sm">Agent Phone</p>
                    <p className="font-medium text-gray-900">{agent.user.phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Comprehensive Property Details Grid */}
              <Card>
                <CardHeader>
                  <CardTitle>Complete Property Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Price Information */}
                    {property.price !== undefined && property.price !== null && (
                      <div className="p-4 bg-gradient-to-br from-plp-purple/5 to-plp-purple/10 rounded-lg border border-plp-purple/20">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Price</p>
                        <p className="text-2xl font-bold text-plp-purple">
                          {new Intl.NumberFormat('fr-CM', {
                            style: 'currency',
                            currency: 'XAF',
                            minimumFractionDigits: 0,
                          }).format(property.price || 0)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{getPriceContext(property).description}</p>
                      </div>
                    )}

                    {/* Bedrooms */}
                    {property.bedrooms && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Bedrooms</p>
                        <div className="flex items-center gap-2">
                          <Bed className="h-5 w-5 text-blue-600" />
                          <span className="text-2xl font-bold text-gray-900">{property.bedrooms}</span>
                        </div>
                      </div>
                    )}

                    {/* Bathrooms */}
                    {property.bathrooms && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Bathrooms</p>
                        <div className="flex items-center gap-2">
                          <Bath className="h-5 w-5 text-blue-600" />
                          <span className="text-2xl font-bold text-gray-900">{property.bathrooms}</span>
                        </div>
                      </div>
                    )}

                    {/* Floor Area */}
                    {property.floor_area && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Floor Area</p>
                        <div className="flex items-center gap-2">
                          <Square className="h-5 w-5 text-green-600" />
                          <div>
                            <span className="text-2xl font-bold text-gray-900">{property.floor_area}</span>
                            <span className="text-xs text-gray-600 ml-1">{property.floor_area_unit || 'sqm'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Land Area */}
                    {property.land_area && (
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Land Area</p>
                        <div className="flex items-center gap-2">
                          <Ruler className="h-5 w-5 text-amber-600" />
                          <div>
                            <span className="text-2xl font-bold text-gray-900">{property.land_area}</span>
                            <span className="text-xs text-gray-600 ml-1">{property.land_area_unit || 'sqm'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Year Built */}
                    {property.year_built && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Year Built</p>
                        <p className="text-2xl font-bold text-gray-900">{property.year_built}</p>
                      </div>
                    )}

                    {/* Rooms Count (Hotel) */}
                    {property.rooms_count && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Total Rooms</p>
                        <span className="text-2xl font-bold text-gray-900">{property.rooms_count}</span>
                      </div>
                    )}

                    {/* Star Rating (Hotel) */}
                    {property.star_rating && (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Star Rating</p>
                        <div className="flex items-center gap-1">
                          {[...Array(property.star_rating)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Number Available */}
                    {property.number_available && (
                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Available Units</p>
                        <p className="text-2xl font-bold text-emerald-700">{property.number_available}</p>
                      </div>
                    )}

                    {/* Discount Price */}
                    {property.discount_price && (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Discount Price</p>
                        <p className="text-2xl font-bold text-red-600">
                          {new Intl.NumberFormat('fr-CM', {
                            style: 'currency',
                            currency: 'XAF',
                            minimumFractionDigits: 0,
                          }).format(property.discount_price)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Address & Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Location Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.address && (
                    <div className="border-b pb-3 last:border-b-0">
                      <p className="text-gray-600 text-sm font-medium">Address</p>
                      <p className="text-gray-900 mt-1">{property.address}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    {property.city && (
                      <div>
                        <p className="text-gray-600 text-sm font-medium">City</p>
                        <p className="text-gray-900 font-semibold mt-1">{property.city}</p>
                      </div>
                    )}
                    {property.region && (
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Region</p>
                        <p className="text-gray-900 font-semibold mt-1">{property.region}</p>
                      </div>
                    )}
                    {property.location && (
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Location</p>
                        <p className="text-gray-900 font-semibold mt-1">{property.location}</p>
                      </div>
                    )}
                  </div>

                  {/* Coordinates */}
                  {(property.latitude || property.longitude) && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      {property.latitude && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Latitude</p>
                          <p className="text-sm font-mono text-gray-900">{property.latitude}</p>
                        </div>
                      )}
                      {property.longitude && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Longitude</p>
                          <p className="text-sm font-mono text-gray-900">{property.longitude}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {property.is_available !== undefined && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Status</p>
                        <Badge className={property.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {property.is_available ? "✓ Available" : "Not Available"}
                        </Badge>
                      </div>
                    )}
                    {property.is_negotiable && (
                      <div className="p-4 bg-amber-50 rounded-lg">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Negotiable</p>
                        <Badge className="bg-amber-100 text-amber-800">💰 Negotiable</Badge>
                      </div>
                    )}
                    {property.is_featured && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Featured</p>
                        <Badge className="bg-yellow-100 text-yellow-800">⭐ Featured</Badge>
                      </div>
                    )}
                    {property.is_approved && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Approval</p>
                        <Badge className="bg-green-100 text-green-800">✓ Approved</Badge>
                      </div>
                    )}
                  </div>

                  {/* Purpose Information */}
                  <div className="border-t pt-4">
                    <p className="text-gray-600 text-sm font-medium mb-2">Available For</p>
                    <div className="flex flex-wrap gap-2">
                      {property.for_rent && (
                        <Badge className="bg-blue-100 text-blue-800">For Rent</Badge>
                      )}
                      {property.for_purchase && (
                        <Badge className="bg-emerald-100 text-emerald-800">For Sale</Badge>
                      )}
                      {!property.for_rent && !property.for_purchase && (
                        <Badge variant="outline">Purpose not specified</Badge>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="border-t pt-4 space-y-2 text-sm">
                    {property.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Listed On:</span>
                        <span className="font-medium text-gray-900">{new Date(property.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {property.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium text-gray-900">{new Date(property.updatedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {property.id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Property ID:</span>
                        <span className="font-medium text-gray-900">#{property.id}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="location">
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Location Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {property.address && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm font-medium mb-1">Address</p>
                        <p className="text-gray-900 font-semibold">{property.address}</p>
                      </div>
                    )}
                    {property.city && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm font-medium mb-1">City</p>
                        <p className="text-gray-900 font-semibold">{property.city}</p>
                      </div>
                    )}
                    {property.region && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm font-medium mb-1">Region</p>
                        <p className="text-gray-900 font-semibold">{property.region}</p>
                      </div>
                    )}
                  </div>

                  {/* Google Map */}
                  {property.latitude && property.longitude ? (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Exact Location</h4>
                      <PropertyMap
                        latitude={property.latitude}
                        longitude={property.longitude}
                        title={property.title}
                        address={property.address || `${property.city}, ${property.region}`}
                        height="450px"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Location</h4>
                      <div className="p-6 bg-gray-50 rounded-lg text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">
                          {property.address || property.location || `${property.city}, ${property.region}`}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Exact coordinates not available
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews">
              <PropertyReviews
                reviews={reviews.map(review => ({
                  id: review.id.toString(),
                  user: {
                    name: review.user,
                    avatar: review.avatar,
                    verified: true,
                  },
                  rating: review.rating,
                  date: review.date,
                  comment: {
                    en: review.comment,
                    fr: review.comment,
                  },
                  helpful: Math.floor(Math.random() * 20),
                }))}
                language={language}
                propertyRating={property.rating || 0}
                totalReviews={property.reviews || 0}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-lg border-2 border-plp-purple/10">
            <CardHeader className="bg-gradient-to-r from-plp-purple/5 to-plp-purple/10">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    {getPriceContext(property).label ? "Pricing" : "Purchase Price"}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-plp-purple">
                      {property.price !== undefined && property.price !== null ? (
                        new Intl.NumberFormat('fr-CM', {
                          style: 'currency',
                          currency: 'XAF',
                          minimumFractionDigits: 0,
                        }).format(property.price || 0)
                      ) : (
                        <span>Price N/A</span>
                      )}
                    </div>
                    {getPriceContext(property).label && (
                      <span className="text-sm font-semibold text-gray-600 mb-1">
                        {getPriceContext(property).label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    {getPriceContext(property).description}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-6">
              {/* For Rent Booking Section */}
              {isForRent && (
                <>
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                      Booking Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="checkin" className="text-xs font-medium">Check-in</Label>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal text-sm mt-1"
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {checkIn ? checkIn.toLocaleDateString() : 'Select'}
                        </Button>
                      </div>
                      <div>
                        <Label htmlFor="checkout" className="text-xs font-medium">Check-out</Label>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal text-sm mt-1"
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {checkOut ? checkOut.toLocaleDateString() : 'Select'}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="guests" className="text-xs font-medium">Guests</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="px-2"
                        >
                          −
                        </Button>
                        <span className="flex-1 text-center font-medium">{guests}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setGuests(guests + 1)}
                          className="px-2"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {checkIn && checkOut && (
                    <div className="border-t pt-4 bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-gray-600">Nights:</span>
                        <span className="font-bold text-gray-900">{Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="font-bold text-lg text-plp-purple">{new Intl.NumberFormat('fr-CM', {
                          style: 'currency',
                          currency: 'XAF',
                          minimumFractionDigits: 0,
                        }).format(calculateTotal())}</span>
                      </div>
                    </div>
                  )}
                  
                  <Button className="w-full bg-plp-purple hover:bg-plp-purple/90 h-11 font-semibold text-base">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </>
              )}

              {/* For Sale Section */}
              {isForSale && (
                <>
                  <div className="space-y-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-emerald-600" />
                      Purchase Details
                    </h4>
                    <p className="text-sm text-gray-700">Ready to invest in this property?</p>
                    
                    <div className="space-y-3 pt-2 border-t border-emerald-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Listed Price</span>
                        <span className="font-bold text-lg text-plp-purple">{new Intl.NumberFormat('fr-CM', {
                          style: 'currency',
                          currency: 'XAF',
                          minimumFractionDigits: 0,
                        }).format(property.price || 0)}</span>
                      </div>
                      
                      {property.is_negotiable && (
                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <span className="text-2xl mt-0.5">💰</span>
                          <div>
                            <p className="font-semibold text-sm text-amber-900">Price is Negotiable</p>
                            <p className="text-xs text-amber-800 mt-0.5">Contact the agent to discuss offers</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 font-semibold text-base">
                    <Building2 className="w-4 h-4 mr-2" />
                    Make an Offer
                  </Button>
                </>
              )}

              {/* Both Rent and Sale */}
              {isBothRentAndSale && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
                  <p className="text-xs font-semibold text-purple-900 uppercase tracking-wide">Multi-Purpose Property</p>
                  <p className="text-sm text-purple-800 mt-1">Available for both rental and purchase</p>
                </div>
              )}
              
              <Button variant="outline" className="w-full h-10 font-semibold">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Agent
              </Button>
              
              {agent && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <p className="text-xs text-gray-600 font-medium mb-2">Questions? Reach out to</p>
                  <p className="font-semibold text-gray-900">{agent.user?.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Similar Properties */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {similarProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </>
  );
}