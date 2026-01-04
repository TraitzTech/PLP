import apiClient from "@/lib/apiClient";
import type { AdminProperty, AdminPropertiesListResponse } from "./types";

export const publicPropertyService = {
  /**
   * Get all public properties (no authentication required)
   * This endpoint is used for public-facing pages like homepage and search
   */
  async getAllProperties(params?: {
    per_page?: number;
    page?: number;
    is_featured?: boolean;
    search?: string;
    property_type_id?: number;
  }): Promise<AdminPropertiesListResponse> {
    try {
      const response = await apiClient.get<AdminPropertiesListResponse>("/listings", { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch public properties:", error);
      throw error;
    }
  },

  /**
   * Get a single property by ID (public endpoint, no authentication required)
   */
  async getProperty(id: string | number): Promise<{ status: string; data: AdminProperty }> {
    try {
      const response = await apiClient.get<{ status: string; data: AdminProperty }>(`/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch property ${id}:`, error);
      throw error;
    }
  },
};
