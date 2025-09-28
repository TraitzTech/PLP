'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Chrome as Home, MapPin, ArrowRight } from 'lucide-react';

export function PropertyCategories() {

  const categories = [
    {
      id: 'hotels',
      name: 'Hotels',
      description: 'Luxury hotels and resorts for your perfect getaway',
      icon: Building2,
      image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
      count: '2,500+ properties',
      color: 'plp-purple',
    },
    {
      id: 'houses',
      name: 'Houses',
      description: 'Beautiful homes for rent or purchase',
      icon: Home,
      image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
      count: '18,000+ properties',
      color: 'plp-pink',
    },
    {
      id: 'land',
      name: 'Land',
      description: 'Prime land for investment and development',
      icon: MapPin,
      image: 'https://images.pexels.com/photos/1095814/pexels-photo-1095814.jpeg',
      count: '5,200+ plots',
      color: 'plp-yellow',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Explore Property Types
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're looking for a luxury hotel, dream home, or investment land, we have the perfect property waiting for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={category.id} className="group cursor-pointer card-hover overflow-hidden border-0 shadow-lg">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute top-4 left-4">
                    <div className={`bg-${category.color} bg-opacity-90 text-white p-3 rounded-xl`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm opacity-90">{category.count}</p>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-plp-purple transition-colors" data-category-title>
                      {category.name}
                    </h3>
                    <p className="text-gray-600">
                      {category.description}
                    </p>
                    <Link href={`/search?type=${category.id}`}>
                      <Button variant="ghost" className="group/btn p-0 h-auto font-semibold text-plp-purple hover:text-plp-pink transition-colors">
                        <span data-explore-button>Explore</span> {category.name}
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}