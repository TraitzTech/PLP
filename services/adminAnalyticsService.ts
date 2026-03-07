import apiClient from '@/lib/apiClient';
import { getToken } from '@/lib/authToken';

export interface AdminOverviewMetrics {
  total_users: number;
  total_customers: number;
  total_agents: number;
  approved_agents: number;
  pending_agents: number;
  total_listings: number;
  active_listings: number;
  total_bookings: number;
  period_bookings: number;
  total_revenue: number;
  period_revenue: number;
  bookings_change: number;
  revenue_change: number;
  users_change: number;
  listings_change: number;
  total_payments: number;
  pending_payments: number;
  avg_booking_value: number;
  total_reviews: number;
  avg_rating: number;
  new_users_period: number;
}

export interface TrendPoint {
  month: string;
  revenue: number;
  bookings: number;
}

export interface UserGrowthPoint {
  month: string;
  customers: number;
  agents: number;
  new_customers: number;
  new_agents: number;
}

export interface BreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface PropertyDistItem {
  name: string;
  value: number;
  count: number;
  color: string;
}

export interface TopLocation {
  city: string;
  properties: number;
  revenue: number;
}

export interface TopProperty {
  id: number;
  title: string;
  location: string;
  agent: string;
  bookings: number;
  revenue: number;
  status: string;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  trialing: number;
  cancelled: number;
  expired: number;
  total_revenue: number;
  monthly_recurring: number;
  breakdown: BreakdownItem[];
}

export interface PaymentStats {
  total_collected: number;
  period_collected: number;
  total_refunded: number;
  pending: number;
  failed_count: number;
  trend: { month: string; amount: number; count: number }[];
  by_provider: { provider: string; total: number; count: number }[];
}

export interface RecentTransaction {
  id: number;
  user: string;
  purpose: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  paid_at: string | null;
  created_at: string;
}

export interface AgentPerformance {
  id: number;
  name: string;
  listings: number;
  bookings: number;
  revenue: number;
  rating: number;
}

export interface AdminAnalyticsData {
  overview: AdminOverviewMetrics;
  revenue_trend: TrendPoint[];
  user_growth: UserGrowthPoint[];
  booking_breakdown: BreakdownItem[];
  property_distribution: PropertyDistItem[];
  top_locations: TopLocation[];
  top_properties: TopProperty[];
  subscription_stats: SubscriptionStats;
  payment_stats: PaymentStats;
  recent_transactions: RecentTransaction[];
  agent_performance: AgentPerformance[];
}

const adminAnalyticsService = {
  async getAnalytics(period: string = '6months'): Promise<{ data: AdminAnalyticsData }> {
    const response = await apiClient.get('/admin/analytics', { params: { period } });
    return response.data;
  },

  async exportReport(period: string = '6months', type: string = 'bookings'): Promise<Blob> {
    const token = getToken();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(
      `${baseUrl}/admin/analytics/export?period=${encodeURIComponent(period)}&type=${encodeURIComponent(type)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  },
};

export default adminAnalyticsService;
