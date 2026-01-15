'use client'

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, DollarSign, TrendingUp, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Clock, Star, ChartBar as BarChart3, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { dashboardService } from '@/services/dashboardService';
import { activityService } from '@/services/activityService';
import { agentService } from '@/services/agentService';
import { propertyManagementService } from '@/services/propertyManagementService';
import type { DashboardStats, Activity, TopProperty, PendingApproval, Agent } from '@/services/types';
import { 
  DashboardStatsLoader, 
  ActivityListLoader, 
  PropertyCardLoader, 
  ApprovalListLoader 
} from '@/components/ui/shimmer-loaders';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [topProperties, setTopProperties] = useState<TopProperty[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [pendingAgents, setPendingAgents] = useState<Agent[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(true);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Fetch stats
    try {
      const response = await dashboardService.getStats('admin');
      setStats(response.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load dashboard stats"
      );
    } finally {
      setIsLoadingStats(false);
    }

    // Fetch recent activities
    try {
      const response = await activityService.getAllActivities({ per_page: 5 });
      setActivities(response.data.data);
    } catch (error: any) {
      console.error("Failed to load activities:", error);
    } finally {
      setIsLoadingActivities(false);
    }

    // Fetch top properties
    try {
      const response = await dashboardService.getTopProperties({ limit: 3 });
      setTopProperties(response.data);
    } catch (error: any) {
      console.error("Failed to load top properties:", error);
    } finally {
      setIsLoadingProperties(false);
    }

    // Fetch pending approvals
    try {
      const response = await dashboardService.getPendingApprovals({ limit: 3 });
      setPendingApprovals(response.data);
    } catch (error: any) {
      console.error("Failed to load pending approvals:", error);
    } finally {
      setIsLoadingApprovals(false);
    }

    // Fetch pending agents
    try {
      const response = await agentService.getPendingAgents();
      setPendingAgents(response || []);
    } catch (error: any) {
      console.error("Failed to load pending agents:", error);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'login':
      case 'logout':
        return <Users className="w-4 h-4" />;
      case 'create':
        return <CheckCircle className="w-4 h-4" />;
      case 'update':
        return <Shield className="w-4 h-4" />;
      case 'delete':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'create':
      case 'login':
        return 'text-green-600 bg-green-50';
      case 'update':
        return 'text-blue-600 bg-blue-50';
      case 'delete':
        return 'text-red-600 bg-red-50';
      case 'logout':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const handleReviewApproval = (approval: PendingApproval) => {
    // Route to the appropriate detailed page based on type
    switch (approval.type.toLowerCase()) {
      case 'property':
        router.push(`/admin/properties/${approval.id}`);
        break;
      case 'agent':
        router.push(`/admin/agents/${approval.id}/edit`);
        break;
      case 'booking':
        router.push(`/admin/bookings/${approval.id}`);
        break;
      default:
        router.push(`/admin/properties/${approval.id}`);
    }
  };

  const handleApproveApproval = async (approval: PendingApproval) => {
    try {
      if (approval.type.toLowerCase() === 'agent') {
        await agentService.updateAgentStatus(approval.id, 'approved');
      } else if (approval.type.toLowerCase() === 'property') {
        await propertyManagementService.updateApprovalStatus(approval.id, { is_approved: true });
      }
      
      toast.success(`${approval.type} approved successfully`);
      
      // Refresh pending approvals
      try {
        const response = await dashboardService.getPendingApprovals({ limit: 3 });
        setPendingApprovals(response.data);
      } catch (error) {
        console.error("Failed to refresh approvals:", error);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || `Failed to approve ${approval.type.toLowerCase()}`
      );
      console.error("Approval error:", error);
    }
  };

  const handleRejectApproval = async (approval: PendingApproval) => {
    try {
      if (approval.type.toLowerCase() === 'agent') {
        await agentService.updateAgentStatus(approval.id, 'rejected');
      } else if (approval.type.toLowerCase() === 'property') {
        await propertyManagementService.updateApprovalStatus(approval.id, { is_approved: false });
      }
      
      toast.success(`${approval.type} rejected successfully`);
      
      // Refresh pending approvals
      try {
        const response = await dashboardService.getPendingApprovals({ limit: 3 });
        setPendingApprovals(response.data);
      } catch (error) {
        console.error("Failed to refresh approvals:", error);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || `Failed to reject ${approval.type.toLowerCase()}`
      );
      console.error("Rejection error:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
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
        {isLoadingStats ? (
          <DashboardStatsLoader />
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{(stats.totalUsers ?? 0).toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-plp-purple" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{(stats.totalProperties ?? 0).toLocaleString()}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-plp-pink" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">XAF {(stats.monthlyRevenue ?? 0).toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-plp-yellow" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Platform Growth</p>
                    <p className="text-2xl font-bold text-gray-900">+{stats.platformGrowth ?? 0}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

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
                {isLoadingActivities ? (
                  <ActivityListLoader />
                ) : activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div className={`p-2 rounded-full ${getActivityColor(activity.action)}`}>
                          {getActivityIcon(activity.action)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          {activity.user && (
                            <p className="text-xs text-gray-500 mt-1">
                              by {activity.user.name} ({activity.user.user_type})
                            </p>
                          )}
                          <p className="text-xs text-gray-500">{formatTimeAgo(activity.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">No recent activities</p>
                )}
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
                    Pending Approvals ({stats?.pendingApprovals || 0})
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
            {isLoadingApprovals ? (
              <ApprovalListLoader />
            ) : pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {item.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Owner: {item.owner}</p>
                      <p className="text-sm text-gray-600">{item.location}</p>
                      <p className="text-xs text-gray-500 mt-1">Submitted: {item.submitted}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="btn-primary"
                        onClick={() => handleApproveApproval(item)}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReviewApproval(item)}
                      >
                        Review
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRejectApproval(item)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No pending approvals</p>
            )}
          </CardContent>
        </Card>

        {/* Pending Agent Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pending Agent Approvals
              </CardTitle>
              {pendingAgents.length > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  {pendingAgents.length} pending
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingAgents ? (
              <ActivityListLoader />
            ) : pendingAgents.length > 0 ? (
              <div className="space-y-3">
                {pendingAgents.slice(0, 5).map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{agent.user?.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{agent.user?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">{agent.city}, {agent.region}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/admin/agents/pending`)}
                      className="ml-2"
                    >
                      Review
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ))}
                {pendingAgents.length > 5 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/admin/agents/pending`)}
                  >
                    View all {pendingAgents.length} pending agents
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">All agent applications have been reviewed!</p>
              </div>
            )}
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
            {isLoadingProperties ? (
              <PropertyCardLoader />
            ) : topProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topProperties.map((property, index) => (
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
                        <p className="font-semibold text-gray-900">XAF {property.revenue.toLocaleString()}</p>
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
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No properties data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
