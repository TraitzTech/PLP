import apiClient from "@/lib/apiClient";
import type { AdminProperty } from "./types";

export interface SavedPropertiesResponse {
  status: string;
  data: AdminProperty[];
}

export interface SavedPropertyActionResponse {
  status: string;
  message: string;
}

export const savedPropertyService = {
  async getSavedProperties(): Promise<SavedPropertiesResponse> {
    const response = await apiClient.get<SavedPropertiesResponse>("/saved-listings");
    return response.data;
  },

  async saveProperty(listingId: number): Promise<SavedPropertyActionResponse> {
    const response = await apiClient.post<SavedPropertyActionResponse>(`/saved-listings/${listingId}`);
    return response.data;
  },

  async removeSavedProperty(listingId: number): Promise<SavedPropertyActionResponse> {
    const response = await apiClient.delete<SavedPropertyActionResponse>(`/saved-listings/${listingId}`);
    return response.data;
  },

  async isSaved(listingId: number): Promise<boolean> {
    const response = await apiClient.get<{ status: string; data: { is_saved: boolean } }>(`/saved-listings/${listingId}/exists`);
    return Boolean(response.data?.data?.is_saved);
  },
};
