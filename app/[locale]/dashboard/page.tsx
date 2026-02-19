'use client'

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardStatsLoader } from '@/components/ui/shimmer-loaders';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Calendar, MapPin, Star, CreditCard, Chrome as Home, Bell, ExternalLink, AlertCircle } from 'lucide-react';
import { bookingService, Booking } from '@/services/bookingService';
import { notificationService, Notification } from '@/services/notificationService';
import { reviewService, Review } from '@/services/reviewService';
import { savedPropertyService } from '@/services/savedPropertyService';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CustomerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    activeBookings: 0,
    savedProperties: 0,
    totalSpent: 0,
    reviewsGiven: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load all data in parallel
      const [bookingsRes, notificationsRes, reviewsRes, savedPropertiesRes] = await Promise.all([
        bookingService.getMyBookings().catch(() => ({ data: [] })),
        notificationService.getRecentNotifications(5).catch(() => ({ data: { notifications: [], unread_count: 0 } })),
        reviewService.getMyReviews().catch(() => ({ data: [] })),
        savedPropertyService.getSavedProperties().catch(() => ({ data: [] })),
      ]);

      const bookingsData = bookingsRes.data || [];
      const notificationsData = notificationsRes.data?.notifications || notificationsRes.data || [];
      const reviewsData = reviewsRes.data || [];
      const savedPropertiesData = savedPropertiesRes.data || [];

      setBookings(bookingsData.slice(0, 5)); // Show only recent 5
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      setReviews(reviewsData);

      // Calculate stats
      const activeBookings = bookingsData.filter((b: Booking) => 
        b.status === 'confirmed' || b.status === 'pending'
      ).length;
      
      const totalSpent = bookingsData
        .filter((b: Booking) => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum: number, b: Booking) => sum + (b.total_price || 0), 0);

      setStats({
        activeBookings,
        savedProperties: savedPropertiesData.length,
        totalSpent,
        reviewsGiven: reviewsData.length,
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatCurrency = (amount: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const resolveImageUrl = (img: any): string | null => {
    const src = img?.image_url || img?.image_path || img?.url;
    if (!src) return null;
    if (src.startsWith('http')) return src;
    return `${process.env.NEXT_PUBLIC_API_URL}/../storage/listing_images/${src}`;
  };

  const getPropertyImage = (booking: Booking) => {
    if (booking.listing?.images && booking.listing.images.length > 0) {
      const featuredImage = booking.listing.images.find(img => img.is_featured);
      const url = resolveImageUrl(featuredImage) || resolveImageUrl(booking.listing.images[0]);
      if (url) return url;
    }
    return 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg';
  };

  const markNotificationAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <DashboardLayout userType="customer">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your activity.</p>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <DashboardStatsLoader />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-plp-purple" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saved Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.savedProperties}</p>
                  </div>
                  <Heart className="w-8 h-8 text-plp-pink" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalSpent)}
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-plp-yellow" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reviews Given</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.reviewsGiven}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Bookings & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Bookings
                </CardTitle>
                <Link href="/dashboard/bookings">
                  <Button variant="ghost" size="sm">
                    View All
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Skeleton className="w-16 h-16 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No bookings yet</p>
                    <Link href="/properties">
                      <Button className="mt-4" variant="outline">
                        Browse Properties
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <img
                          src={getPropertyImage(booking)}
                          alt={booking.listing?.title || 'Property'}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {booking.listing?.title || 'Property'}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {booking.listing?.city}, {booking.listing?.region}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 flex-wrap">
                            <span>{formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}</span>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(booking.total_price, booking.currency)}
                          </p>
                          <Link href={`/dashboard/bookings`}>
                            <Button variant="outline" size="sm" className="mt-2">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <Link href="/dashboard/notifications">
                  <Button variant="ghost" size="sm">
                    View All
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 rounded-lg border">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-full mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                        }`}
                        onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
                      >
                        <h4 className="font-medium text-sm text-gray-900">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/properties">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Home className="w-6 h-6" />
                  <span>Browse Properties</span>
                </Button>
              </Link>
              <Link href="/dashboard/bookings">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Calendar className="w-6 h-6" />
                  <span>My Bookings</span>
                </Button>
              </Link>
              <Link href="/dashboard/saved">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Heart className="w-6 h-6" />
                  <span>Saved Properties</span>
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <Star className="w-6 h-6" />
                  <span>My Profile</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}