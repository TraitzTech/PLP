'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Star, Search, Filter, Download, MessageSquare, X } from 'lucide-react';
import Link from 'next/link';

// Mock bookings data
const mockBookings = [
  {
    id: 'BK001',
    property: 'Luxury Ocean View Villa',
    location: 'Malibu, California',
    checkIn: '2024-02-15',
    checkOut: '2024-02-20',
    guests: 4,
    status: 'confirmed',
    total: 3600000, // XAF
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
    bookingDate: '2024-01-10',
    confirmationCode: 'PLP-BK001-2024',
  },
  {
    id: 'BK002',
    property: 'Modern Downtown Apartment',
    location: 'New York, NY',
    checkIn: '2024-03-10',
    checkOut: '2024-03-15',
    guests: 2,
    status: 'pending',
    total: 1050000, // XAF
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
    bookingDate: '2024-02-01',
    confirmationCode: 'PLP-BK002-2024',
  },
  {
    id: 'BK003',
    property: 'Cozy Mountain Cabin',
    location: 'Aspen, Colorado',
    checkIn: '2024-01-20',
    checkOut: '2024-01-25',
    guests: 6,
    status: 'completed',
    total: 840000, // XAF
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
    bookingDate: '2023-12-15',
    confirmationCode: 'PLP-BK003-2024',
  },
  {
    id: 'BK004',
    property: 'Beachfront Resort Suite',
    location: 'Miami Beach, FL',
    checkIn: '2024-04-01',
    checkOut: '2024-04-07',
    guests: 3,
    status: 'cancelled',
    total: 1890000, // XAF
    image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
    bookingDate: '2024-02-10',
    confirmationCode: 'PLP-BK004-2024',
  },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState(mockBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout userType="customer">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-2">Manage and track all your property bookings.</p>
          </div>
          <Button className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export Bookings
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-64 h-48 lg:h-auto">
                    <img
                      src={booking.image}
                      alt={booking.property}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{booking.property}</h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {booking.location}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Check-in:</span>
                            <p className="font-medium">{booking.checkIn}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Check-out:</span>
                            <p className="font-medium">{booking.checkOut}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Guests:</span>
                            <p className="font-medium">{booking.guests}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Confirmation:</span>
                            <p className="font-medium">{booking.confirmationCode}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-plp-purple mb-2">
                          {formatCurrency(booking.total)}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contact Host
                          </Button>
                          {booking.status === 'completed' ? (
                            <Link href={`/app/%5Blocale%5D/dashboard/bookings/${booking.id}/review`}>
                              <Button variant="outline" size="sm" className="mr-2">
                                <Star className="w-4 h-4 mr-1" />
                                Write Review
                              </Button>
                            </Link>
                          ) : null}
                          <Button size="sm" className="btn-primary">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You haven\'t made any bookings yet. Start exploring properties!'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}