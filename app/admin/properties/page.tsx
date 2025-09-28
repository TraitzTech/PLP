'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Search, Filter, Plus, CreditCard as Edit, Trash2, Eye, Star, MapPin, Calendar, CircleCheck as CheckCircle, Circle as XCircle, Clock, Award, Ban } from 'lucide-react';
import { toast } from 'sonner';

// Mock properties data
const mockProperties = [
  {
    id: '1',
    title: 'Luxury Ocean View Villa',
    location: 'Malibu, California',
    price: 720000,
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
    owner: 'Sarah Johnson',
    ownerId: '2',
    submittedDate: '2024-01-10',
    approvedDate: '2024-01-12',
    totalBookings: 45,
    totalRevenue: 32400000,
  },
  {
    id: '2',
    title: 'Modern Downtown Apartment',
    location: 'New York, NY',
    price: 210000,
    priceUnit: 'night',
    rating: 4.7,
    reviews: 89,
    images: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
    amenities: ['City View', 'Gym', 'Concierge', 'WiFi'],
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    status: 'pending',
    featured: false,
    owner: 'Michael Chen',
    ownerId: '3',
    submittedDate: '2024-02-01',
    totalBookings: 0,
    totalRevenue: 0,
  },
  {
    id: '3',
    title: 'Prime Development Land',
    location: 'Austin, TX',
    price: 150000000,
    priceUnit: 'total',
    rating: 4.3,
    reviews: 12,
    images: ['https://images.pexels.com/photos/1095814/pexels-photo-1095814.jpeg'],
    amenities: ['Utilities Ready', 'Zoned Commercial', 'Corner Lot'],
    type: 'land',
    area: 5000,
    status: 'suspended',
    featured: false,
    owner: 'Emma Rodriguez',
    ownerId: '4',
    submittedDate: '2024-01-25',
    approvedDate: '2024-01-27',
    totalBookings: 0,
    totalRevenue: 0,
  },
];

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState(mockProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.owner.toLowerCase().includes(searchTerm.toLowerCase());
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
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproveProperty = (propertyId: string) => {
    setProperties(prev => prev.map(property => 
      property.id === propertyId 
        ? { ...property, status: 'active', approvedDate: new Date().toISOString() }
        : property
    ));
    toast.success('Property approved successfully');
  };

  const handleRejectProperty = (propertyId: string) => {
    setProperties(prev => prev.map(property => 
      property.id === propertyId 
        ? { ...property, status: 'rejected' }
        : property
    ));
    toast.success('Property rejected');
  };

  const handleSuspendProperty = (propertyId: string) => {
    setProperties(prev => prev.map(property => 
      property.id === propertyId 
        ? { ...property, status: property.status === 'suspended' ? 'active' : 'suspended' }
        : property
    ));
    toast.success('Property status updated');
  };

  const handleFeatureProperty = (propertyId: string) => {
    setProperties(prev => prev.map(property => 
      property.id === propertyId 
        ? { ...property, featured: !property.featured }
        : property
    ));
    toast.success('Property featured status updated');
  };

  const handleDeleteProperty = (propertyId: string) => {
    setProperties(prev => prev.filter(property => property.id !== propertyId));
    toast.success('Property deleted successfully');
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

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
            <p className="text-gray-600 mt-2">Manage all property listings, approvals, and moderation.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
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
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.filter(p => p.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.filter(p => p.featured).length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-plp-yellow" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {properties.filter(p => p.status === 'suspended').length}
                  </p>
                </div>
                <Ban className="w-8 h-8 text-red-500" />
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
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="villa">Villas</SelectItem>
                  <SelectItem value="apartment">Apartments</SelectItem>
                  <SelectItem value="house">Houses</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Properties List */}
        <Card>
          <CardHeader>
            <CardTitle>All Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProperties.map((property) => (
                <div key={property.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{property.title}</h3>
                      {property.featured && (
                        <Award className="w-4 h-4 text-plp-yellow" />
                      )}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.location}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge className={getStatusColor(property.status)}>
                        {property.status}
                      </Badge>
                      <span className="text-gray-600">Owner: {property.owner}</span>
                      <span className="text-gray-600">Type: {property.type}</span>
                      {property.rating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          {property.rating} ({property.reviews})
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-plp-purple">
                      {formatCurrency(property.price)}
                      <span className="text-sm text-gray-500 font-normal">/{property.priceUnit}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Revenue: {formatCurrency(property.totalRevenue)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProperty(property);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {property.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveProperty(property.id)}
                          className="text-green-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectProperty(property.id)}
                          className="text-red-600"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFeatureProperty(property.id)}
                      className={property.featured ? 'text-yellow-600' : 'text-gray-600'}
                    >
                      <Award className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuspendProperty(property.id)}
                      className={property.status === 'suspended' ? 'text-green-600' : 'text-red-600'}
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProperty(property.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Property Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Property Details</DialogTitle>
            </DialogHeader>
            {selectedProperty && (
              <div className="space-y-4">
                <img
                  src={selectedProperty.images[0]}
                  alt={selectedProperty.title}
                  className="w-full h-48 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedProperty.title}</h3>
                  <p className="text-gray-600">{selectedProperty.location}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <p className="font-medium">{formatCurrency(selectedProperty.price)}/{selectedProperty.priceUnit}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="font-medium capitalize">{selectedProperty.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Owner:</span>
                    <p className="font-medium">{selectedProperty.owner}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <Badge className={getStatusColor(selectedProperty.status)}>
                      {selectedProperty.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Amenities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedProperty.amenities.map((amenity: string) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
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