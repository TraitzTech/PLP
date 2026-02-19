'use client'

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Star, Search, Filter, Download, MessageSquare, X, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { bookingService, Booking } from '@/services/bookingService';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const response = await bookingService.getMyBookings();
      setBookings(response.data || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.listing?.title?.toLowerCase().includes(search) ||
        booking.listing?.city?.toLowerCase().includes(search) ||
        booking.listing?.region?.toLowerCase().includes(search)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    setCancellingId(bookingToCancel.id);
    try {
      await bookingService.cancelBooking(bookingToCancel.id);
      setBookings(prev => 
        prev.map(b => b.id === bookingToCancel.id ? { ...b, status: 'cancelled' as const } : b)
      );
      toast.success('Booking cancelled successfully');
      setShowCancelDialog(false);
      setBookingToCancel(null);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cancel booking';
      toast.error(message);
    } finally {
      setCancellingId(null);
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
 

  const getNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
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

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    <Skeleton className="lg:w-64 h-48 lg:h-auto" />
                    <div className="flex-1 p-6 space-y-4">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : "You haven't made any bookings yet. Start exploring properties!"}
              </p>
              <Link href="/search">
                <Button className="btn-primary">
                  Browse Properties
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Bookings List */
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-64 h-48 lg:h-auto relative">
                      <img
                        src={getPropertyImage(booking)}
                        alt={booking.listing?.title || 'Property'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {booking.listing?.title || 'Property'}
                            </h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="flex items-center text-gray-600 mb-3">
                            <MapPin className="w-4 h-4 mr-1" />
                            {booking.listing?.city}, {booking.listing?.region}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Check-in:</span>
                              <p className="font-medium">{formatDate(booking.check_in_date)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Check-out:</span>
                              <p className="font-medium">{formatDate(booking.check_out_date)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Nights:</span>
                              <p className="font-medium">{getNights(booking.check_in_date, booking.check_out_date)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Guests:</span>
                              <p className="font-medium">{booking.guest_count || 1}</p>
                            </div>
                          </div>
                          {booking.special_requests && (
                            <div className="mt-3 text-sm">
                              <span className="text-gray-500">Special Requests:</span>
                              <p className="text-gray-700">{booking.special_requests}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right w-full lg:w-auto">
                          <div className="text-2xl font-bold text-plp-purple mb-2">
                            {formatCurrency(booking.total_price, booking.currency)}
                          </div>
                          <div className="flex gap-2 flex-wrap justify-end">
                            {booking.listing?.agent?.user && (
                              <Button variant="outline" size="sm">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Contact
                              </Button>
                            )}
                            {booking.status === 'completed' && (
                              <Link href={`/properties/${booking.listing_id}`}>
                                <Button variant="outline" size="sm">
                                  <Star className="w-4 h-4 mr-1" />
                                  Review
                                </Button>
                              </Link>
                            )}
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setBookingToCancel(booking);
                                  setShowCancelDialog(true);
                                }}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                            <Link href={`/property/${booking.listing_id}`}>
                              <Button size="sm" className="btn-primary">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View Property
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your booking for "{bookingToCancel?.listing?.title}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelBooking}
              disabled={cancellingId !== null}
            >
              {cancellingId !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
