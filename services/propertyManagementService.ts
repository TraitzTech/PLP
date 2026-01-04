import apiClient from "@/lib/apiClient";
import type {
  AdminPropertiesListResponse,
  AdminPropertyShowResponse,
  AdminPropertyCreateRequest,
  AdminPropertyCreateResponse,
  AdminPropertyUpdateRequest,
  AdminPropertyUpdateResponse,
  AdminPropertyDeleteResponse,
  AdminPropertyApprovalRequest,
  AdminPropertyApprovalResponse,
  AdminPropertyFeaturedResponse,
  PropertyStatisticsResponse,
} from "./types";

const BASE_URL = "/admin/properties";

export const propertyManagementService = {
  /**
   * Get all properties with filtering
   */
  async getAllProperties(params?: {
    per_page?: number;
    page?: number;
    is_approved?: boolean;
    is_featured?: boolean;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<AdminPropertiesListResponse> {
    try {
      const response = await apiClient.get<AdminPropertiesListResponse>(BASE_URL, { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      throw error;
    }
  },

  /**
   * Get property statistics
   */
  async getStatistics(): Promise<PropertyStatisticsResponse> {
    try {
      const response = await apiClient.get<PropertyStatisticsResponse>(`${BASE_URL}/statistics`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch property statistics:", error);
      throw error;
    }
  },

  /**
   * Get a single property
   */
  async getProperty(id: string | number): Promise<AdminPropertyShowResponse> {
    try {
      const response = await apiClient.get<AdminPropertyShowResponse>(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch property ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new property
   */
  async createProperty(data: AdminPropertyCreateRequest): Promise<AdminPropertyCreateResponse> {
    try {
      const response = await apiClient.post<AdminPropertyCreateResponse>(BASE_URL, data);
      return response.data;
    } catch (error) {
      console.error("Failed to create property:", error);
      throw error;
    }
  },

  /**
   * Update property details
   */
  async updateProperty(
    id: string | number,
    data: AdminPropertyUpdateRequest
  ): Promise<AdminPropertyUpdateResponse> {
    try {
      const response = await apiClient.put<AdminPropertyUpdateResponse>(`${BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update property ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a property
   */
  async deleteProperty(id: string | number): Promise<AdminPropertyDeleteResponse> {
    try {
      const response = await apiClient.delete<AdminPropertyDeleteResponse>(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete property ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update property approval status
   */
  async updateApprovalStatus(
    id: string | number,
    data: AdminPropertyApprovalRequest
  ): Promise<AdminPropertyApprovalResponse> {
    try {
      const response = await apiClient.patch<AdminPropertyApprovalResponse>(
        `${BASE_URL}/${id}/approval`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update approval status for property ${id}:`, error);
      throw error;
    }
  },

  /**
   * Toggle featured status
   */
  async toggleFeaturedStatus(id: string | number): Promise<AdminPropertyFeaturedResponse> {
    try {
      const response = await apiClient.patch<AdminPropertyFeaturedResponse>(
        `${BASE_URL}/${id}/featured`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to toggle featured status for property ${id}:`, error);
      throw error;
    }
  },
};
