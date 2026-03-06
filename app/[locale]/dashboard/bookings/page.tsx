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
import { Calendar, MapPin, Star, Search, Filter, Download, MessageSquare, X, AlertCircle, Loader2, ExternalLink, Phone, User as UserIcon, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { bookingService, Booking } from '@/services/bookingService';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import { platformAccessService } from '@/services/platformAccessService';
import { usePathname, useRouter } from 'next/navigation';

export default function BookingsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [payingAccessBookingId, setPayingAccessBookingId] = useState<number | null>(null);
  const [platformFeeXaf, setPlatformFeeXaf] = useState(1000);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadBookings(currentPage);
  }, [currentPage, statusFilter]);

  // Use a separate effect for search with debounce if needed, but here we can just reset page
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadBookings(1);
    }
  }, [searchTerm]);

  const loadBookings = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined,
      };

      const [response, feeResponse] = await Promise.all([
        bookingService.getMyBookings(params),
        platformAccessService.getFeeConfig(),
      ]);
      
      setBookings(response.data || []);
      setFilteredBookings(response.data || []); // With server pagination, we don't need client filter
      
      if (response.meta) {
        setCurrentPage(response.meta.current_page);
        setTotalPages(response.meta.last_page);
        setTotalItems(response.meta.total);
      }
      
      setPlatformFeeXaf(feeResponse.data.platform_fee_xaf || 0);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    setCancellingId(bookingToCancel.id);
    try {
      await bookingService.cancelBooking(bookingToCancel.id);
      setBookings(prev => 
        prev.map(b => b.id === bookingToCancel.id ? { ...b, status: 'cancelled' as const } : b)
      );
      setFilteredBookings(prev => 
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

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    setDeletingId(bookingToDelete.id);
    try {
      await bookingService.deleteBooking(bookingToDelete.id);
      
      // If we are on a page that becomes empty after deletion, go back a page
      if (bookings.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        loadBookings(currentPage);
      }
      
      toast.success('Booking deleted successfully');
      setShowDeleteDialog(false);
      setBookingToDelete(null);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete booking';
      toast.error(message);
    } finally {
      setDeletingId(null);
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

  const getLocalePrefix = () => {
    const locale = pathname.split('/').filter(Boolean)[0];
    return locale === 'en' || locale === 'fr' ? `/${locale}` : '';
  };

  const handleContactAgent = async (booking: Booking) => {
    const agentId = Number(booking.listing?.agent?.id ?? 0) || null;
    const agentUserId = Number(booking.listing?.agent?.user?.id ?? 0) || null;

    if (!agentId || !agentUserId) {
      toast.error('Agent information is not available for this booking.');
      return;
    }

    if (booking.can_chat_with_agent) {
      router.push(`${getLocalePrefix()}/dashboard/messages?userId=${agentUserId}`);
      return;
    }

    if (!booking.requires_platform_fee) {
      toast.error('Chat is currently unavailable for this booking.');
      return;
    }

    setPayingAccessBookingId(booking.id);
    try {
      const payment = await platformAccessService.pay({
        agent_id: agentId,
        booking_id: booking.id,
        payment_channel: 'MTN',
      });

      toast.success(payment.message || 'Platform fee paid. You can now contact this agent.');

      setBookings((prev) =>
        prev.map((item) =>
          item.id === booking.id
            ? { ...item, can_chat_with_agent: true, requires_platform_fee: false }
            : item
        )
      );
      
      router.push(`${getLocalePrefix()}/dashboard/messages?userId=${agentUserId}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to process platform fee payment.');
    } finally {
      setPayingAccessBookingId(null);
    }
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
                            {booking.status === 'completed' && (
                              <Link href={`/property/${booking.listing_id}`}>
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
                            {(booking.status === 'cancelled' || booking.status === 'completed') && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setBookingToDelete(booking);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
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

                      {/* Agent Contact Section */}
                      {booking.listing?.agent?.user && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <UserIcon className="w-4 h-4 mr-2" />
                            Your Property Agent
                          </h4>
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-plp-purple to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {booking.listing.agent.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-base">
                                  {booking.listing.agent.user.name}
                                </p>
                                <p className="text-sm text-gray-600 mb-2">Professional Property Agent</p>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center text-gray-700">
                                    <span className="text-gray-500 w-16">Email:</span>
                                    <a
                                      href={`mailto:${booking.listing.agent.user.email}`}
                                      className="text-plp-purple hover:underline truncate"
                                    >
                                      {booking.listing.agent.user.email}
                                    </a>
                                  </div>
                                  {booking.listing.agent.user.phone && (
                                    <div className="flex items-center text-gray-700">
                                      <span className="text-gray-500 w-16">Phone:</span>
                                      <a
                                        href={`tel:${booking.listing.agent.user.phone}`}
                                        className="text-plp-purple hover:underline"
                                      >
                                        {booking.listing.agent.user.phone}
                                      </a>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {booking.listing.agent.user.phone && (
                                    <a href={`tel:${booking.listing.agent.user.phone}`}>
                                      <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                                      >
                                        <Phone className="w-3 h-3 mr-1" />
                                        Call Now
                                      </Button>
                                    </a>
                                  )}
                                  <a href={`mailto:${booking.listing.agent.user.email}`}>
                                    <Button size="sm" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                      Email
                                    </Button>
                                  </a>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-plp-purple text-plp-purple hover:bg-purple-50"
                                    onClick={() => handleContactAgent(booking)}
                                    disabled={payingAccessBookingId === booking.id}
                                  >
                                    {payingAccessBookingId === booking.id ? (
                                      <>
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        Processing...
                                      </>
                                    ) : booking.can_chat_with_agent ? (
                                      <>
                                        <MessageSquare className="w-3 h-3 mr-1" />
                                        Chat
                                      </>
                                    ) : booking.requires_platform_fee ? (
                                      <>
                                        <MessageSquare className="w-3 h-3 mr-1" />
                                        Pay {formatCurrency(platformFeeXaf, 'XAF')} & Chat
                                      </>
                                    ) : (
                                      <>
                                        <MessageSquare className="w-3 h-3 mr-1" />
                                        Chat Unavailable
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-9 h-9 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your booking for &quot;{bookingToCancel?.listing?.title}&quot;?
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking record for &quot;{bookingToDelete?.listing?.title}&quot;?
              This will remove it from your history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Keep Record
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteBooking}
              disabled={deletingId !== null}
            >
              {deletingId !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Record'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
