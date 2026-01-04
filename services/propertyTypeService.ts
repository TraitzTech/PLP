import apiClient from "@/lib/apiClient";
import type {
  PropertyType,
  PropertyTypeCreateRequest,
  PropertyTypeCreateResponse,
  PropertyTypeShowResponse,
  PropertyTypeUpdateResponse,
  PropertyTypeDeleteResponse204,
} from "./types";

const BASE_URL = "/property-types";

export const propertyTypeService = {
  /**
   * Get all property types with optional filters
   */
  async getAllPropertyTypes(params?: {
    per_page?: number;
    page?: number;
    search?: string;
    status?: string;
  }): Promise<PropertyType[]> {
    const response = await apiClient.get<PropertyType[]>(
      BASE_URL,
      { params }
    );
    // API returns array directly, not wrapped
    return response.data;
  },

  /**
   * Get a single property type
   */
  async getPropertyType(
    id: string | number
  ): Promise<PropertyTypeShowResponse> {
    const response = await apiClient.get<PropertyTypeShowResponse>(
      `${BASE_URL}/${id}`
    );
    return response.data;
  },

  /**
   * Create a new property type
   */
  async createPropertyType(
    data: PropertyTypeCreateRequest
  ): Promise<PropertyTypeCreateResponse> {
    const response = await apiClient.post<PropertyTypeCreateResponse>(
      BASE_URL,
      data
    );
    return response.data;
  },

  /**
   * Update a property type
   */
  async updatePropertyType(
    id: string | number,
    data: Partial<PropertyTypeCreateRequest>
  ): Promise<PropertyTypeUpdateResponse> {
    const response = await apiClient.put<PropertyTypeUpdateResponse>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a property type
   */
  async deletePropertyType(
    id: string | number
  ): Promise<PropertyTypeDeleteResponse204> {
    const response = await apiClient.delete<PropertyTypeDeleteResponse204>(
      `${BASE_URL}/${id}`
    );
    return response.data;
  },
};