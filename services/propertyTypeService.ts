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

// Property types rarely change and are re-fetched on nearly every property
// form across the site (agent, admin, PAO). A short in-memory cache avoids
// redundant round-trips within a session without needing any invalidation
// wiring beyond the mutations already in this file.
const CACHE_TTL_MS = 5 * 60 * 1000;
let unfilteredCache: { data: PropertyType[]; expiresAt: number } | null = null;

function invalidateCache() {
  unfilteredCache = null;
}

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
    const isCacheable = !params || Object.keys(params).length === 0;

    if (isCacheable && unfilteredCache && unfilteredCache.expiresAt > Date.now()) {
      return unfilteredCache.data;
    }

    const response = await apiClient.get<PropertyType[]>(
      BASE_URL,
      { params }
    );
    // API returns array directly, not wrapped
    const data = response.data;

    if (isCacheable) {
      unfilteredCache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    }

    return data;
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
    invalidateCache();
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
    invalidateCache();
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
    invalidateCache();
    return response.data;
  },
};