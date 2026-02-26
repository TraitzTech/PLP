import apiClient from '@/lib/apiClient';

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  plan_category?: 'basic' | 'premium' | 'featured' | 'custom';
  target_audience?: 'agent' | 'landlord' | 'both';
  description?: string | null;
  price: number;
  currency: string;
  billing_period: 'monthly' | 'quarterly' | 'yearly';
  billing_interval: number;
  free_trial_days: number;
  property_limit: number | null;
  featured_limit: number | null;
  virtual_tour_limit?: number | null;
  benefits?: string[] | null;
  is_active: boolean;
  sort_order: number;
  active_subscribers?: number;
  total_subscribers?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AgentSubscription {
  id: number;
  agent_id: number;
  subscription_plan_id: number;
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired';
  starts_at: string;
  trial_ends_at?: string | null;
  ends_at?: string | null;
  cancelled_at?: string | null;
  auto_renew: boolean;
  price_paid: number;
  currency: string;
  payment_method?: string | null;
  payment_reference?: string | null;
  plan?: SubscriptionPlan;
  agent?: {
    id: number;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionPlansResponse {
  status: string;
  data: SubscriptionPlan[];
  stats?: {
    active_plans: number;
    total_subscribers: number;
    monthly_revenue: number;
    platform_fee_xaf: number;
  };
}

export interface PaginatedResponse<T> {
  status: string;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats?: Record<string, number>;
}

export interface CurrentSubscriptionResponse {
  status: string;
  data: {
    subscription: AgentSubscription | null;
    can_manage_listings: boolean;
    restriction_message: string | null;
    plan: SubscriptionPlan | null;
  };
}

export const subscriptionService = {
  async getPublicPlans(params?: { audience?: 'agent' | 'landlord' }): Promise<SubscriptionPlansResponse> {
    const { data } = await apiClient.get<SubscriptionPlansResponse>('/subscription-plans', { params });
    return data;
  },

  async getAdminPlans(): Promise<SubscriptionPlansResponse> {
    const { data } = await apiClient.get<SubscriptionPlansResponse>('/admin/subscription-plans');
    return data;
  },

  async createPlan(payload: Partial<SubscriptionPlan>): Promise<{ status: string; data: SubscriptionPlan; message: string }> {
    const { data } = await apiClient.post('/admin/subscription-plans', payload);
    return data;
  },

  async updatePlan(id: number, payload: Partial<SubscriptionPlan>): Promise<{ status: string; data: SubscriptionPlan; message: string }> {
    const { data } = await apiClient.put(`/admin/subscription-plans/${id}`, payload);
    return data;
  },

  async deletePlan(id: number): Promise<{ status: string; message: string }> {
    const { data } = await apiClient.delete(`/admin/subscription-plans/${id}`);
    return data;
  },

  async togglePlanStatus(id: number): Promise<{ status: string; data: SubscriptionPlan; message: string }> {
    const { data } = await apiClient.patch(`/admin/subscription-plans/${id}/toggle-status`);
    return data;
  },

  async getAdminSubscriptions(params?: {
    status?: string;
    search?: string;
    plan_id?: number;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<AgentSubscription>> {
    const { data } = await apiClient.get<PaginatedResponse<AgentSubscription>>('/admin/subscriptions', { params });
    return data;
  },

  async updateAdminSubscriptionStatus(id: number, payload: { status: AgentSubscription['status']; auto_renew?: boolean }) {
    const { data } = await apiClient.patch(`/admin/subscriptions/${id}/status`, payload);
    return data;
  },

  async getCurrentAgentSubscription(): Promise<CurrentSubscriptionResponse> {
    const { data } = await apiClient.get<CurrentSubscriptionResponse>('/agent/subscription');
    return data;
  },

  async getAgentSubscriptionHistory(params?: { per_page?: number; page?: number }): Promise<PaginatedResponse<AgentSubscription>> {
    const { data } = await apiClient.get<PaginatedResponse<AgentSubscription>>('/agent/subscription/history', { params });
    return data;
  },

  async subscribe(payload: { plan_id: number; payment_channel?: string; phone_number?: string }) {
    const { data } = await apiClient.post('/agent/subscription/subscribe', payload);
    return data;
  },

  async cancelCurrent() {
    const { data } = await apiClient.post('/agent/subscription/cancel');
    return data;
  },
};
