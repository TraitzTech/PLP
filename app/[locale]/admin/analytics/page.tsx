'use client'

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, Building2, DollarSign, Calendar, Download, Filter } from 'lucide-react';

// Mock analytics data
const revenueData = [
  { month: 'Jan', revenue: 45000000, bookings: 120, users: 450 },
  { month: 'Feb', revenue: 52000000, bookings: 145, users: 520 },
  { month: 'Mar', revenue: 48000000, bookings: 135, users: 580 },
  { month: 'Apr', revenue: 61000000, bookings: 165, users: 650 },
  { month: 'May', revenue: 58000000, bookings: 155, users: 720 },
  { month: 'Jun', revenue: 67000000, bookings: 180, users: 800 },
];

const propertyTypeData = [
  { name: 'Hotels', value: 35, count: 1200, color: '#390058' },
  { name: 'Houses', value: 45, count: 1800, color: '#FF4672' },
  { name: 'Land', value: 20, count: 520, color: '#FFB43B' },
];

const locationData = [
  { city: 'Yaoundé', properties: 850, revenue: 25000000 },
  { city: 'Douala', properties: 720, revenue: 22000000 },
  { city: 'Bamenda', properties: 450, revenue: 12000000 },
  { city: 'Bafoussam', properties: 380, revenue: 8500000 },
  { city: 'Garoua', properties: 320, revenue: 7200000 },
];

const userGrowthData = [
  { month: 'Jan', customers: 2100, owners: 450 },
  { month: 'Feb', customers: 2350, owners: 520 },
  { month: 'Mar', customers: 2600, owners: 580 },
  { month: 'Apr', customers: 2900, owners: 650 },
  { month: 'May', customers: 3200, owners: 720 },
  { month: 'Jun', customers: 3500, owners: 800 },
];

const mockProperties = [
  {
    id: '1',
    title: 'Villa Luxueuse Bastos',
    location: 'Bastos, Yaoundé',
    totalRevenue: 15000000,
    totalBookings: 45,
    status: 'active'
  },
  {
    id: '2',
    title: 'Appartement Moderne Bonanjo',
    location: 'Bonanjo, Douala',
    totalRevenue: 12500000,
    totalBookings: 38,
    status: 'active'
  },
  {
    id: '3',
    title: 'Maison Familiale Mendong',
    location: 'Mendong, Yaoundé',
    totalRevenue: 8900000,
    totalBookings: 32,
    status: 'active'
  },
  {
    id: '4',
    title: 'Studio Centre-ville',
    location: 'Centre-ville, Douala',
    totalRevenue: 6200000,
    totalBookings: 28,
    status: 'active'
  },
  {
    id: '5',
    title: 'Villa avec Piscine',
    location: 'Omnisport, Yaoundé',
    totalRevenue: 11800000,
    totalBookings: 35,
    status: 'active'
  }
];

export default function AdminAnalyticsPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings, 0);
  const totalUsers = userGrowthData[userGrowthData.length - 1].customers + userGrowthData[userGrowthData.length - 1].owners;

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Platform performance metrics and insights.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select defaultValue="6months">
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="btn-primary">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <div className="flex items-center text-green-600 text-sm mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12.5%
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
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                  <div className="flex items-center text-green-600 text-sm mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +8.2%
                  </div>
                </div>
                <Calendar className="w-8 h-8 text-plp-pink" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                  <div className="flex items-center text-green-600 text-sm mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +15.3%
                  </div>
                </div>
                <Users className="w-8 h-8 text-plp-yellow" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Properties</p>
                  <p className="text-2xl font-bold text-gray-900">3,520</p>
                  <div className="flex items-center text-green-600 text-sm mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +6.8%
                  </div>
                </div>
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
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

          {/* Property Types */}
          <Card>
            <CardHeader>
              <CardTitle>Property Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="customers" stroke="#FF4672" strokeWidth={2} />
                  <Line type="monotone" dataKey="owners" stroke="#390058" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Locations */}
          <Card>
            <CardHeader>
              <CardTitle>Top Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => 
                    name === 'revenue' ? formatCurrency(value as number) : value
                  } />
                  <Bar dataKey="properties" fill="#FFB43B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockProperties.filter(p => p.status === 'active').map((property, index) => (
                  <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-plp-purple text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{property.title}</h4>
                        <p className="text-sm text-gray-600">{property.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-plp-purple">
                        {formatCurrency(property.totalRevenue)}
                      </p>
                      <p className="text-sm text-gray-600">{property.totalBookings} bookings</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Location Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {locationData.map((location, index) => (
                  <div key={location.city} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-plp-pink text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{location.city}</h4>
                        <p className="text-sm text-gray-600">{location.properties} properties</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-plp-purple">
                        {formatCurrency(location.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}