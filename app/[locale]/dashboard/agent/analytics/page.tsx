"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useTranslations } from "@/components/translation-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  DollarSign,
  Users,
  Download,
  Filter,
  Star,
} from "lucide-react";
import agentDashboardService, {
  AgentAnalyticsData,
} from "@/services/agentDashboardService";
import { getToken } from "@/lib/authToken";

export default function AgentAnalyticsPage() {
  const t = useTranslations();
  const [period, setPeriod] = useState("6months");
  const [data, setData] = useState<AgentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await agentDashboardService.getAnalytics(period);
      setData(response.data);
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err);
      setError(
        err?.message ||
          t(
            "dashboards.agent.analytics.errors.loadAnalytics",
            "Failed to load analytics",
          ),
      );
    } finally {
      setLoading(false);
    }
  }, [period, t]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const url = agentDashboardService.getExportUrl(period);
      const token = getToken();
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok)
        throw new Error(
          t("dashboards.agent.analytics.errors.exportFailed", "Export failed"),
        );
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `analytics-report-${period}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const ChangeIndicator = ({ value }: { value: number }) => {
    if (value >= 0) {
      return (
        <div className="flex items-center text-green-600 text-sm mt-1">
          <TrendingUp className="w-4 h-4 mr-1" />+{value.toFixed(1)}%
        </div>
      );
    }
    return (
      <div className="flex items-center text-red-500 text-sm mt-1">
        <TrendingDown className="w-4 h-4 mr-1" />
        {value.toFixed(1)}%
      </div>
    );
  };

  const MetricSkeleton = () => (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      </CardContent>
    </Card>
  );

  const ChartSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );

  if (error && !data) {
    return (
      <DashboardLayout userType="agent">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <Button onClick={fetchAnalytics}>
            {t("dashboards.common.retry", "Retry")}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const metrics = data?.key_metrics;

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {t("dashboards.agent.analytics.title", "Analytics & Reports")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t(
                "dashboards.agent.analytics.subtitle",
                "Analyze the performance of your properties and clients.",
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">
                  {t(
                    "dashboards.agent.analytics.period.lastMonth",
                    "Last Month",
                  )}
                </SelectItem>
                <SelectItem value="3months">
                  {t(
                    "dashboards.agent.analytics.period.last3Months",
                    "Last 3 Months",
                  )}
                </SelectItem>
                <SelectItem value="6months">
                  {t(
                    "dashboards.agent.analytics.period.last6Months",
                    "Last 6 Months",
                  )}
                </SelectItem>
                <SelectItem value="1year">
                  {t("dashboards.agent.analytics.period.lastYear", "Last Year")}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="btn-primary"
              onClick={handleExport}
              disabled={exporting || loading}
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting
                ? t(
                    "dashboards.agent.analytics.export.exporting",
                    "Exporting...",
                  )
                : t(
                    "dashboards.agent.analytics.export.exportReport",
                    "Export Report",
                  )}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            <>
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t(
                          "dashboards.agent.analytics.metrics.totalRevenue",
                          "Total Revenue",
                        )}
                      </p>
                      <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(metrics?.total_revenue ?? 0)}
                      </p>
                      <ChangeIndicator value={metrics?.revenue_change ?? 0} />
                    </div>
                    <DollarSign className="w-7 h-7 md:w-8 md:h-8 text-plp-purple" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t(
                          "dashboards.agent.analytics.metrics.commission",
                          "Commission",
                        )}
                      </p>
                      <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(metrics?.total_commission ?? 0)}
                      </p>
                    </div>
                    <Star className="w-7 h-7 md:w-8 md:h-8 text-plp-pink" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t(
                          "dashboards.agent.analytics.metrics.bookings",
                          "Bookings",
                        )}
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        {metrics?.total_bookings ?? 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {metrics?.completed_bookings ?? 0}{" "}
                        {t(
                          "dashboards.agent.analytics.metrics.completed",
                          "completed",
                        )}
                      </p>
                    </div>
                    <Calendar className="w-7 h-7 md:w-8 md:h-8 text-plp-yellow" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t(
                          "dashboards.agent.analytics.metrics.occupancyRate",
                          "Occupancy Rate",
                        )}
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                        {metrics?.occupancy_rate ?? 0}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {metrics?.active_listings ?? 0}/
                        {metrics?.total_listings ?? 0}{" "}
                        {t(
                          "dashboards.agent.analytics.metrics.active",
                          "active",
                        )}
                      </p>
                    </div>
                    <Building2 className="w-7 h-7 md:w-8 md:h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t(
                      "dashboards.agent.analytics.charts.revenueTrend",
                      "Revenue Trend",
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data?.revenue_trend ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(0)}M`
                        }
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#390058"
                        fill="#390058"
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Booking Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t(
                      "dashboards.agent.analytics.charts.bookingStatus",
                      "Booking Status",
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data?.booking_status_breakdown ?? []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {(data?.booking_status_breakdown ?? []).map(
                          (entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Property Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t(
                      "dashboards.agent.analytics.charts.propertyPerformance",
                      "Property Performance",
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data?.property_performance ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis
                        tickFormatter={(value) =>
                          `${(value / 1000000).toFixed(0)}M`
                        }
                      />
                      <Tooltip
                        formatter={(value, name) =>
                          name === "revenue"
                            ? formatCurrency(value as number)
                            : value
                        }
                      />
                      <Bar dataKey="revenue" fill="#FF4672" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Client Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t(
                      "dashboards.agent.analytics.charts.clientGrowth",
                      "Client Growth",
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data?.client_growth ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="clients"
                        stroke="#390058"
                        strokeWidth={2}
                        name={t(
                          "dashboards.agent.analytics.charts.totalClients",
                          "Total Clients",
                        )}
                      />
                      <Line
                        type="monotone"
                        dataKey="new_clients"
                        stroke="#FFB43B"
                        strokeWidth={2}
                        name={t(
                          "dashboards.agent.analytics.charts.newClients",
                          "New Clients",
                        )}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Detailed Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              {/* Top Properties */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t(
                      "dashboards.agent.analytics.tables.topProperties",
                      "Top Properties",
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(data?.property_performance ?? []).length === 0 ? (
                      <p className="text-gray-500 text-center py-6">
                        {t(
                          "dashboards.agent.analytics.tables.noPropertyData",
                          "No property data yet.",
                        )}
                      </p>
                    ) : (
                      (data?.property_performance ?? []).map(
                        (property, index) => (
                          <div
                            key={property.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-plp-purple text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {property.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {property.bookings}{" "}
                                  {t(
                                    "dashboards.agent.analytics.tables.bookings",
                                    "bookings",
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-plp-purple">
                                {formatCurrency(property.revenue)}
                              </p>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                {property.rating.toFixed(1)}
                              </div>
                            </div>
                          </div>
                        ),
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("dashboards.agent.analytics.tables.summary", "Summary")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {data?.monthly_summary?.active_clients ?? 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t(
                            "dashboards.agent.analytics.summary.activeClients",
                            "Active Clients",
                          )}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {(data?.monthly_summary?.average_rating ?? 0).toFixed(
                            1,
                          )}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t(
                            "dashboards.agent.analytics.summary.avgRating",
                            "Avg Rating",
                          )}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg col-span-2 sm:col-span-1">
                        <p className="text-2xl font-bold text-green-600">
                          {data?.monthly_summary?.total_reviews ?? 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t(
                            "dashboards.agent.analytics.summary.reviews",
                            "Reviews",
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {t(
                          "dashboards.agent.analytics.summary.listingsOverview",
                          "Listings Overview",
                        )}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t(
                              "dashboards.agent.analytics.summary.totalListings",
                              "Total Listings",
                            )}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {metrics?.total_listings ?? 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t(
                              "dashboards.agent.analytics.summary.activeListings",
                              "Active Listings",
                            )}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {metrics?.active_listings ?? 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t(
                              "dashboards.agent.analytics.summary.totalBookings",
                              "Total Bookings",
                            )}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {metrics?.total_bookings ?? 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t(
                              "dashboards.agent.analytics.summary.completed",
                              "Completed",
                            )}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {metrics?.completed_bookings ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
