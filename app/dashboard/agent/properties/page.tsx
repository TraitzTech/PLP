'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Search, Filter, Plus, CreditCard as Edit, Trash2, Eye, Star, MapPin, Calendar, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// Mock properties data for agent
const mockProperties = [
  {
    id: '1',
    title: 'Luxury Villa Bastos',
    location: 'Bastos, Yaoundé',
    price: 480000, // XAF per night
    priceUnit: 'night',
    rating: 4.9,
    reviews: 127,
    images: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'],
    amenities: ['Ocean View', 'Private Pool', 'Spa', 'WiFi'],
    type: 'villa',
    bedrooms: 4,
    bathrooms: 3,
    area: 3200,
    status: 'active',
    featured: true,
    submittedDate: '2024-01-10',
    approvedDate: '2024-01-12',
    totalBookings: 45,
    totalRevenue: 21600000,
    occupancyRate: 85,
  },
  {
    id: '2',
    title: 'Modern Apartment Bonanjo',
    location: 'Bonanjo, Douala',
    price: 180000, // XAF per night
    priceUnit: 'night',
    rating: 4.7,
    reviews: 89,
    images: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
    amenities: ['City View', 'Gym', 'Concierge', 'WiFi'],
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    status: 'active',
    featured: false,
    submittedDate: '2024-01-15',
    approvedDate: '2024-01-17',
    totalBookings: 32,
    totalRevenue: 5760000,
    occupancyRate: 72,
  },
  {
    id: '3',
    title: 'Executive Suite Akwa',
    location: 'Akwa, Douala',
    price: 250000, // XAF per night
    priceUnit: 'night',
    rating: 4.8,
    reviews: 156,
    images: ['https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg'],
    amenities: ['Ocean View', 'Business Center', 'Restaurant', 'WiFi'],
    type: 'suite',
    bedrooms: 1,
    bathrooms: 1,
    area: 800,
    status: 'pending',
    featured: false,
    submittedDate: '2024-02-01',
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
  },
];

export default function AgentPropertiesPage() {
  const [properties, setProperties] = useState(mockProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteProperty = (propertyId: string) => {
    setProperties(prev => prev.filter(property => property.id !== propertyId));
    setIsDeleteDialogOpen(false);
    toast.success('Propriété supprimée avec succès');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalRevenue = properties.reduce((sum, property) => sum + property.totalRevenue, 0);
  const totalBookings = properties.reduce((sum, property) => sum + property.totalBookings, 0);
  const averageOccupancy = properties.reduce((sum, property) => sum + property.occupancyRate, 0) / properties.length;

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Propriétés</h1>
            <p className="text-gray-600 mt-2">Gérez toutes vos propriétés et leurs performances.</p>
          </div>
          <Link href="/dashboard/agent/properties/new">
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une Propriété
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Propriétés</p>
                  <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-plp-purple" />
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
                <TrendingUp className="w-8 h-8 text-plp-pink" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Réservations</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-plp-yellow" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux d'Occupation</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(averageOccupancy)}%</p>
                </div>
                <Award className="w-8 h-8 text-green-500" />
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
                    placeholder="Rechercher des propriétés..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="pending">En Attente</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les Types</SelectItem>
                  <SelectItem value="villa">Villas</SelectItem>
                  <SelectItem value="apartment">Appartements</SelectItem>
                  <SelectItem value="suite">Suites</SelectItem>
                  <SelectItem value="house">Maisons</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="relative h-48">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className={getStatusColor(property.status)}>
                    {property.status}
                  </Badge>
                  {property.featured && (
                    <Badge className="bg-plp-yellow text-black">
                      <Award className="w-3 h-3 mr-1" />
                      Vedette
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="font-bold text-plp-purple">
                      {formatCurrency(property.price)}
                      <span className="text-sm text-gray-500 font-normal">/{property.priceUnit}</span>
                    </div>
                    {property.rating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium">{property.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div>
                      <p className="font-semibold text-gray-900">{property.totalBookings}</p>
                      <p className="text-gray-600">Réservations</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(property.totalRevenue).replace('XAF', '').trim()}
                      </p>
                      <p className="text-gray-600">Revenus</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{property.occupancyRate}%</p>
                      <p className="text-gray-600">Occupation</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setSelectedProperty(property)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Supprimer la Propriété</DialogTitle>
                          <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer "{selectedProperty?.title}"? Cette action est irréversible.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-2 pt-4">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setIsDeleteDialogOpen(false)}
                          >
                            Annuler
                          </Button>
                          <Button 
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            onClick={() => selectedProperty && handleDeleteProperty(selectedProperty.id)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune propriété trouvée</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Essayez d\'ajuster vos critères de recherche.'
                  : 'Commencez par ajouter votre première propriété.'}
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <Link href="/dashboard/agent/properties/new">
                  <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une Propriété
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}