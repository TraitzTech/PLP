'use client'

import React from 'react';
import { PropertyCard } from './property-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Mock property data
const featuredProperties = [
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
  },
  {
    id: '2', 
    title: 'Modern Downtown Apartment',
    location: 'New York, NY',
    price: 210000, // XAF per night
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
  },
];

export function FeaturedProperties() {

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl">
              Discover our handpicked selection of premium properties that offer exceptional experiences and unmatched value.
            </p>
          </div>
          
          <Link href="/search">
            <Button className="btn-primary group">
              View All Properties
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}