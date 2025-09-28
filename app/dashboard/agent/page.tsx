'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, DollarSign, Eye, Star, TrendingUp, Users, MessageSquare, Plus, ChartBar as BarChart3, Award, Clock } from 'lucide-react';
import Link from 'next/link';

// Mock data for agent
const agentStats = {
  totalProperties: 12,
  activeBookings: 28,
  monthlyRevenue: 18500000, // XAF
  totalClients: 45,
  averageRating: 4.8,
  occupancyRate: 85,
  pendingBookings: 8,
  totalCommission: 2775000, // 15% commission
};

const recentBookings = [
  {
    id: '1',
    property: 'Luxury Villa Bastos',
    client: 'Marie Dubois',
    checkIn: '2024-02-20',
    checkOut: '2024-02-25',
    status: 'confirmed',
    amount: 2400000,
    commission: 360000,
  },
  {
    id: '2',
    property: 'Modern Apartment Bonanjo',
    client: 'Jean-Paul Kamga',
    checkIn: '2024-02-22',
    checkOut: '2024-02-27',
    status: 'pending',
    amount: 1800000,
    commission: 270000,
  },
  {
    id: '3',
    property: 'Executive Suite Akwa',
    client: 'Fatima Nkomo',
    checkIn: '2024-02-25',
    checkOut: '2024-03-02',
    status: 'confirmed',
    amount: 2100000,
    commission: 315000,
  },
];

const topProperties = [
  {
    id: '1',
    name: 'Luxury Villa Bastos',
    location: 'Bastos, Yaoundé',
    status: 'active',
    bookings: 15,
    revenue: 12000000,
    rating: 4.9,
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
  },
  {
    id: '2',
    name: 'Modern Apartment Bonanjo',
    location: 'Bonanjo, Douala',
    status: 'active',
    bookings: 22,
    revenue: 8800000,
    rating: 4.7,
    image: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
  },
  {
    id: '3',
    name: 'Executive Suite Akwa',
    location: 'Akwa, Douala',
    status: 'active',
    bookings: 18,
    revenue: 10500000,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg',
  },
];

const recentMessages = [
  {
    id: '1',
    client: 'Marie Dubois',
    property: 'Luxury Villa Bastos',
    message: 'Bonjour, je voudrais confirmer ma réservation pour ce weekend...',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: '2',
    client: 'Jean-Paul Kamga',
    property: 'Modern Apartment Bonanjo',
    message: 'Merci pour les informations. Le prix inclut-il le petit-déjeuner?',
    time: '3 hours ago',
    unread: false,
  },
  {
    id: '3',
    client: 'Fatima Nkomo',
    property: 'Executive Suite Akwa',
    message: 'Excellent service! Je recommande vivement cette propriété.',
    time: '1 day ago',
    unread: false,
  },
];

export default function AgentDashboard() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bienvenue, Agent Mballa!</h1>
            <p className="text-gray-600 mt-2">Voici un aperçu de vos propriétés et réservations.</p>
          </div>
          <Link href="/dashboard/agent/properties/new">
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une Propriété
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6">
          <Card className="xl:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Propriétés</p>
                  <p className="text-2xl font-bold text-gray-900">{agentStats.totalProperties}</p>
                </div>
                <Building2 className="w-8 h-8 text-plp-purple" />
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Réservations Actives</p>
                  <p className="text-2xl font-bold text-gray-900">{agentStats.activeBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-plp-pink" />
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus Mensuels</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(agentStats.monthlyRevenue).replace('XAF', '').trim()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-plp-yellow" />
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{agentStats.totalClients}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Réservations Récentes
                </CardTitle>
                <Link href="/dashboard/agent/bookings">
                  <Button variant="outline" size="sm">Voir Tout</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{booking.property}</h3>
                        <p className="text-sm text-gray-600">Client: {booking.client}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{booking.checkIn} - {booking.checkOut}</span>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(booking.amount)}</p>
                        <p className="text-sm text-plp-purple">Commission: {formatCurrency(booking.commission)}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Détails
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Messages */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Messages
                </CardTitle>
                <Link href="/dashboard/agent/messages">
                  <Button variant="outline" size="sm">Voir Tout</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg border ${
                        message.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900">
                          {message.client}
                        </h4>
                        {message.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{message.property}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {message.message}
                      </p>
                      <span className="text-xs text-gray-500 mt-2 block">{message.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Performing Properties */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Propriétés les Plus Performantes
            </CardTitle>
            <div className="flex gap-2">
              <Link href="/dashboard/agent/analytics">
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link href="/dashboard/agent/properties">
                <Button variant="outline" size="sm">Voir Tout</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topProperties.map((property, index) => (
                <div key={property.id} className="border rounded-lg overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-plp-purple text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{property.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{property.location}</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{property.bookings}</p>
                        <p className="text-gray-600">Réservations</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{formatCurrency(property.revenue).replace('XAF', '').trim()}</p>
                        <p className="text-gray-600">Revenus</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{property.rating}</p>
                        <p className="text-gray-600">Note</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Voir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}