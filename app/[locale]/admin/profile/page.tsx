'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar, Award, MessageSquare, CreditCard as Edit, Phone, Mail,
  Users, Building2, DollarSign, Shield, Star, TrendingUp, Bookmark,
} from 'lucide-react';
import { toast } from 'sonner';
import { profileService } from '@/services/profileService';
import { dashboardService } from '@/services/dashboardService';
import { activityService } from '@/services/activityService';
import type { ProfileData } from '@/services/profileService';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [profileData, statsRes, activitiesRes] = await Promise.all([
          profileService.getProfile(),
          dashboardService.getStats('admin'),
          activityService.getAllActivities({ per_page: 10 }),
        ]);

        setProfile(profileData);
        setStats(statsRes.data);
        setActivities(activitiesRes.data?.data || []);
      } catch (error) {
        console.error('Failed to load admin profile data', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCurrency = (amount: number | undefined | null) => {
    const numeric = Number(amount || 0);
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(numeric);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = useMemo(() => {
    const name = profile?.name || 'Admin';
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  }, [profile]);

  if (loading) {
    return (
      <DashboardLayout userType="admin">
        <div className="space-y-8">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <Skeleton className="w-32 h-32 rounded-full" />
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-72" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile?.avatar || undefined} />
                  <AvatarFallback className="text-2xl bg-plp-purple text-white">{getInitials}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-plp-purple text-white rounded-full p-1.5">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{profile?.name || 'Admin'}</h1>
                  <Badge className="bg-plp-purple/10 text-plp-purple flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Administrator
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  {profile?.created_at && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {formatDate(profile.created_at)}
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {profile.phone}
                    </div>
                  )}
                  {profile?.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {profile.email}
                    </div>
                  )}
                </div>

                {profile?.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">{profile.bio}</p>
                )}

                <div className="flex gap-3">
                  <Button className="btn-primary" onClick={() => toast.info('Edit profile in Settings')}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" onClick={() => toast.info('Manage contact info in Settings')}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Info
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-plp-purple" />
              <div className="text-2xl font-bold text-plp-purple">{stats?.totalUsers ?? 0}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="w-5 h-5 mx-auto mb-1 text-plp-pink" />
              <div className="text-2xl font-bold text-plp-pink">{stats?.totalAgents ?? 0}</div>
              <div className="text-sm text-gray-600">Total Agents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Building2 className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{stats?.totalProperties ?? 0}</div>
              <div className="text-sm text-gray-600">Total Listings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-5 h-5 mx-auto mb-1 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{stats?.totalBookings ?? 0}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats?.monthlyRevenue)}</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">{stats?.pendingApprovals ?? 0}</div>
              <div className="text-sm text-gray-600">Pending Approvals</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="platform">Platform Stats</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.created_at)}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">{activity.action}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platform" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-plp-purple" />
                    User Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-plp-purple/5 rounded-lg">
                    <span className="text-gray-700">Customers</span>
                    <span className="font-bold text-plp-purple">{stats?.totalCustomers ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-plp-pink/5 rounded-lg">
                    <span className="text-gray-700">Agents</span>
                    <span className="font-bold text-plp-pink">{stats?.totalAgents ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Approved Agents</span>
                    <span className="font-bold text-green-600">{stats?.approvedAgents ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-gray-700">Pending Agents</span>
                    <span className="font-bold text-yellow-600">{stats?.pendingApprovals ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-gray-700">Rejected Agents</span>
                    <span className="font-bold text-red-600">{stats?.rejectedAgents ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">New Users (30 days)</span>
                    <span className="font-bold text-blue-600">{stats?.recentUsers ?? 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Property & Booking Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">Total Properties</span>
                    <span className="font-bold text-blue-600">{stats?.totalProperties ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Active Listings</span>
                    <span className="font-bold text-green-600">{stats?.activeListings ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-plp-purple/5 rounded-lg">
                    <span className="text-gray-700">Total Bookings</span>
                    <span className="font-bold text-plp-purple">{stats?.totalBookings ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-plp-pink/5 rounded-lg">
                    <span className="text-gray-700">Monthly Revenue</span>
                    <span className="font-bold text-plp-pink">{formatCurrency(stats?.monthlyRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-gray-700">Pending Approvals</span>
                    <span className="font-bold text-yellow-600">{stats?.pendingApprovals ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-700">Platform Growth</span>
                    <span className="font-bold text-orange-600">{stats?.platformGrowth ?? 0}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900">{profile?.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">{profile?.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Account Created</p>
                    <p className="font-medium text-gray-900">{formatDate(profile?.created_at) || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900">Platform Administrator</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
