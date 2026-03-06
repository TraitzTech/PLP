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
  ListingImage,
  ListingVideo,
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
      // Convert facilities_id from numbers to strings for API
      const payload = {
        ...data,
        facilities_id: data.facilities_id.map(id => id.toString()),
      };
      const response = await apiClient.post<AdminPropertyCreateResponse>(BASE_URL, payload);
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

  /**
   * Upload images for admin property
   * Use this for admin property image uploads (not agent listings)
   */
  async uploadPropertyImages(
    propertyId: string | number,
    files: File[]
  ): Promise<ListingImage[]> {
    try {
      if (!files || files.length === 0) {
        throw new Error("No files provided");
      }

      const formData = new FormData();

      // Append all files to FormData
      files.forEach((file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not a valid image file`);
        }
        formData.append("images[]", file);
      });

      const response = await apiClient.post(
        `${BASE_URL}/${propertyId}/images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error(`Error uploading images for property ${propertyId}:`, error);
      throw error;
    }
  },

  /**
   * Delete image from admin property
   */
  async deletePropertyImage(imageId: string | number): Promise<void> {
    try {
      await apiClient.delete(`${BASE_URL}/images/${imageId}`);
    } catch (error) {
      console.error(`Error deleting image ${imageId}:`, error);
      throw error;
    }
  },

  /**
   * Upload videos for admin property
   * Use this for admin property video uploads (not agent listings)
   */
  async uploadPropertyVideos(
    propertyId: string | number,
    files: File[],
    url?: string
  ): Promise<any> {
    try {
      const formData = new FormData();
      
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("videos[]", file);
        });
      }
      
      if (url) {
        formData.append("url", url);
      }

      const response = await apiClient.post(
        `${BASE_URL}/${propertyId}/videos`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to upload videos for property ${propertyId}:`, error);
      throw error;
    }
  },

  /**
   * Delete video from admin property
   */
  async deletePropertyVideo(videoId: string | number): Promise<void> {
    try {
      await apiClient.delete(`${BASE_URL}/videos/${videoId}`);
    } catch (error) {
      console.error(`Error deleting video ${videoId}:`, error);
      throw error;
    }
  },
};
