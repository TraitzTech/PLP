'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { PropertyCard } from '@/components/properties/property-card';
import { PropertyReviews } from '@/components/reviews/property-reviews';
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
  MessageSquare
} from 'lucide-react';

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
              {property.isApproved && (
                <Badge className="bg-green-100 text-green-800">✓ Approved</Badge>
              )}
              {property.isFeatured && (
                <Badge className="bg-blue-100 text-blue-800">⭐ Featured</Badge>
              )}
              {property.numberAvailable > 0 && (
                <Badge className="bg-emerald-100 text-emerald-800">Available</Badge>
              )}
              {property.isNegotiable && (
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
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.price !== undefined && property.price !== null ? (
                    <div className="border-b pb-3">
                      <p className="text-gray-600 text-sm">Price</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Intl.NumberFormat('fr-CM', {
                          style: 'currency',
                          currency: 'XAF',
                          minimumFractionDigits: 0,
                        }).format(property.price || 0)} 
                        {property.priceUnit === 'night' ? ' per night' : property.priceUnit === 'total' ? ' (total)' : ''}
                      </p>
                    </div>
                  ) : null}
                  {property.discountPrice && (
                    <div className="border-b pb-3">
                      <p className="text-gray-600 text-sm">Discount Price</p>
                      <p className="text-lg font-semibold text-red-600">
                        {new Intl.NumberFormat('fr-CM', {
                          style: 'currency',
                          currency: 'XAF',
                          minimumFractionDigits: 0,
                        }).format(property.discountPrice)}
                      </p>
                    </div>
                  )}
                  {property.numberAvailable && (
                    <div className="border-b pb-3">
                      <p className="text-gray-600 text-sm">Units Available</p>
                      <p className="text-lg font-semibold text-gray-900">{property.numberAvailable}</p>
                    </div>
                  )}
                  {property.address && (
                    <div className="border-b pb-3">
                      <p className="text-gray-600 text-sm">Address</p>
                      <p className="text-gray-900">{property.address}</p>
                    </div>
                  )}
                  {property.city && (
                    <div className="border-b pb-3">
                      <p className="text-gray-600 text-sm">City</p>
                      <p className="text-gray-900">{property.city}</p>
                    </div>
                  )}
                  {property.region && (
                    <div className="border-b pb-3">
                      <p className="text-gray-600 text-sm">Region</p>
                      <p className="text-gray-900">{property.region}</p>
                    </div>
                  )}
                  {property.createdAt && (
                    <div className="border-b pb-3">
                      <p className="text-gray-600 text-sm">Listed On</p>
                      <p className="text-gray-900">{new Date(property.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  {property.updatedAt && (
                    <div className="border-b pb-3">
                      <p className="text-gray-600 text-sm">Last Updated</p>
                      <p className="text-gray-900">{new Date(property.updatedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                  {property.id && (
                    <div>
                      <p className="text-gray-600 text-sm">Property ID</p>
                      <p className="font-medium text-gray-900">#{property.id || 'N/A'}</p>
                    </div>
                  )}
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
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">View on Map</h4>
                    <div className="rounded-lg overflow-hidden border border-gray-200 h-96">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                          property.address || `${property.city}, ${property.region}`
                        )}`}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      📍 {property.address || property.location}
                    </p>
                  </div>
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
          <Card className="sticky top-24">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-plp-purple">
                    {property.price !== undefined && property.price !== null ? (
                      <>
                        {new Intl.NumberFormat('fr-CM', {
                          style: 'currency',
                          currency: 'XAF',
                          minimumFractionDigits: 0,
                        }).format(property.price || 0)}
                        <span className="text-base text-gray-600 font-normal">
                          {property.priceUnit === 'night' ? '/night' : property.priceUnit === 'total' ? '' : ''}
                        </span>
                      </>
                    ) : (
                      <span>Price N/A</span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="checkin">Check-in</Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? checkIn.toLocaleDateString() : 'Select date'}
                  </Button>
                </div>
                <div>
                  <Label htmlFor="checkout">Check-out</Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? checkOut.toLocaleDateString() : 'Select date'}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="guests">Guests</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                  >
                    -
                  </Button>
                  <span className="flex-1 text-center">{guests} guests</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGuests(guests + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              {checkIn && checkOut && (
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Total</span>
                    <span className="font-semibold">${calculateTotal()}</span>
                  </div>
                </div>
              )}
              
              <Button className="w-full btn-primary">
                Book Now
              </Button>
              
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Host
              </Button>
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