import apiClient from "@/lib/apiClient";
import type {
  PropertyType,
  PropertyTypeCreateRequest,
  PropertyTypeCreateResponse,
  PropertyTypeUpdateResponse,
  PropertyTypeDeleteResponse204,
  PropertyTypeNotFoundResponse,
} from "./types";

export const propertyTypesService = {
  async index(): Promise<any> {
    const { data } = await apiClient.get("/property-types");
    return data;
  },

  async create(payload: PropertyTypeCreateRequest): Promise<PropertyTypeCreateResponse> {
    const { data } = await apiClient.post<PropertyTypeCreateResponse>("/property-types", payload);
    return data;
  },

  async show(id: string | number): Promise<{ status: "success"; data: any } | PropertyTypeNotFoundResponse> {
    const { data } = await apiClient.get(`/property-types/${id}`);
    return data;
  },

  async update(id: string | number, payload: Partial<PropertyType>): Promise<PropertyTypeUpdateResponse | PropertyTypeNotFoundResponse> {
    const { data } = await apiClient.put(`/property-types/${id}`, payload);
    return data;
  },

  async destroy(id: string | number): Promise<PropertyTypeDeleteResponse204 | PropertyTypeNotFoundResponse> {
    const response = await apiClient.delete(`/property-types/${id}`);
    // DELETE returns 204 No Content when successful
    return response.data;
  },
};
