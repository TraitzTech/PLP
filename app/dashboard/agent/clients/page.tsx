'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Search, Filter, MessageSquare, Phone, Mail, Star, Calendar, MapPin, Eye } from 'lucide-react';

// Mock clients data for agent
const mockClients = [
  {
    id: '1',
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@email.com',
    phone: '+237 6XX XXX XXX',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    location: 'Yaoundé, Cameroun',
    joinedDate: '2023-08-15',
    totalBookings: 5,
    totalSpent: 8400000,
    averageRating: 4.8,
    lastBooking: '2024-02-20',
    preferredProperties: ['Luxury Villa', 'Executive Suite'],
    status: 'active',
    notes: 'Client VIP, préfère les propriétés de luxe avec vue',
  },
  {
    id: '2',
    firstName: 'Jean-Paul',
    lastName: 'Kamga',
    email: 'jp.kamga@email.com',
    phone: '+237 6XX XXX XXY',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    location: 'Douala, Cameroun',
    joinedDate: '2023-11-20',
    totalBookings: 3,
    totalSpent: 3600000,
    averageRating: 4.6,
    lastBooking: '2024-02-22',
    preferredProperties: ['Modern Apartment', 'Business Suite'],
    status: 'active',
    notes: 'Voyage d\'affaires fréquent, besoin de WiFi rapide',
  },
  {
    id: '3',
    firstName: 'Fatima',
    lastName: 'Nkomo',
    email: 'fatima.nkomo@email.com',
    phone: '+237 6XX XXX XXZ',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    location: 'Bamenda, Cameroun',
    joinedDate: '2024-01-10',
    totalBookings: 2,
    totalSpent: 2100000,
    averageRating: 4.9,
    lastBooking: '2024-01-15',
    preferredProperties: ['Family Suite', 'Villa'],
    status: 'active',
    notes: 'Voyage en famille, besoin d\'équipements pour enfants',
  },
  {
    id: '4',
    firstName: 'Robert',
    lastName: 'Tchoumi',
    email: 'robert.tchoumi@email.com',
    phone: '+237 6XX XXX XXA',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    location: 'Bafoussam, Cameroun',
    joinedDate: '2023-06-05',
    totalBookings: 1,
    totalSpent: 1920000,
    averageRating: 4.2,
    lastBooking: '2024-03-01',
    preferredProperties: ['Luxury Villa'],
    status: 'inactive',
    notes: 'A annulé sa dernière réservation, à recontacter',
  },
];

export default function AgentClientsPage() {
  const [clients, setClients] = useState(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'vip':
        return 'bg-purple-100 text-purple-800';
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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalRevenue = clients.reduce((sum, client) => sum + client.totalSpent, 0);
  const averageSpending = totalRevenue / totalClients;

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Clients</h1>
            <p className="text-gray-600 mt-2">Gérez vos relations clients et leur historique de réservations.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
                </div>
                <Users className="w-8 h-8 text-plp-purple" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clients Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{activeClients}</p>
                </div>
                <Users className="w-8 h-8 text-plp-pink" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus Clients</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalRevenue).replace('XAF', '').trim()}
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
                  <p className="text-sm font-medium text-gray-600">Dépense Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(averageSpending).replace('XAF', '').trim()}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
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
                    placeholder="Rechercher des clients..."
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
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle>Tous les Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={client.avatar} />
                    <AvatarFallback>
                      {client.firstName[0]}{client.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {client.firstName} {client.lastName}
                      </h3>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                      {client.averageRating >= 4.8 && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Top Client
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Mail className="w-4 h-4 mr-1" />
                      {client.email}
                      <span className="mx-2">•</span>
                      <Phone className="w-4 h-4 mr-1" />
                      {client.phone}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {client.location}
                      <span className="mx-2">•</span>
                      <Calendar className="w-4 h-4 mr-1" />
                      Dernière réservation: {formatDate(client.lastBooking)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{client.totalBookings}</p>
                        <p className="text-gray-600">Réservations</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(client.totalSpent).replace('XAF', '').trim()}
                        </p>
                        <p className="text-gray-600">Dépensé</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{client.averageRating}</p>
                        <p className="text-gray-600">Note</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Client Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Profil Client</DialogTitle>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={selectedClient.avatar} />
                    <AvatarFallback>
                      {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </h3>
                    <p className="text-gray-600">{selectedClient.email}</p>
                    <p className="text-gray-600">{selectedClient.phone}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(selectedClient.status)}>
                        {selectedClient.status}
                      </Badge>
                      {selectedClient.averageRating >= 4.8 && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Top Client
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Informations</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Localisation:</span> {selectedClient.location}</p>
                      <p><span className="text-gray-600">Membre depuis:</span> {formatDate(selectedClient.joinedDate)}</p>
                      <p><span className="text-gray-600">Dernière réservation:</span> {formatDate(selectedClient.lastBooking)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Statistiques</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Total réservations:</span> {selectedClient.totalBookings}</p>
                      <p><span className="text-gray-600">Total dépensé:</span> {formatCurrency(selectedClient.totalSpent)}</p>
                      <p><span className="text-gray-600">Note moyenne:</span> {selectedClient.averageRating}/5</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Préférences</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedClient.preferredProperties.map((property: string) => (
                      <Badge key={property} variant="outline">{property}</Badge>
                    ))}
                  </div>
                </div>
                
                {selectedClient.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedClient.notes}</p>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Envoyer un Message
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Appeler
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun client trouvé</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Essayez d\'ajuster vos critères de recherche.'
                  : 'Vous n\'avez pas encore de clients.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}