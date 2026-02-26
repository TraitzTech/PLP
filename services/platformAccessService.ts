import apiClient from '@/lib/apiClient';

export interface PlatformAccessStatus {
  can_contact: boolean;
  has_booking: boolean;
  has_paid_access: boolean;
  requires_platform_fee?: boolean;
  reason: string | null;
  platform_fee_xaf: number;
  latest_access?: any;
}

export interface CustomerAgentAccess {
  id: number;
  customer_user_id: number;
  agent_id: number;
  booking_id?: number | null;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
  amount: number;
  currency: string;
  paid_at?: string | null;
  payment_reference?: string | null;
  payment_method?: string | null;
  agent?: {
    id: number;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
}

export const platformAccessService = {
  async getFeeConfig(): Promise<{ status: string; data: { platform_fee_xaf: number; currency: string; is_enabled?: boolean } }> {
    const { data } = await apiClient.get('/customer/platform-access/fee');
    return data;
  },

  async getStatus(agentId: number): Promise<{ status: string; data: PlatformAccessStatus }> {
    const { data } = await apiClient.get(`/customer/platform-access/${agentId}/status`);
    return data;
  },

  async pay(payload: { agent_id: number; booking_id?: number; payment_channel?: string; phone_number?: string }): Promise<{ status: string; message: string; data: CustomerAgentAccess }> {
    const { data } = await apiClient.post('/customer/platform-access/pay', payload);
    return data;
  },

  async list(params?: { page?: number; per_page?: number }): Promise<{ status: string; data: { data: CustomerAgentAccess[]; total: number; current_page: number; last_page: number; per_page: number } }> {
    const { data } = await apiClient.get('/customer/platform-access', { params });
    return data;
  },
};
