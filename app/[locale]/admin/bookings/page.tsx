'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, MapPin, Star, Search, Filter, Download, Eye, CircleCheck as CheckCircle, Circle as XCircle, DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';

// Mock bookings data
const mockBookings = [
  {
    id: 'BK001',
    property: 'Luxury Ocean View Villa',
    propertyId: '1',
    guest: 'John Doe',
    guestId: '1',
    owner: 'Sarah Johnson',
    ownerId: '2',
    location: 'Malibu, California',
    checkIn: '2024-02-15',
    checkOut: '2024-02-20',
    guests: 4,
    status: 'confirmed',
    total: 3600000,
    commission: 360000,
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
    bookingDate: '2024-01-10',
    confirmationCode: 'PLP-BK001-2024',
  },
  {
    id: 'BK002',
    property: 'Modern Downtown Apartment',
    propertyId: '2',
    guest: 'Michael Chen',
    guestId: '3',
    owner: 'Emma Rodriguez',
    ownerId: '4',
    location: 'New York, NY',
    checkIn: '2024-03-10',
    checkOut: '2024-03-15',
    guests: 2,
    status: 'pending',
    total: 1050000,
    commission: 105000,
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
    bookingDate: '2024-02-01',
    confirmationCode: 'PLP-BK002-2024',
  },
  {
    id: 'BK003',
    property: 'Cozy Mountain Cabin',
    propertyId: '3',
    guest: 'Sarah Wilson',
    guestId: '5',
    owner: 'David Brown',
    ownerId: '6',
    location: 'Aspen, Colorado',
    checkIn: '2024-01-20',
    checkOut: '2024-01-25',
    guests: 6,
    status: 'completed',
    total: 840000,
    commission: 84000,
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
    bookingDate: '2023-12-15',
    confirmationCode: 'PLP-BK003-2024',
  },
  {
    id: 'BK004',
    property: 'Beachfront Resort Suite',
    propertyId: '4',
    guest: 'Emma Davis',
    guestId: '7',
    owner: 'Robert Taylor',
    ownerId: '8',
    location: 'Miami Beach, FL',
    checkIn: '2024-04-01',
    checkOut: '2024-04-07',
    guests: 3,
    status: 'cancelled',
    total: 1890000,
    commission: 0,
    image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
    bookingDate: '2024-02-10',
    confirmationCode: 'PLP-BK004-2024',
  },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState(mockBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.confirmationCode.toLowerCase().includes(searchTerm.toLowerCase());
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total, 0);
  const totalCommission = bookings.reduce((sum, booking) => sum + booking.commission, 0);

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-2">Monitor and manage all platform bookings and transactions.</p>
          </div>
          <Button className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export Bookings
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-plp-purple" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalRevenue).replace('XAF', '').trim()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-plp-pink" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalCommission).replace('XAF', '').trim()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-plp-yellow" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
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
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={booking.image}
                    alt={booking.property}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{booking.property}</h3>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {booking.location}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Guest:</span>
                        <p className="font-medium">{booking.guest}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Owner:</span>
                        <p className="font-medium">{booking.owner}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Dates:</span>
                        <p className="font-medium">{booking.checkIn} - {booking.checkOut}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Guests:</span>
                        <p className="font-medium">{booking.guests}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-plp-purple">
                      {formatCurrency(booking.total)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Commission: {formatCurrency(booking.commission)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {booking.confirmationCode}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Booking Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <img
                  src={selectedBooking.image}
                  alt={selectedBooking.property}
                  className="w-full h-48 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedBooking.property}</h3>
                  <p className="text-gray-600">{selectedBooking.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Guest:</span>
                    <p className="font-medium">{selectedBooking.guest}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Owner:</span>
                    <p className="font-medium">{selectedBooking.owner}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Check-in:</span>
                    <p className="font-medium">{selectedBooking.checkIn}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Check-out:</span>
                    <p className="font-medium">{selectedBooking.checkOut}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Guests:</span>
                    <p className="font-medium">{selectedBooking.guests}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <Badge className={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500">Total Amount:</span>
                      <p className="font-bold text-plp-purple text-lg">
                        {formatCurrency(selectedBooking.total)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Commission (10%):</span>
                      <p className="font-bold text-plp-pink text-lg">
                        {formatCurrency(selectedBooking.commission)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}