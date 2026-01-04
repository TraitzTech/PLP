import apiClient from "@/lib/apiClient";
import type { DashboardStatsResponse, TopProperty, PendingApproval } from "./types";

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(userType?: "admin" | "agent" | "customer"): Promise<DashboardStatsResponse> {
    const endpoint = userType ? `/dashboard/stats?user_type=${userType}` : "/dashboard/stats";
    const response = await apiClient.get<DashboardStatsResponse>(endpoint);
    return response.data;
  },

  /**
   * Get top performing properties
   */
  async getTopProperties(params?: {
    limit?: number;
    user_id?: number;
  }): Promise<{ status: string; data: TopProperty[] }> {
    const response = await apiClient.get("/dashboard/top-properties", {
      params,
    });
    return response.data;
  },

  /**
   * Get pending approvals (admin/agent only)
   */
  async getPendingApprovals(params?: {
    limit?: number;
  }): Promise<{ status: string; data: PendingApproval[] }> {
    const response = await apiClient.get("/dashboard/pending-approvals", {
      params,
    });
    return response.data;
  },
};
