'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Calendar as CalendarIcon, Users, Search } from 'lucide-react';
import { format } from 'date-fns';

export function SearchForm() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState('1');
  const [propertyType, setPropertyType] = useState('');

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (location) searchParams.set('location', location);
    if (checkIn) searchParams.set('checkin', format(checkIn, 'yyyy-MM-dd'));
    if (checkOut) searchParams.set('checkout', format(checkOut, 'yyyy-MM-dd'));
    if (guests) searchParams.set('guests', guests);
    if (propertyType) searchParams.set('type', propertyType);
    
    router.push(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Location */}
        <div className="lg:col-span-2">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Where are you going?"
              data-search-location
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 h-12 bg-white border-gray-300 focus:border-plp-purple focus:ring-plp-purple"
            />
          </div>
        </div>

        {/* Check-in */}
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 justify-start text-left font-normal bg-white border-gray-300 hover:bg-gray-50"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                {checkIn ? format(checkIn, 'MMM dd') : 'Check-in'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={setCheckIn}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out */}
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 justify-start text-left font-normal bg-white border-gray-300 hover:bg-gray-50"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                {checkOut ? format(checkOut, 'MMM dd') : 'Check-out'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={setCheckOut}
                disabled={(date) => date < new Date() || (checkIn && date < checkIn)}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Button */}
        <div>
          <Button onClick={handleSearch} className="w-full h-12 btn-accent font-semibold" data-search-button>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      {/* Property Type & Guests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="bg-white border-gray-300">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hotels">Hotels</SelectItem>
            <SelectItem value="houses">Houses</SelectItem>
            <SelectItem value="land">Land</SelectItem>
            <SelectItem value="apartments">Apartments</SelectItem>
          </SelectContent>
        </Select>

        <Select value={guests} onValueChange={setGuests}>
          <SelectTrigger className="bg-white border-gray-300">
            <Users className="mr-2 h-4 w-4 text-gray-400" />
            <SelectValue placeholder="Guests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Guest</SelectItem>
            <SelectItem value="2">2 Guests</SelectItem>
            <SelectItem value="3">3 Guests</SelectItem>
            <SelectItem value="4">4 Guests</SelectItem>
            <SelectItem value="5+">5+ Guests</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}