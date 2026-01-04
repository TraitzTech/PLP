import apiClient from "@/lib/apiClient";
import type {
  ActivityListResponse,
  ActivityShowResponse,
  ActivityStatisticsResponse,
  ActivityTimelineResponse,
} from "./types";

const BASE_URL = "/activities";

export const activityService = {
  /**
   * Get all activities with optional filters
   */
  async getAllActivities(params?: {
    per_page?: number;
    page?: number;
    user_type?: string;
    user_id?: number;
    action?: string;
    model_type?: string;
    from_date?: string;
    to_date?: string;
    search?: string;
  }): Promise<ActivityListResponse> {
    const response = await apiClient.get<ActivityListResponse>(BASE_URL, {
      params,
    });
    return response.data;
  },

  /**
   * Get a single activity by ID
   */
  async getActivity(id: string | number): Promise<ActivityShowResponse> {
    const response = await apiClient.get<ActivityShowResponse>(
      `${BASE_URL}/${id}`
    );
    return response.data;
  },

  /**
   * Get activity statistics
   */
  async getStatistics(params?: {
    user_id?: number;
  }): Promise<ActivityStatisticsResponse> {
    const response = await apiClient.get<ActivityStatisticsResponse>(
      `${BASE_URL}/statistics`,
      { params }
    );
    return response.data;
  },

  /**
   * Get activity timeline
   */
  async getTimeline(params?: {
    days?: number;
    user_id?: number;
  }): Promise<ActivityTimelineResponse> {
    const response = await apiClient.get<ActivityTimelineResponse>(
      `${BASE_URL}/timeline`,
      { params }
    );
    return response.data;
  },
};
