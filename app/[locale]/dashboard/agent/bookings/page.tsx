'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, MapPin, Star, Search, Filter, Download, Eye, CircleCheck as CheckCircle, Circle as XCircle, MessageSquare, Phone } from 'lucide-react';
import { toast } from 'sonner';

// Mock bookings data for agent
const mockBookings = [
  {
    id: 'BK001',
    property: 'Luxury Villa Bastos',
    propertyId: '1',
    client: 'Marie Dubois',
    clientId: '1',
    clientPhone: '+237 6XX XXX XXX',
    clientEmail: 'marie.dubois@email.com',
    location: 'Bastos, Yaoundé',
    checkIn: '2024-02-20',
    checkOut: '2024-02-25',
    guests: 4,
    status: 'confirmed',
    total: 2400000,
    commission: 360000, // 15% agent commission
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
    bookingDate: '2024-01-15',
    confirmationCode: 'PLP-BK001-2024',
    specialRequests: 'Arrivée tardive prévue vers 22h',
  },
  {
    id: 'BK002',
    property: 'Modern Apartment Bonanjo',
    propertyId: '2',
    client: 'Jean-Paul Kamga',
    clientId: '2',
    clientPhone: '+237 6XX XXX XXY',
    clientEmail: 'jp.kamga@email.com',
    location: 'Bonanjo, Douala',
    checkIn: '2024-02-22',
    checkOut: '2024-02-27',
    guests: 2,
    status: 'pending',
    total: 900000,
    commission: 135000,
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
    bookingDate: '2024-02-01',
    confirmationCode: 'PLP-BK002-2024',
    specialRequests: 'Besoin d\'un lit bébé',
  },
  {
    id: 'BK003',
    property: 'Executive Suite Akwa',
    propertyId: '3',
    client: 'Fatima Nkomo',
    clientId: '3',
    clientPhone: '+237 6XX XXX XXZ',
    clientEmail: 'fatima.nkomo@email.com',
    location: 'Akwa, Douala',
    checkIn: '2024-01-10',
    checkOut: '2024-01-15',
    guests: 1,
    status: 'completed',
    total: 1250000,
    commission: 187500,
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
    bookingDate: '2023-12-20',
    confirmationCode: 'PLP-BK003-2024',
    specialRequests: '',
  },
  {
    id: 'BK004',
    property: 'Luxury Villa Bastos',
    propertyId: '1',
    client: 'Robert Tchoumi',
    clientId: '4',
    clientPhone: '+237 6XX XXX XXA',
    clientEmail: 'robert.tchoumi@email.com',
    location: 'Bastos, Yaoundé',
    checkIn: '2024-03-01',
    checkOut: '2024-03-05',
    guests: 6,
    status: 'cancelled',
    total: 1920000,
    commission: 0,
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
    bookingDate: '2024-02-10',
    confirmationCode: 'PLP-BK004-2024',
    specialRequests: '',
  },
];

export default function AgentBookingsPage() {
  const [bookings, setBookings] = useState(mockBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleApproveBooking = (bookingId: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'confirmed' }
        : booking
    ));
    toast.success('Réservation confirmée avec succès');
  };

  const handleRejectBooking = (bookingId: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled', commission: 0 }
        : booking
    ));
    toast.success('Réservation annulée');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total, 0);
  const totalCommission = bookings.reduce((sum, booking) => sum + booking.commission, 0);
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Réservations</h1>
            <p className="text-gray-600 mt-2">Gérez toutes les réservations de vos propriétés.</p>
          </div>
          <Button className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Exporter les Réservations
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Réservations</p>
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
                  <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalRevenue).replace('XAF', '').trim()}
                  </p>
                </div>
                <Star className="w-8 h-8 text-plp-pink" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commissions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalCommission).replace('XAF', '').trim()}
                  </p>
                </div>
                <Star className="w-8 h-8 text-plp-yellow" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Attente</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingBookings}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-orange-500" />
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
                    placeholder="Rechercher des réservations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Statuts</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="pending">En Attente</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>Toutes les Réservations</CardTitle>
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
                        <span className="text-gray-500">Client:</span>
                        <p className="font-medium">{booking.client}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Dates:</span>
                        <p className="font-medium">{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Invités:</span>
                        <p className="font-medium">{booking.guests}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Code:</span>
                        <p className="font-medium">{booking.confirmationCode}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-plp-purple">
                      {formatCurrency(booking.total)}
                    </div>
                    <p className="text-sm text-plp-pink">
                      Commission: {formatCurrency(booking.commission)}
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
                    
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveBooking(booking.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectBooking(booking.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-4 h-4" />
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
              <DialogTitle>Détails de la Réservation</DialogTitle>
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
                    <span className="text-gray-500">Client:</span>
                    <p className="font-medium">{selectedBooking.client}</p>
                    <p className="text-gray-600">{selectedBooking.clientEmail}</p>
                    <p className="text-gray-600">{selectedBooking.clientPhone}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Dates:</span>
                    <p className="font-medium">
                      {formatDate(selectedBooking.checkIn)} - {formatDate(selectedBooking.checkOut)}
                    </p>
                    <p className="text-gray-600">{selectedBooking.guests} invités</p>
                  </div>
                </div>
                {selectedBooking.specialRequests && (
                  <div>
                    <span className="text-gray-500">Demandes spéciales:</span>
                    <p className="font-medium">{selectedBooking.specialRequests}</p>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500">Montant Total:</span>
                      <p className="font-bold text-plp-purple text-lg">
                        {formatCurrency(selectedBooking.total)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Votre Commission (15%):</span>
                      <p className="font-bold text-plp-pink text-lg">
                        {formatCurrency(selectedBooking.commission)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Appeler le Client
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Envoyer un Message
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {filteredBookings.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune réservation trouvée</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Essayez d\'ajuster vos critères de recherche.'
                  : 'Vous n\'avez pas encore de réservations.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}