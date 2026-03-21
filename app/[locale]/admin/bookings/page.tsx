'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, MapPin, Search, Filter, Eye, Check, X, Phone, Mail, User, DollarSign, AlertCircle, Loader2, Building, Download } from 'lucide-react';
import { adminBookingService, Booking, BookingStatistics } from '@/services/bookingService';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, paymentFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        adminBookingService.getBookings({ per_page: 50 }),
        adminBookingService.getStatistics().catch(() => ({ data: null }))
      ]);
      
      // Handle paginated response - bookingsRes.data might have nested data array
      const responseData = bookingsRes.data as any;
      const bookingsData = responseData?.data || responseData || [];
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setStats(statsRes.data);
      
      // Extract pagination info
      if (responseData?.meta || responseData?.last_page) {
        setPagination({
          currentPage: responseData.current_page || responseData.meta?.current_page || 1,
          lastPage: responseData.last_page || responseData.meta?.last_page || 1,
          total: responseData.total || responseData.meta?.total || bookingsData.length
        });
      } else {
        setPagination({
          currentPage: 1,
          lastPage: 1,
          total: Array.isArray(bookingsData) ? bookingsData.length : 0
        });
      }
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
        booking.guest_email?.toLowerCase().includes(search) ||
        booking.listing?.agent?.user?.name?.toLowerCase().includes(search)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(booking => booking.payment_status === paymentFilter);
    }
    
    setFilteredBookings(filtered);
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking || !newStatus) return;
    
    setProcessingId(selectedBooking.id);
    try {
      await adminBookingService.updateStatus(selectedBooking.id, newStatus);
      setBookings(prev => 
        prev.map(b => b.id === selectedBooking.id ? { ...b, status: newStatus as Booking['status'] } : b)
      );
      toast.success(`Booking status updated to ${newStatus}`);
      setIsStatusDialogOpen(false);
      setSelectedBooking(null);
      setNewStatus('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update status';
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!selectedBooking || !newPaymentStatus) return;
    
    setProcessingId(selectedBooking.id);
    try {
      await adminBookingService.updatePaymentStatus(selectedBooking.id, newPaymentStatus);
      setBookings(prev => 
        prev.map(b => b.id === selectedBooking.id ? { ...b, payment_status: newPaymentStatus as Booking['payment_status'] } : b)
      );
      toast.success(`Payment status updated to ${newPaymentStatus}`);
      setIsPaymentDialogOpen(false);
      setSelectedBooking(null);
      setNewPaymentStatus('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update payment status';
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    setProcessingId(selectedBooking.id);
    try {
      await adminBookingService.cancelBooking(selectedBooking.id, cancelReason);
      setBookings(prev => 
        prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'cancelled' as const } : b)
      );
      toast.success('Booking cancelled');
      setIsCancelDialogOpen(false);
      setSelectedBooking(null);
      setCancelReason('');
      loadData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to cancel booking';
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'failed':
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
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Reservations</h1>
            <p className="text-gray-600 mt-2">Manage and monitor all platform reservations.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total</p>
                    <p className="text-xl font-bold text-gray-900">{stats.total_bookings}</p>
                  </div>
                  <Calendar className="w-6 h-6 text-plp-purple" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Pending</p>
                    <p className="text-xl font-bold text-yellow-600">{stats.pending_bookings}</p>
                  </div>
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Confirmed</p>
                    <p className="text-xl font-bold text-green-600">{stats.confirmed_bookings}</p>
                  </div>
                  <Check className="w-6 h-6 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Completed</p>
                    <p className="text-xl font-bold text-blue-600">{stats.completed_bookings || 0}</p>
                  </div>
                  <Building className="w-6 h-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Revenue</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(stats.total_revenue)}
                    </p>
                  </div>
                  <DollarSign className="w-6 h-6 text-plp-pink" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by property, guest, agent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reservations found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No bookings have been made yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          /* Bookings Table */
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Property</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => {
                      const guest = getGuestInfo(booking);
                      return (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={getPropertyImage(booking)}
                                alt={booking.listing?.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium text-sm line-clamp-1">{booking.listing?.title || 'Property'}</p>
                                <p className="text-xs text-gray-500">{booking.listing?.city}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{guest.name}</p>
                              <p className="text-xs text-gray-500">{guest.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{booking.listing?.agent?.user?.name || 'N/A'}</p>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{formatDate(booking.check_in_date)}</p>
                              <p className="text-gray-500">to {formatDate(booking.check_out_date)}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-sm text-plp-purple">
                              {formatCurrency(booking.total_price, booking.currency)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`${getStatusColor(booking.status)} cursor-pointer`}
                              onClick={() => {
                                setSelectedBooking(booking);
                                setNewStatus(booking.status);
                                setIsStatusDialogOpen(true);
                              }}
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`${getPaymentStatusColor(booking.payment_status)} cursor-pointer`}
                              onClick={() => {
                                setSelectedBooking(booking);
                                setNewPaymentStatus(booking.payment_status);
                                setIsPaymentDialogOpen(true);
                              }}
                            >
                              {booking.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  router.push(`/admin/reservations/${booking.id}`);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setIsCancelDialogOpen(true);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination Info */}
        {!isLoading && filteredBookings.length > 0 && (
          <div className="text-sm text-gray-600 text-center">
            Showing {filteredBookings.length} of {pagination.total} reservations
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
                  <div className="flex gap-2 mt-2">
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(selectedBooking.payment_status)}>
                      {selectedBooking.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Guest:</span>
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
                  <span className="text-gray-500">Agent:</span>
                  <p className="font-medium">{selectedBooking.listing?.agent?.user?.name || 'N/A'}</p>
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
                  <span className="text-gray-500">Guests:</span>
                  <p className="font-medium">{selectedBooking.guest_count || 1}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total Price:</span>
                  <p className="font-medium text-plp-purple">
                    {formatCurrency(selectedBooking.total_price, selectedBooking.currency)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Booked:</span>
                  <p className="font-medium">{formatDate(selectedBooking.created_at)}</p>
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

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Change the status of this booking.
            </DialogDescription>
          </DialogHeader>
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStatus}
              disabled={processingId !== null || !newStatus}
            >
              {processingId !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Payment Status Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Change the payment status of this booking.
            </DialogDescription>
          </DialogHeader>
          <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePaymentStatus}
              disabled={processingId !== null || !newPaymentStatus}
            >
              {processingId !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Payment'
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
              Are you sure you want to cancel this booking? This action may notify the guest.
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
