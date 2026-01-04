import apiClient from "@/lib/apiClient";
import type {
  Facility,
  FacilityCreateRequest,
  FacilityCreateResponse,
  FacilityUpdateResponse,
  FacilityDeleteResponse,
  FacilityNotFoundResponse,
} from "./types";

const BASE_URL = "/facilities";

export const facilitiesService = {
  /**
   * Get all facilities with optional filters
   */
  async getAllFacilities(params?: {
    per_page?: number;
    page?: number;
    search?: string;
    status?: string;
  }): Promise<Facility[]> {
    const response = await apiClient.get<Facility[]>(
      BASE_URL,
      { params }
    );
    // The API returns the array directly, not wrapped in { data: [] }
    return response.data;
  },

  /**
   * Get a single facility by ID
   */
  async getFacility(
    id: string | number
  ): Promise<{ status: string; data: Facility }> {
    const response = await apiClient.get<{ status: string; data: Facility }>(
      `${BASE_URL}/${id}`
    );
    return response.data;
  },

  /**
   * Create a new facility
   */
  async createFacility(
    payload: FacilityCreateRequest
  ): Promise<FacilityCreateResponse> {
    const response = await apiClient.post<FacilityCreateResponse>(
      BASE_URL,
      payload
    );
    return response.data;
  },

  /**
   * Update a facility
   */
  async updateFacility(
    id: string | number,
    payload: Partial<Facility>
  ): Promise<FacilityUpdateResponse> {
    const response = await apiClient.put<FacilityUpdateResponse>(
      `${BASE_URL}/${id}`,
      payload
    );
    return response.data;
  },

  /**
   * Delete a facility
   */
  async deleteFacility(
    id: string | number
  ): Promise<FacilityDeleteResponse> {
    const response = await apiClient.delete<FacilityDeleteResponse>(
      `${BASE_URL}/${id}`
    );
    return response.data;
  },
};