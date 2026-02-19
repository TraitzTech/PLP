'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Calendar, Star, Award, MessageSquare, CreditCard as Edit, Camera, Phone, Mail, Globe, DollarSign, Clock } from 'lucide-react';

// Mock user profile data
const userProfile = {
  id: 'user-001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+237 6XX XXX XXX',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
  bio: 'Travel enthusiast and property investor. Love exploring new places and experiencing different cultures. Always looking for unique properties with great stories.',
  location: 'Yaoundé, Cameroon',
  joinedDate: '2023-06-15',
  verified: true,
  stats: {
    totalBookings: 12,
    totalSpent: 7200000, // XAF
    reviewsGiven: 8,
    averageRating: 4.6,
    savedProperties: 15,
    completedTrips: 10,
  },
  badges: [
    { id: 1, name: 'Verified User', icon: '✓', color: 'bg-green-100 text-green-800' },
    { id: 2, name: 'Frequent Traveler', icon: '✈️', color: 'bg-blue-100 text-blue-800' },
    { id: 3, name: 'Great Guest', icon: '⭐', color: 'bg-yellow-100 text-yellow-800' },
  ],
  preferences: {
    language: 'English',
    currency: 'XAF',
    timezone: 'Africa/Douala',
  },
};

// Mock reviews given by user
const userReviews = [
  {
    id: '1',
    property: 'Luxury Ocean View Villa',
    rating: 5,
    comment: 'Absolutely stunning property! The ocean views were breathtaking and the amenities were top-notch. Sarah was an excellent host.',
    date: '2024-01-20',
    images: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'],
  },
  {
    id: '2',
    property: 'Cozy Mountain Cabin',
    rating: 4,
    comment: 'Perfect getaway spot. The cabin was exactly as described and the location was unbeatable. Highly recommend!',
    date: '2024-01-25',
    images: ['https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg'],
  },
];

// Mock booking history
const recentBookings = [
  {
    id: 'BK001',
    property: 'Luxury Ocean View Villa',
    location: 'Malibu, California',
    dates: 'Feb 15-20, 2024',
    status: 'completed',
    amount: 3600000,
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
  },
  {
    id: 'BK002',
    property: 'Cozy Mountain Cabin',
    location: 'Aspen, Colorado',
    dates: 'Jan 20-25, 2024',
    status: 'completed',
    amount: 840000,
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
  },
];

export default function ProfilePage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout userType="customer">
      <div className="space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback className="text-2xl">
                    {userProfile.firstName[0]}{userProfile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {userProfile.firstName} {userProfile.lastName}
                  </h1>
                  {userProfile.verified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Award className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {userProfile.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {formatDate(userProfile.joinedDate)}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                    {userProfile.stats.averageRating} rating
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 max-w-2xl">{userProfile.bio}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {userProfile.badges.map((badge) => (
                    <Badge key={badge.id} className={badge.color}>
                      <span className="mr-1">{badge.icon}</span>
                      {badge.name}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <Button className="btn-primary">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Info
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-plp-purple">{userProfile.stats.totalBookings}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-plp-pink">{userProfile.stats.completedTrips}</div>
              <div className="text-sm text-gray-600">Completed Trips</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-plp-yellow">{formatCurrency(userProfile.stats.totalSpent)}</div>
              <div className="text-sm text-gray-600">Total Spent (XAF)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{userProfile.stats.reviewsGiven}</div>
              <div className="text-sm text-gray-600">Reviews Given</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{userProfile.stats.savedProperties}</div>
              <div className="text-sm text-gray-600">Saved Properties</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{userProfile.stats.averageRating}</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="reviews">My Reviews</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Recent Activity */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={booking.image}
                        alt={booking.property}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{booking.property}</h3>
                        <p className="text-sm text-gray-600">{booking.location}</p>
                        <p className="text-sm text-gray-500">{booking.dates}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-plp-purple">
                          {formatCurrency(booking.amount)}
                        </div>
                        <Badge className="bg-green-100 text-green-800 mt-1">
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reviews I've Written</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {userReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <img
                          src={review.images[0]}
                          alt={review.property}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{review.property}</h3>
                            <div className="flex items-center">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                          <p className="text-sm text-gray-500">{formatDate(review.date)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Info */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{userProfile.email}</div>
                    <div className="text-sm text-gray-500">Primary email</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{userProfile.phone}</div>
                    <div className="text-sm text-gray-500">Mobile phone</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{userProfile.location}</div>
                    <div className="text-sm text-gray-500">Current location</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">Language: {userProfile.preferences.language}</div>
                    <div className="text-sm text-gray-500">Display language</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">Currency: {userProfile.preferences.currency}</div>
                    <div className="text-sm text-gray-500">Preferred currency</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">Timezone: {userProfile.preferences.timezone}</div>
                    <div className="text-sm text-gray-500">Local timezone</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}