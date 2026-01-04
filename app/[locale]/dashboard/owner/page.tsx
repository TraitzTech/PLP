'use client'

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardStatsLoader } from '@/components/ui/shimmer-loaders';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Calendar, DollarSign, Eye, Star, TrendingUp, Users, MessageSquare, Plus, ChartBar as BarChart3 } from 'lucide-react';
import Link from 'next/link';

// Mock data
const ownerStats = {
  totalProperties: 5,
  activeBookings: 12,
  monthlyRevenue: 8450,
  totalViews: 2340,
  averageRating: 4.7,
  occupancyRate: 78,
};

const recentBookings = [
  {
    id: '1',
    property: 'Ocean View Villa',
    guest: 'Sarah Johnson',
    checkIn: '2024-02-15',
    checkOut: '2024-02-20',
    status: 'confirmed',
    amount: 6000,
  },
  {
    id: '2',
    property: 'Downtown Apartment',
    guest: 'Michael Chen',
    checkIn: '2024-02-18',
    checkOut: '2024-02-22',
    status: 'pending',
    amount: 1400,
  },
  {
    id: '3',
    property: 'Mountain Cabin',
    guest: 'Emma Rodriguez',
    checkIn: '2024-02-20',
    checkOut: '2024-02-25',
    status: 'confirmed',
    amount: 1400,
  },
];

const properties = [
  {
    id: '1',
    name: 'Luxury Ocean View Villa',
    location: 'Malibu, CA',
    status: 'active',
    bookings: 8,
    revenue: 9600,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
  },
  {
    id: '2',
    name: 'Modern Downtown Apartment',
    location: 'New York, NY',
    status: 'active',
    bookings: 12,
    revenue: 4200,
    rating: 4.7,
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
  },
  {
    id: '3',
    name: 'Cozy Mountain Cabin',
    location: 'Aspen, CO',
    status: 'active',
    bookings: 6,
    revenue: 1680,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
  },
];

const recentMessages = [
  {
    id: '1',
    guest: 'Sarah Johnson',
    property: 'Ocean View Villa',
    message: 'Hi! I have a question about the check-in process...',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: '2',
    guest: 'Michael Chen',
    property: 'Downtown Apartment',
    message: 'Thank you for the great stay! The apartment was perfect.',
    time: '1 day ago',
    unread: false,
  },
];

export default function OwnerDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
            <p className="text-gray-600 mt-2">Here's how your properties are performing.</p>
          </div>
          <Link href="/app/[locale]/dashboard/owner/properties/new">
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add New Property
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{ownerStats.totalProperties}</p>
                </div>
                <Building2 className="w-8 h-8 text-plp-purple" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{ownerStats.activeBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-plp-pink" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${ownerStats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-plp-yellow" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{ownerStats.totalViews.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{ownerStats.averageRating}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Occupancy</p>
                  <p className="text-2xl font-bold text-gray-900">{ownerStats.occupancyRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Bookings
                </CardTitle>
                <Link href="/app/[locale]/dashboard/owner/bookings">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="space-y-2 text-right">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{booking.property}</h3>
                        <p className="text-sm text-gray-600">Guest: {booking.guest}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{booking.checkIn} - {booking.checkOut}</span>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${booking.amount}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Messages */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Messages
                </CardTitle>
                <Link href="/app/[locale]/dashboard/owner/messages">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-2 w-2 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-24 mb-1" />
                        <Skeleton className="h-3 w-full mb-1" />
                        <Skeleton className="h-3 w-20 mt-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="space-y-3">
                  {recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg border ${
                        message.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900">
                          {message.guest}
                        </h4>
                        {message.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{message.property}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {message.message}
                      </p>
                      <span className="text-xs text-gray-500 mt-2 block">{message.time}</span>
                    </div>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Properties Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Your Properties
            </CardTitle>
            <div className="flex gap-2">
              <Link href="/app/[locale]/dashboard/owner/analytics">
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link href="/app/[locale]/dashboard/owner/properties">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <Skeleton className="w-full h-48" />
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-32" />
                      <div className="grid grid-cols-3 gap-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 flex-1" />
                        <Skeleton className="h-8 flex-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="border rounded-lg overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{property.name}</h3>
                      <Badge className={getStatusColor(property.status)}>
                        {property.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{property.location}</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{property.bookings}</p>
                        <p className="text-gray-600">Bookings</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">${property.revenue}</p>
                        <p className="text-gray-600">Revenue</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{property.rating}</p>
                        <p className="text-gray-600">Rating</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}