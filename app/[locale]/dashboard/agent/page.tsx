'use client'

import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/components/translation-provider';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardStatsLoader } from '@/components/ui/shimmer-loaders';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Calendar, DollarSign, Eye, Star, TrendingUp, Plus, ChartBar as BarChart3, Award, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { listingService } from '@/services/listingService';
import { dashboardService } from '@/services/dashboardService';
import { activityService } from '@/services/activityService';
import type { Listing, PendingApproval } from '@/services/types';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/agentHelpers';
import { resolveListingImageSrc } from '@/lib/listingMedia';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "XAF", minimumFractionDigits: 0 }).format(amount);

export default function AgentDashboard() {
  const router = useRouter();
  const t = useTranslations();
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  
  const [agentStats, setAgentStats] = useState({
    totalProperties: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    averageRating: 0,
  });
  
  const [properties, setProperties] = useState<Listing[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [pendingProperties, setPendingProperties] = useState<PendingApproval[]>([]);
  const [agentName, setAgentName] = useState('Agent');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch current user info
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setAgentName(currentUser.name || 'Agent');
          setCurrentUserId(currentUser.id);
        }
      } catch (error) {
        console.error("Error fetching agent info:", error);
      }

      // Fetch dashboard stats for agent
      try {
        const response = await dashboardService.getStats('agent');
        if (response.data) {
          setAgentStats({
            totalProperties: response.data.totalProperties || 0,
            activeBookings: response.data.activeBookings || 0,
            monthlyRevenue: response.data.monthlyRevenue || 0,
            pendingApprovals: response.data.pendingApprovals || 0,
            averageRating: response.data.averageRating || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setIsLoadingStats(false);
      }

      // Fetch agent's listings
      try {
        const listingsResponse = await listingService.getAllListings({ per_page: 10 });
        if (listingsResponse.data) {
          setProperties(listingsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast.error("Failed to load properties");
      } finally {
        setIsLoadingProperties(false);
      }

      // Fetch recent activities for current user only
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const activitiesResponse = await activityService.getAllActivities({ 
            per_page: 3,
            user_id: currentUser.id 
          });
          if (activitiesResponse.data?.data) {
            setActivities(activitiesResponse.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoadingActivities(false);
      }

      // Fetch pending properties for agent
      try {
        const pendingResponse = await dashboardService.getPendingApprovals();
        if (pendingResponse.data) {
          setPendingProperties(pendingResponse.data);
        }
      } catch (error) {
        console.error("Error fetching pending properties:", error);
      } finally {
        setIsLoadingPending(false);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
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
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboards.agent.welcome', { name: agentName })}</h1>
            <p className="text-gray-600 mt-2">{t('dashboards.agent.welcomeSubtitle')}</p>
          </div>
          <Link href="/dashboard/agent/properties/new">
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              {t('dashboards.agent.actions.addProperty')}
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        {isLoadingStats ? (
          <DashboardStatsLoader />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboards.agent.stats.totalProperties')}</p>
                  <p className="text-2xl font-bold text-gray-900">{agentStats.totalProperties}</p>
                </div>
                <Building2 className="w-8 h-8 text-plp-purple" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboards.agent.stats.activeBookings')}</p>
                  <p className="text-2xl font-bold text-gray-900">{agentStats.activeBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-plp-pink" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboards.agent.stats.monthlyRevenue')}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(agentStats.monthlyRevenue)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-plp-yellow" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboards.agent.stats.pendingApprovals')}</p>
                  <p className="text-2xl font-bold text-gray-900">{agentStats.pendingApprovals}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboards.agent.stats.averageRating')}</p>
                  <p className="text-2xl font-bold text-gray-900">{agentStats.averageRating.toFixed(1)} ⭐</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {t('dashboards.agent.sections.recentActivities')}
                </CardTitle>
                <Link href="/dashboard/agent/activity">
                  <Button variant="outline" size="sm">{t('dashboards.common.viewAll')}</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoadingActivities ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="space-y-2 text-right">
                          <Skeleton className="h-6 w-28" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{activity.description}</h3>
                        <p className="text-sm text-gray-600 mt-1">{t('dashboards.common.you')} {activity.action}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(activity.created_at).toLocaleDateString('en-US')}</span>
                          <Badge variant="outline" className="text-xs capitalize">{activity.action}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">{t('dashboards.common.noData')}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* My Properties Summary */}
          <div>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {t('dashboards.agent.sections.myProperties')}
                </CardTitle>
                <Link href="/dashboard/agent/properties">
                  <Button variant="outline" size="sm">{t('dashboards.common.viewAll')}</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoadingProperties ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 rounded-lg border">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-full mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ))}
                  </div>
                ) : properties.length > 0 ? (
                <div className="space-y-3">
                  {properties.slice(0, 3).map((property) => (
                    <div
                      key={property.id}
                      className="p-3 rounded-lg border hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => router.push(`/dashboard/agent/properties/${property.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        {resolveListingImageSrc(property) ? (
                          <img
                            src={resolveListingImageSrc(property) as string}
                            alt={property.title}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100 border"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-plp-purple to-plp-pink flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white opacity-80" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                              {property.title}
                            </h4>
                            <Badge variant={property.is_approved ? "default" : "secondary"} className="text-xs flex-shrink-0">
                              {property.is_approved ? t('dashboards.common.active') : t('dashboards.common.pending')}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-1">{property.location}</p>
                          <p className="text-sm font-semibold text-plp-purple mt-1">
                            {formatCurrency(Number(property.price))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">{t('dashboards.common.noData')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pending Properties Alert */}
        {!isLoadingPending && pendingProperties.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                <AlertCircle className="w-5 h-5" />
                {t('dashboards.agent.sections.pendingProperties')} ({pendingProperties.length})
              </CardTitle>
              <Link href="/dashboard/agent/properties">
                <Button variant="outline" size="sm">Review</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingProperties.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 bg-white rounded-lg border border-yellow-200 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.type === 'property' && 'Your property listing is awaiting approval'}
                        {item.type === 'agent' && 'Your account is awaiting approval'}
                        {item.type === 'booking' && 'A booking requires your attention'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Properties Grid */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Your Listings
            </CardTitle>
            <div className="flex gap-2">
              <Link href="/dashboard/agent/properties">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingProperties ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <Skeleton className="w-full h-32" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {properties.slice(0, 4).map((property) => {
                const imageSrc = resolveListingImageSrc(property);

                return (
                  <div 
                    key={property.id} 
                    className="border rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
                    onClick={() => router.push(`/dashboard/agent/properties/${property.id}`)}
                  >
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={property.title}
                        className="w-full h-32 object-cover bg-gray-100"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-plp-purple to-plp-pink flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-white opacity-70" />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{property.title}</h3>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-1">{property.location}, {property.city}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-plp-purple">{formatCurrency(Number(property.price))}</p>
                        <Badge variant={property.is_approved ? "default" : "secondary"} className="text-xs">
                          {property.is_approved ? 'OK' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            ) : (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No properties listed yet</p>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
