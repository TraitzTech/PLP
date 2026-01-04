'use client'

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Building2, Calendar, DollarSign, Users, Download, Filter, Star, Award } from 'lucide-react';

// Mock analytics data for agent
const revenueData = [
  { month: 'Jan', revenue: 12000000, bookings: 25, occupancy: 75 },
  { month: 'Fév', revenue: 15000000, bookings: 32, occupancy: 82 },
  { month: 'Mar', revenue: 18000000, bookings: 38, occupancy: 85 },
  { month: 'Avr', revenue: 22000000, bookings: 45, occupancy: 88 },
  { month: 'Mai', revenue: 19000000, bookings: 40, occupancy: 80 },
  { month: 'Juin', revenue: 25000000, bookings: 52, occupancy: 92 },
];

const propertyPerformanceData = [
  { name: 'Villa Bastos', revenue: 8500000, bookings: 18, rating: 4.9 },
  { name: 'Apt Bonanjo', revenue: 6200000, bookings: 22, rating: 4.7 },
  { name: 'Suite Akwa', revenue: 7800000, bookings: 16, rating: 4.8 },
  { name: 'Maison Biyem', revenue: 4500000, bookings: 12, rating: 4.6 },
];

const clientSourceData = [
  { name: 'Référencement Direct', value: 35, count: 28, color: '#390058' },
  { name: 'Recommandations', value: 30, count: 24, color: '#FF4672' },
  { name: 'Réseaux Sociaux', value: 20, count: 16, color: '#FFB43B' },
  { name: 'Partenaires', value: 15, count: 12, color: '#831597' },
];

const monthlyMetrics = [
  { month: 'Jan', clients: 15, newClients: 8, retention: 85 },
  { month: 'Fév', clients: 18, newClients: 10, retention: 88 },
  { month: 'Mar', clients: 22, newClients: 12, retention: 90 },
  { month: 'Avr', clients: 28, newClients: 15, retention: 92 },
  { month: 'Mai', clients: 25, newClients: 11, retention: 89 },
  { month: 'Juin', clients: 32, newClients: 18, retention: 94 },
];

export default function AgentAnalyticsPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings, 0);
  const averageOccupancy = revenueData.reduce((sum, item) => sum + item.occupancy, 0) / revenueData.length;
  const totalCommission = totalRevenue * 0.15; // 15% agent commission

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Rapports</h1>
            <p className="text-gray-600 mt-2">Analysez les performances de vos propriétés et clients.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select defaultValue="6months">
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Dernier Mois</SelectItem>
                <SelectItem value="3months">3 Derniers Mois</SelectItem>
                <SelectItem value="6months">6 Derniers Mois</SelectItem>
                <SelectItem value="1year">Dernière Année</SelectItem>
              </SelectContent>
            </Select>
            <Button className="btn-primary">
              <Download className="w-4 h-4 mr-2" />
              Exporter Rapport
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalRevenue).replace('XAF', '').trim()}
                  </p>
                  <div className="flex items-center text-green-600 text-sm mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +18.5%
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-plp-purple" />
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
                  <div className="flex items-center text-green-600 text-sm mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +15.2%
                  </div>
                </div>
                <Star className="w-8 h-8 text-plp-pink" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Réservations</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                  <div className="flex items-center text-green-600 text-sm mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +22.3%
                  </div>
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
                  <div className="flex items-center text-green-600 text-sm mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +5.8%
                  </div>
                </div>
                <Building2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Revenus</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Area type="monotone" dataKey="revenue" stroke="#390058" fill="#390058" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Client Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Sources de Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={clientSourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {clientSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Property Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance des Propriétés</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={propertyPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value, name) => 
                    name === 'revenue' ? formatCurrency(value as number) : value
                  } />
                  <Bar dataKey="revenue" fill="#FF4672" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Client Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Croissance Clientèle</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="clients" stroke="#390058" strokeWidth={2} name="Total Clients" />
                  <Line type="monotone" dataKey="newClients" stroke="#FFB43B" strokeWidth={2} name="Nouveaux Clients" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Propriétés les Plus Rentables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {propertyPerformanceData.map((property, index) => (
                  <div key={property.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-plp-purple text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{property.name}</h4>
                        <p className="text-sm text-gray-600">{property.bookings} réservations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-plp-purple">
                        {formatCurrency(property.revenue)}
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                        {property.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé Mensuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">94%</p>
                    <p className="text-sm text-gray-600">Taux de Satisfaction</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">32</p>
                    <p className="text-sm text-gray-600">Clients Actifs</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">4.8</p>
                    <p className="text-sm text-gray-600">Note Moyenne</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Objectifs du Mois</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenus</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Nouveaux Clients</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taux d'Occupation</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}