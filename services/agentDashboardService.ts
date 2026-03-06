import apiClient from "@/lib/apiClient";

// ---- Types ----

export interface AgentClient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  joined_date: string | null;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  active_bookings: number;
  total_spent: number;
  last_booking_date: string | null;
  status: "active" | "inactive";
  booked_listings: string[];
}

export interface AgentClientsSummary {
  total_clients: number;
  active_clients: number;
  total_revenue: number;
  average_spending: number;
}

export interface AgentClientsResponse {
  status: string;
  data: {
    clients: AgentClient[];
    summary: AgentClientsSummary;
  };
}

export interface RevenueTrendItem {
  month: string;
  revenue: number;
  bookings: number;
}

export interface PropertyPerformanceItem {
  id: number;
  name: string;
  revenue: number;
  bookings: number;
  rating: number;
}

export interface ClientGrowthItem {
  month: string;
  clients: number;
  new_clients: number;
}

export interface BookingStatusItem {
  name: string;
  value: number;
  color: string;
}

export interface KeyMetrics {
  total_revenue: number;
  period_revenue: number;
  revenue_change: number;
  total_commission: number;
  total_bookings: number;
  period_bookings: number;
  completed_bookings: number;
  occupancy_rate: number;
  average_rating: number;
  total_listings: number;
  active_listings: number;
}

export interface MonthlySummary {
  active_clients: number;
  total_clients: number;
  average_rating: number;
  total_reviews: number;
}

export interface AgentAnalyticsData {
  key_metrics: KeyMetrics;
  revenue_trend: RevenueTrendItem[];
  property_performance: PropertyPerformanceItem[];
  client_growth: ClientGrowthItem[];
  booking_status_breakdown: BookingStatusItem[];
  monthly_summary: MonthlySummary;
}

export interface AgentAnalyticsResponse {
  status: string;
  data: AgentAnalyticsData;
}

// ---- Service ----

const agentDashboardService = {
  /**
   * Get all clients who have booked the agent's listings
   */
  async getClients(params?: {
    search?: string;
    status?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<AgentClientsResponse> {
    const response = await apiClient.get<AgentClientsResponse>(
      "/agent/clients",
      { params }
    );
    return response.data;
  },

  /**
   * Get comprehensive analytics data
   */
  async getAnalytics(
    period?: string
  ): Promise<AgentAnalyticsResponse> {
    const response = await apiClient.get<AgentAnalyticsResponse>(
      "/agent/analytics",
      { params: { period } }
    );
    return response.data;
  },

  /**
   * Get export download URL with auth token
   */
  getExportUrl(period?: string): string {
    const base =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const url = new URL(`${base}/agent/analytics/export`);
    if (period) url.searchParams.set("period", period);
    return url.toString();
  },
};

export default agentDashboardService;
