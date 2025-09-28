'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { PropertyCard } from '@/components/properties/property-card';
import { PropertyReviews } from '@/components/reviews/property-reviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
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
            src={property.images[currentImageIndex]}
            alt={property.title}
            fill
            className="object-cover"
          />
          
          {property.images.length > 1 && (
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
                {property.images.map((_, index) => (
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {property.amenities.map((amenity: string) => (
                <div key={amenity} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

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
                  <CardTitle>House Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {property.rules.map((rule: string, index: number) => (
                      <li key={index} className="text-gray-700">{rule}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="location">
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-600">Interactive map coming soon</p>
                    </div>
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
                propertyRating={property.rating}
                totalReviews={property.reviews}
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
                    ${property.price}
                    <span className="text-base text-gray-600 font-normal">/{property.priceUnit}</span>
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