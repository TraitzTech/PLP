'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star, MapPin, Bed, Bath, Square } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  priceUnit: string;
  rating: number;
  reviews: number;
  images: string[];
  amenities: string[];
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card className="property-card group">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          className={`object-cover transition-all duration-300 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-plp-purple font-medium">
            {property.type}
          </Badge>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className={`absolute top-4 right-4 h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-white transition-colors ${
            isFavorite ? 'text-red-500' : 'text-gray-600'
          }`}
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <CardContent className="p-5 space-y-4">
        <div>
            <Link href={`/property/${property.id}`}></Link>
          <Link href={`/property/${property.id}`}>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-plp-purple transition-colors line-clamp-1">
              {property.title}
            </h3>
          </Link>
          
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            {property.location}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-medium text-gray-900">{property.rating}</span>
            <span className="text-gray-500 text-sm">({property.reviews})</span>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-lg text-plp-purple">
              {new Intl.NumberFormat('fr-CM', {
                style: 'currency',
                currency: 'XAF',
                minimumFractionDigits: 0,
              }).format(property.price)}
              <span className="text-sm text-gray-500 font-normal">/{property.priceUnit}</span>
            </div>
          </div>
        </div>

        {(property.bedrooms || property.bathrooms || property.area) && (
          <div className="flex items-center space-x-4 text-sm text-gray-600 pt-2 border-t border-gray-100">
            {property.bedrooms && (
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                {property.bedrooms}
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                {property.bathrooms}
              </div>
            )}
            {property.area && (
              <div className="flex items-center">
                <Square className="w-4 h-4 mr-1" />
                {property.area}ft²
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-1 pt-2">
          {property.amenities.slice(0, 3).map((amenity) => (
            <Badge key={amenity} variant="outline" className="text-xs">
              {amenity}
            </Badge>
          ))}
          {property.amenities.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{property.amenities.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}