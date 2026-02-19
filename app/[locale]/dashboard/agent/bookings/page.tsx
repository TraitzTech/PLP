'use client'

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Search, Filter, Eye, Check, X, Phone, Mail, User, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { agentBookingService, Booking, BookingStatistics } from '@/services/bookingService';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function AgentBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        agentBookingService.getBookings(),
        agentBookingService.getStatistics().catch(() => ({ data: null }))
      ]);
      setBookings(bookingsRes.data || []);
      setStats(statsRes.data);
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
        booking.user?.name?.toLowerCase().includes(search) ||
        booking.user?.email?.toLowerCase().includes(search) ||
        booking.guest_name?.toLowerCase().includes(search) ||
        booking.guest_email?.toLowerCase().includes(search)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    setFilteredBookings(filtered);
  };

  const handleConfirmBooking = async () => {
    if (!selectedBooking) return;
    
    setProcessingId(selectedBooking.id);
    try {
      await agentBookingService.confirmBooking(selectedBooking.id);
      setBookings(prev => 
        prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'confirmed' as const } : b)
      );
      toast.success('Booking confirmed successfully');
      setIsConfirmDialogOpen(false);
      setSelectedBooking(null);
      loadData(); // Refresh stats
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to confirm booking';
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    setProcessingId(selectedBooking.id);
    try {
      await agentBookingService.cancelBooking(selectedBooking.id, cancelReason);
      setBookings(prev => 
        prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'cancelled' as const } : b)
      );
      toast.success('Booking cancelled');
      setIsCancelDialogOpen(false);
      setSelectedBooking(null);
      setCancelReason('');
      loadData(); // Refresh stats
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cancel booking';
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteBooking = async (booking: Booking) => {
    setProcessingId(booking.id);
    try {
      await agentBookingService.completeBooking(booking.id);
      setBookings(prev => 
        prev.map(b => b.id === booking.id ? { ...b, status: 'completed' as const } : b)
      );
      toast.success('Booking marked as completed');
      loadData(); // Refresh stats
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to complete booking';
      toast.error(message);
    } finally {
      setProcessingId(null);
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

  const getGuestInfo = (booking: Booking) => {
    if (booking.user) {
      return {
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone || 'N/A',
        isGuest: false
      };
    }
    return {
      name: booking.guest_name || 'Guest',
      email: booking.guest_email || 'N/A',
      phone: booking.guest_phone || 'N/A',
      isGuest: true
    };
  };

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-2">Manage all bookings for your properties.</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_bookings}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-plp-purple" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending_bookings}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Confirmed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.confirmed_bookings}</p>
                  </div>
                  <Check className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.total_revenue)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-plp-pink" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by property, guest name or email..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
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
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="w-20 h-20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : "You don't have any bookings yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Bookings List */
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const guest = getGuestInfo(booking);
              return (
                <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Property Image */}
                      <div className="w-full lg:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getPropertyImage(booking)}
                          alt={booking.listing?.title || 'Property'}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.listing?.title || 'Property'}
                            </h3>
                            <div className="flex items-center text-gray-600 text-sm mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {booking.listing?.city}, {booking.listing?.region}
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>

                        {/* Guest Info */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{guest.name}</span>
                            {guest.isGuest && (
                              <Badge variant="outline" className="text-xs">Guest</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{guest.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{guest.phone}</span>
                          </div>
                        </div>

                        {/* Dates and Price */}
                        <div className="mt-4 flex flex-wrap gap-6 text-sm">
                          <div>
                            <span className="text-gray-500">Check-in:</span>
                            <p className="font-medium">{formatDate(booking.check_in_date)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Check-out:</span>
                            <p className="font-medium">{formatDate(booking.check_out_date)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Guests:</span>
                            <p className="font-medium">{booking.guest_count || 1}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <p className="font-medium text-plp-purple">
                              {formatCurrency(booking.total_price, booking.currency)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Booked:</span>
                            <p className="font-medium">
                              {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>

                        {booking.special_requests && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                            <span className="text-gray-500">Special Requests:</span>
                            <p className="text-gray-700 mt-1">{booking.special_requests}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col gap-2 flex-wrap justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        
                        {booking.status === 'pending' && (
                          <>
                            <Button 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsConfirmDialogOpen(true);
                              }}
                              disabled={processingId === booking.id}
                            >
                              {processingId === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Confirm
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsCancelDialogOpen(true);
                              }}
                              disabled={processingId === booking.id}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}

                        {booking.status === 'confirmed' && (
                          <>
                            <Button 
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => handleCompleteBooking(booking)}
                              disabled={processingId === booking.id}
                            >
                              {processingId === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Complete
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsCancelDialogOpen(true);
                              }}
                              disabled={processingId === booking.id}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={getPropertyImage(selectedBooking)}
                  alt={selectedBooking.listing?.title}
                  className="w-32 h-32 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{selectedBooking.listing?.title}</h3>
                  <p className="text-gray-600">{selectedBooking.listing?.city}, {selectedBooking.listing?.region}</p>
                  <Badge className={`mt-2 ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Guest Name:</span>
                  <p className="font-medium">{getGuestInfo(selectedBooking).name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium">{getGuestInfo(selectedBooking).email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <p className="font-medium">{getGuestInfo(selectedBooking).phone}</p>
                </div>
                <div>
                  <span className="text-gray-500">Guests:</span>
                  <p className="font-medium">{selectedBooking.guest_count || 1}</p>
                </div>
                <div>
                  <span className="text-gray-500">Check-in:</span>
                  <p className="font-medium">{formatDate(selectedBooking.check_in_date)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Check-out:</span>
                  <p className="font-medium">{formatDate(selectedBooking.check_out_date)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total Price:</span>
                  <p className="font-medium text-plp-purple">
                    {formatCurrency(selectedBooking.total_price, selectedBooking.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Payment Status:</span>
                  <p className="font-medium capitalize">{selectedBooking.payment_status}</p>
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div>
                  <span className="text-gray-500 text-sm">Special Requests:</span>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">{selectedBooking.special_requests}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Booking Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm this booking? The guest will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleConfirmBooking}
              disabled={processingId !== null}
            >
              {processingId !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancellation. The guest will be notified.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for cancellation (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCancelDialogOpen(false);
              setCancelReason('');
            }}>
              Go Back
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={processingId !== null}
            >
              {processingId !== null ? (
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
