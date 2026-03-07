'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Building2, DollarSign, Calendar,
  Download, Filter, Star, CreditCard, Shield, Activity,
  ArrowUpRight, ArrowDownRight, Loader2,
} from 'lucide-react';
import adminAnalyticsService, { type AdminAnalyticsData } from '@/services/adminAnalyticsService';

const COLORS = ['#390058', '#FF4672', '#FFB43B', '#3b82f6', '#22c55e', '#8b5cf6'];

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState('6months');
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAnalyticsService.getAnalytics(period);
      setData(response.data);
    } catch (err: any) {
      console.error('Failed to fetch admin analytics:', err);
      setError(err?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en').format(num);
  };

  const handleExport = async (type: string = 'bookings') => {
    try {
      setExporting(true);
      const blob = await adminAnalyticsService.exportReport(period, type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      console.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const ChangeIndicator = ({ value }: { value: number }) => (
    <div className={`flex items-center text-sm ${value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
      {value >= 0 ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
      {Math.abs(value)}%
    </div>
  );

  const MetricSkeleton = () => (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-16" />
      </CardContent>
    </Card>
  );

  const ChartSkeleton = () => (
    <Card>
      <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
      <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
    </Card>
  );

  const o = data?.overview;

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive platform performance metrics and insights</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="bookings" onValueChange={(type) => handleExport(type)}>
              <SelectTrigger className="w-40" disabled={exporting}>
                <Download className="w-4 h-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export'}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bookings">Export Bookings</SelectItem>
                <SelectItem value="payments">Export Payments</SelectItem>
                <SelectItem value="users">Export Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchAnalytics} className="mt-2">Retry</Button>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics - Row 1 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <MetricSkeleton key={i} />)}
          </div>
        ) : o && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-plp-purple">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(o.total_revenue)}</p>
                    <ChangeIndicator value={o.revenue_change} />
                  </div>
                  <div className="p-3 bg-plp-purple/10 rounded-xl">
                    <DollarSign className="w-6 h-6 text-plp-purple" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-plp-pink">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(o.total_bookings)}</p>
                    <ChangeIndicator value={o.bookings_change} />
                  </div>
                  <div className="p-3 bg-plp-pink/10 rounded-xl">
                    <Calendar className="w-6 h-6 text-plp-pink" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(o.total_users)}</p>
                    <ChangeIndicator value={o.users_change} />
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Listings</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(o.active_listings)}</p>
                    <ChangeIndicator value={o.listings_change} />
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <Building2 className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Key Metrics - Row 2 */}
        {!loading && o && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-plp-purple">{formatNumber(o.total_customers)}</div>
                <div className="text-xs text-gray-500">Customers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-plp-pink">{formatNumber(o.total_agents)}</div>
                <div className="text-xs text-gray-500">Agents</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{o.approved_agents}</div>
                <div className="text-xs text-gray-500">Approved Agents</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{o.pending_agents}</div>
                <div className="text-xs text-gray-500">Pending Agents</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{o.total_reviews}</div>
                <div className="text-xs text-gray-500">Reviews</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900">{o.avg_rating}</span>
                </div>
                <div className="text-xs text-gray-500">Avg Rating</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs for different analytics sections */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="users">Users & Agents</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>

          {/* ===== OVERVIEW TAB ===== */}
          <TabsContent value="overview" className="space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartSkeleton /><ChartSkeleton />
              </div>
            ) : data && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Revenue Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-plp-purple" />
                        Revenue Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.revenue_trend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                          <Tooltip
                            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                            labelStyle={{ fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#390058" fill="#390058" fillOpacity={0.15} strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Booking Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-plp-pink" />
                        Booking Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={data.booking_breakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                            label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                          >
                            {data.booking_breakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Property Type Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        Property Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={data.property_distribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {data.property_distribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number, name: string, props: any) => [`${value}% (${props.payload.count})`, name]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top Locations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        Top Locations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.top_locations}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                          <Tooltip formatter={(value: number, name: string) => name === 'revenue' ? formatCurrency(value) : value} />
                          <Legend />
                          <Bar yAxisId="left" dataKey="properties" fill="#FFB43B" name="Properties" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="right" dataKey="revenue" fill="#390058" name="Revenue" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Properties & Agent Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Properties</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.top_properties.map((property, index) => (
                          <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 bg-plp-purple text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 text-sm">{property.title}</h4>
                                <p className="text-xs text-gray-500">{property.location} · {property.agent}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-plp-purple text-sm">{formatCurrency(property.revenue)}</p>
                              <p className="text-xs text-gray-500">{property.bookings} bookings</p>
                            </div>
                          </div>
                        ))}
                        {data.top_properties.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No property data available</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Agents by Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.agent_performance.map((agent, index) => (
                          <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 bg-plp-pink text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 text-sm">{agent.name}</h4>
                                <p className="text-xs text-gray-500">{agent.listings} listings · {agent.bookings} bookings</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-plp-pink text-sm">{formatCurrency(agent.revenue)}</p>
                              <div className="flex items-center gap-1 justify-end">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs text-gray-500">{agent.rating}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {data.agent_performance.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No agent data available</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* ===== BOOKINGS TAB ===== */}
          <TabsContent value="bookings" className="space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartSkeleton /><ChartSkeleton />
              </div>
            ) : data && o && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-plp-purple">{formatNumber(o.total_bookings)}</div>
                      <div className="text-xs text-gray-500">Total Bookings</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-plp-pink">{formatNumber(o.period_bookings)}</div>
                      <div className="text-xs text-gray-500">Period Bookings</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(o.avg_booking_value)}</div>
                      <div className="text-xs text-gray-500">Avg Booking Value</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <ChangeIndicator value={o.bookings_change} />
                      <div className="text-xs text-gray-500 mt-1">vs Previous Period</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Bookings Over Time */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Bookings Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={data.revenue_trend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                          <Tooltip formatter={(value: number, name: string) => name === 'revenue' ? formatCurrency(value) : value} />
                          <Legend />
                          <Bar yAxisId="left" dataKey="bookings" fill="#FF4672" name="Bookings" radius={[4, 4, 0, 0]} />
                          <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#390058" strokeWidth={2} name="Revenue" dot={{ r: 4 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Booking Status Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={data.booking_breakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {data.booking_breakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        {data.booking_breakdown.map((item) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-gray-600">{item.name}: <strong>{item.value}</strong></span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* ===== USERS & AGENTS TAB ===== */}
          <TabsContent value="users" className="space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartSkeleton /><ChartSkeleton />
              </div>
            ) : data && o && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-plp-purple">{formatNumber(o.total_users)}</div>
                      <div className="text-xs text-gray-500">Total Users</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-plp-pink">{formatNumber(o.new_users_period)}</div>
                      <div className="text-xs text-gray-500">New Users (Period)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{formatNumber(o.total_customers)}</div>
                      <div className="text-xs text-gray-500">Customers</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{formatNumber(o.total_agents)}</div>
                      <div className="text-xs text-gray-500">Agents</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* User Growth Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-plp-purple" />
                        User Growth (Cumulative)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.user_growth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="customers" stroke="#FF4672" fill="#FF4672" fillOpacity={0.1} strokeWidth={2} name="Customers" />
                          <Area type="monotone" dataKey="agents" stroke="#390058" fill="#390058" fillOpacity={0.1} strokeWidth={2} name="Agents" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* New Users per Month */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        New Registrations per Month
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.user_growth}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="new_customers" fill="#FF4672" name="New Customers" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="new_agents" fill="#390058" name="New Agents" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Agent Performance Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-plp-pink" />
                      Agent Performance Rankings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium text-gray-500">#</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-500">Agent</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-500">Listings</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-500">Bookings</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-500">Revenue</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-500">Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.agent_performance.map((agent, i) => (
                            <tr key={agent.id} className="border-b last:border-0 hover:bg-gray-50">
                              <td className="py-3 px-2 font-bold text-gray-400">{i + 1}</td>
                              <td className="py-3 px-2 font-medium text-gray-900">{agent.name}</td>
                              <td className="py-3 px-2 text-center">{agent.listings}</td>
                              <td className="py-3 px-2 text-center">{agent.bookings}</td>
                              <td className="py-3 px-2 text-right font-semibold text-plp-purple">{formatCurrency(agent.revenue)}</td>
                              <td className="py-3 px-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                  {agent.rating}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {data.agent_performance.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-6">No agent performance data</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ===== PAYMENTS TAB ===== */}
          <TabsContent value="payments" className="space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartSkeleton /><ChartSkeleton />
              </div>
            ) : data && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(data.payment_stats.total_collected)}</div>
                      <div className="text-xs text-gray-500">Total Collected</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-plp-purple">{formatCurrency(data.payment_stats.period_collected)}</div>
                      <div className="text-xs text-gray-500">Period Collected</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">{formatCurrency(data.payment_stats.pending)}</div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-500">{formatCurrency(data.payment_stats.total_refunded)}</div>
                      <div className="text-xs text-gray-500">Refunded</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Payment Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-green-500" />
                        Payment Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={data.payment_stats.trend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip formatter={(value: number, name: string) => name === 'amount' ? formatCurrency(value) : value} />
                          <Legend />
                          <Area yAxisId="left" type="monotone" dataKey="amount" fill="#22c55e" fillOpacity={0.15} stroke="#22c55e" strokeWidth={2} name="Amount" />
                          <Line yAxisId="right" type="monotone" dataKey="count" stroke="#390058" strokeWidth={2} name="Transactions" dot={{ r: 4 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Payment by Provider */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-plp-purple" />
                        By Payment Provider
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data.payment_stats.by_provider.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={data.payment_stats.by_provider} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                            <YAxis dataKey="provider" type="category" width={80} tick={{ fontSize: 12 }} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Bar dataKey="total" fill="#390058" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-12">No payment provider data</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 font-medium text-gray-500">ID</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-500">User</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-500">Purpose</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-500">Amount</th>
                            <th className="text-center py-3 px-2 font-medium text-gray-500">Status</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-500">Provider</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.recent_transactions.map((tx) => (
                            <tr key={tx.id} className="border-b last:border-0 hover:bg-gray-50">
                              <td className="py-3 px-2 text-gray-500">#{tx.id}</td>
                              <td className="py-3 px-2 font-medium text-gray-900">{tx.user}</td>
                              <td className="py-3 px-2 capitalize">{tx.purpose}</td>
                              <td className="py-3 px-2 text-right font-semibold">{formatCurrency(tx.amount)}</td>
                              <td className="py-3 px-2 text-center">
                                <Badge className={
                                  tx.status === 'success' ? 'bg-green-100 text-green-800' :
                                  tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }>
                                  {tx.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-2 capitalize">{tx.provider}</td>
                              <td className="py-3 px-2 text-gray-500 text-xs">
                                {tx.paid_at ? new Date(tx.paid_at).toLocaleDateString() : tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {data.recent_transactions.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-6">No recent transactions</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ===== SUBSCRIPTIONS TAB ===== */}
          <TabsContent value="subscriptions" className="space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartSkeleton /><ChartSkeleton />
              </div>
            ) : data && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-plp-purple">{data.subscription_stats.total}</div>
                      <div className="text-xs text-gray-500">Total Subscriptions</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{data.subscription_stats.active}</div>
                      <div className="text-xs text-gray-500">Active</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(data.subscription_stats.total_revenue)}</div>
                      <div className="text-xs text-gray-500">Subscription Revenue</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-plp-pink">{formatCurrency(data.subscription_stats.monthly_recurring)}</div>
                      <div className="text-xs text-gray-500">Monthly Recurring</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Subscription Status Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-plp-purple" />
                        Subscription Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={data.subscription_stats.breakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {data.subscription_stats.breakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        {data.subscription_stats.breakdown.map((item) => (
                          <div key={item.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm text-gray-600">{item.name}: <strong>{item.value}</strong></span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subscription Summary Cards */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="text-sm font-medium text-green-700">Active</div>
                          <div className="text-3xl font-bold text-green-600">{data.subscription_stats.active}</div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="text-sm font-medium text-blue-700">Trialing</div>
                          <div className="text-3xl font-bold text-blue-600">{data.subscription_stats.trialing}</div>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                          <div className="text-sm font-medium text-red-700">Cancelled</div>
                          <div className="text-3xl font-bold text-red-600">{data.subscription_stats.cancelled}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-700">Expired</div>
                          <div className="text-3xl font-bold text-gray-600">{data.subscription_stats.expired}</div>
                        </div>
                      </div>
                      <div className="p-4 bg-plp-purple/5 rounded-lg">
                        <div className="text-sm font-medium text-plp-purple mb-1">Total Subscription Revenue</div>
                        <div className="text-2xl font-bold text-plp-purple">{formatCurrency(data.subscription_stats.total_revenue)}</div>
                      </div>
                      <div className="p-4 bg-plp-pink/5 rounded-lg">
                        <div className="text-sm font-medium text-plp-pink mb-1">Monthly Recurring Revenue</div>
                        <div className="text-2xl font-bold text-plp-pink">{formatCurrency(data.subscription_stats.monthly_recurring)}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
