import apiClient from "@/lib/apiClient";

export interface PaymentTransaction {
  id: number;
  amount: number;
  currency: string;
  status: string;
  reference?: string;
  channel?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any> | null;
}

export const paymentService = {
  /** Fetch payment transactions for the current user */
  async getTransactions(): Promise<PaymentTransaction[]> {
    const response = await apiClient.get<{ status?: string; data?: any }>(
      "/payments/transactions"
    );
    const raw = response.data?.data;
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    return [];
  },
};
