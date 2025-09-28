'use client'

import React from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, DollarSign, TrendingUp, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Clock, Star, ChartBar as BarChart3, Shield } from 'lucide-react';
import Link from 'next/link';

// Mock data
const adminStats = {
  totalUsers: 12450,
  totalProperties: 3280,
  monthlyRevenue: 145000,
  pendingApprovals: 23,
  activeBookings: 890,
  averageRating: 4.6,
  platformGrowth: 12.5,
  supportTickets: 45,
};

const recentActivities = [
  {
    id: '1',
    type: 'user_signup',
    message: 'New user registered: Sarah Johnson',
    time: '2 minutes ago',
    status: 'info',
  },
  {
    id: '2',
    type: 'property_approval',
    message: 'Property approved: Ocean View Villa in Malibu',
    time: '15 minutes ago',
    status: 'success',
  },
  {
    id: '3',
    type: 'booking_completed',
    message: 'Booking completed: Downtown Apartment - $1,200',
    time: '1 hour ago',
    status: 'success',
  },
  {
    id: '4',
    type: 'support_ticket',
    message: 'New support ticket: Payment issue reported',
    time: '2 hours ago',
    status: 'warning',
  },
  {
    id: '5',
    type: 'property_flagged',
    message: 'Property flagged for review: Mountain Cabin',
    time: '3 hours ago',
    status: 'error',
  },
];

const pendingApprovals = [
  {
    id: '1',
    type: 'property',
    title: 'Luxury Beach House',
    owner: 'Michael Chen',
    location: 'Miami, FL',
    submitted: '2024-01-15',
    status: 'pending',
  },
  {
    id: '2',
    type: 'property',
    title: 'Modern City Loft',
    owner: 'Emma Rodriguez',
    location: 'Chicago, IL',
    submitted: '2024-01-14',
    status: 'pending',
  },
  {
    id: '3',
    type: 'user_verification',
    title: 'Host Verification',
    owner: 'David Wilson',
    location: 'Seattle, WA',
    submitted: '2024-01-13',
    status: 'pending',
  },
];

const topPerformingProperties = [
  {
    id: '1',
    name: 'Ocean View Villa',
    owner: 'Sarah Johnson',
    location: 'Malibu, CA',
    bookings: 45,
    revenue: 54000,
    rating: 4.9,
  },
  {
    id: '2',
    name: 'Downtown Penthouse',
    owner: 'Michael Chen',
    location: 'New York, NY',
    bookings: 38,
    revenue: 45600,
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Mountain Retreat',
    owner: 'Emma Rodriguez',
    location: 'Aspen, CO',
    bookings: 32,
    revenue: 38400,
    rating: 4.7,
  },
];

export default function AdminDashboard() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <Users className="w-4 h-4" />;
      case 'property_approval':
        return <CheckCircle className="w-4 h-4" />;
      case 'booking_completed':
        return <DollarSign className="w-4 h-4" />;
      case 'support_ticket':
        return <AlertTriangle className="w-4 h-4" />;
      case 'property_flagged':
        return <Shield className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and manage the Property Listing Portal platform.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6">
          <Card className="xl:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-plp-purple" />
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{adminStats.totalProperties.toLocaleString()}</p>
                </div>
                <Building2 className="w-8 h-8 text-plp-pink" />
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${adminStats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-plp-yellow" />
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platform Growth</p>
                  <p className="text-2xl font-bold text-gray-900">+{adminStats.platformGrowth}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/properties">
                  <Button className="w-full btn-primary">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Pending Approvals ({adminStats.pendingApprovals})
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button variant="outline" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/admin/properties">
                  <Button variant="outline" className="w-full">
                    <Building2 className="w-4 h-4 mr-2" />
                    Review Properties
                  </Button>
                </Link>
                <Link href="/admin/analytics">
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {item.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Owner: {item.owner}</p>
                    <p className="text-sm text-gray-600">{item.location}</p>
                    <p className="text-xs text-gray-500 mt-1">Submitted: {item.submitted}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="btn-primary">
                      Approve
                    </Button>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Top Performing Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topPerformingProperties.map((property, index) => (
                <div key={property.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-plp-purple text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-gray-900">{property.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Owner: {property.owner}</p>
                  <p className="text-sm text-gray-600 mb-3">{property.location}</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{property.bookings}</p>
                      <p className="text-gray-600">Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">${property.revenue.toLocaleString()}</p>
                      <p className="text-gray-600">Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{property.rating}</p>
                      <p className="text-gray-600">Rating</p>
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