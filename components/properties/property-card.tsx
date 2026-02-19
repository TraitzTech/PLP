'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { AdminProperty, Listing } from '@/services/types';
import { authService } from '@/services/authService';
import { savedPropertyService } from '@/services/savedPropertyService';
import { 
  getPropertyTypeSummary, 
  getPropertyPurposeBadges, 
  formatPrice,
  getPriceLabel,
  getPropertyTypeName 
} from '@/lib/propertyHelpers';

interface PropertyCardProps {
  property: AdminProperty | Listing;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(Boolean((property as any).is_saved));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsFavorite(Boolean((property as any).is_saved));
  }, [property]);

  const getLocaleFromPath = () => {
    const segments = pathname.split('/').filter(Boolean);
    const locale = segments[0];
    return locale === 'en' || locale === 'fr' ? locale : 'en';
  };

  const handleToggleFavorite = async (event: React.MouseEvent) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const isAuthenticated = await authService.isAuthenticated();
    if (!isAuthenticated) {
      const locale = getLocaleFromPath();
      toast.error('Please sign in to save properties');
      router.push(`/${locale}/auth/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsSaving(true);
    const previousValue = isFavorite;
    setIsFavorite(!previousValue);

    try {
      if (previousValue) {
        await savedPropertyService.removeSavedProperty(property.id);
        toast.success('Removed from saved properties');
      } else {
        await savedPropertyService.saveProperty(property.id);
        toast.success('Saved property');
      }
    } catch (error) {
      setIsFavorite(previousValue);
      toast.error('Failed to update saved properties');
    } finally {
      setIsSaving(false);
    }
  };

  const getImageUrl = (prop: AdminProperty | Listing): string => {
    if ('images' in prop && prop.images && prop.images.length > 0) {
      const imagePath = prop.images[0].image_path || prop.images[0].image_url || prop.images[0].url;
      if (imagePath) {
        if (imagePath.startsWith('http')) return imagePath;
        return `${process.env.NEXT_PUBLIC_API_URL}/../storage/listing_images/${imagePath}`;
      }
    }
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" text-anchor="middle" dy=".3em" fill="%23999"%3ENo image%3C/text%3E%3C/svg%3E';
  };

  const getLocation = () => {
    const parts: string[] = [];
    if (property.city) parts.push(property.city);
    if (property.region) parts.push(property.region);
    return parts.join(', ') || property.location || 'Location not specified';
  };

  const imageUrl = getImageUrl(property);
  const location = getLocation();
  const typeName = getPropertyTypeName(property.property_type);
  const purposeBadges = getPropertyPurposeBadges(property);
  const typeSummary = getPropertyTypeSummary(property);
  const price = formatPrice(property.price);
  const priceLabel = getPriceLabel(property);
  
  // Ensure is_available is a boolean, defaulting to true if undefined
  const isAvailable = property.is_available !== false; // Treats undefined, null, and 0 as true by default
  

  return (
    <Card className="property-card group h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={imageUrl}
          alt={property.title}
          fill
          className={`object-cover transition-all duration-300 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          unoptimized
        />
        
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {('is_featured' in property && property.is_featured === true) && (
            <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-semibold text-xs shadow-lg flex items-center gap-1">
              ⭐ Featured
            </Badge>
          )}
          <Badge variant="secondary" className="bg-white/90 text-plp-purple font-medium text-xs">
            {typeName}
          </Badge>
          {purposeBadges.map((badge, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="bg-plp-purple/90 text-white font-medium text-xs"
            >
              {badge}
            </Badge>
          ))}
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          disabled={isSaving}
          className={`absolute top-3 right-3 h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-white transition-colors ${
            isFavorite ? 'text-red-500' : 'text-gray-600'
          }`}
          onClick={handleToggleFavorite}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </Button>

        {!isAvailable && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white text-center py-1 text-xs font-medium">
            Not Available
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex-1">
          <Link href={`/property/${property.id}`}>
            <h3 className="font-semibold text-base text-gray-900 group-hover:text-plp-purple transition-colors line-clamp-2 mb-2">
              {property.title}
            </h3>
          </Link>
          
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>

          {typeSummary && (
            <p className="text-xs text-gray-600 mb-2">
              {typeSummary}
            </p>
          )}

          {property.is_negotiable && (
            <Badge variant="outline" className="text-xs border-green-500 text-green-700">
              Negotiable
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-left">
            <div className="font-bold text-lg text-plp-purple">
              {price}
            </div>
            {priceLabel && (
              <div className="text-xs text-gray-500">
                {priceLabel}
              </div>
            )}
          </div>
          
          <Link href={`/property/${property.id}`}>
            <Button size="sm" className="bg-plp-purple hover:bg-plp-purple/90">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
