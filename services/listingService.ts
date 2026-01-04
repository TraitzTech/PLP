import apiClient from "@/lib/apiClient";
import type {
  Listing,
  ListingCreateRequest,
  ListingCreateResponse,
  ListingDeleteResponse,
} from "./types";

const BASE_URL = "/listings";

export interface ListingsListResponse {
  status: "success";
  data: Listing[];
}

export interface ListingShowResponse {
  status: "success";
  data: Listing;
}

export interface ListingUpdateResponse {
  status: "success";
  message: "Listing updated successfully";
  data: Listing;
}

export const listingService = {
  /**
   * Get all agent listings
   */
  async getAllListings(params?: {
    per_page?: number;
    page?: number;
  }): Promise<ListingsListResponse> {
    try {
      const response = await apiClient.get<ListingsListResponse>(BASE_URL, { params });
      
      return response.data;
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      throw error;
    }
  },

  /**
   * Get a single listing
   */
  async getListing(id: string | number): Promise<ListingShowResponse> {
    try {
      const response = await apiClient.get<ListingShowResponse>(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch listing ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new listing
   */
  async createListing(data: ListingCreateRequest): Promise<ListingCreateResponse> {
    try {
      const response = await apiClient.post<ListingCreateResponse>(BASE_URL, data);
      return response.data;
    } catch (error) {
      console.error("Failed to create listing:", error);
      throw error;
    }
  },

  /**
   * Update a listing
   */
  async updateListing(
    id: string | number,
    data: ListingCreateRequest
  ): Promise<ListingUpdateResponse> {
    try {
      const response = await apiClient.put<ListingUpdateResponse>(`${BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to update listing ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a listing
   */
  async deleteListing(id: string | number): Promise<ListingDeleteResponse> {
    try {
      const response = await apiClient.delete<ListingDeleteResponse>(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete listing ${id}:`, error);
      throw error;
    }
  },
};
