import apiClient from "@/lib/apiClient";
import type {
  Listing,
  ListingCreateRequest,
  ListingCreateResponse,
  ListingDeleteResponse,
} from "./types";

export const listingsService = {
  async index(): Promise<{ data: any } | string | any> {
    const { data } = await apiClient.get("/listings");
    return data;
  },

  async create(payload: ListingCreateRequest): Promise<ListingCreateResponse> {
    const { data } = await apiClient.post<ListingCreateResponse>("/listings", payload);
    return data;
  },

  async show(listingId: number): Promise<any> {
    const { data } = await apiClient.get(`/listings/${listingId}`);
    return data;
  },

  async update(listingId: number, payload: Partial<Listing>): Promise<{ status: "success"; message: "Listing updated successfully"; data: any }> {
    const { data } = await apiClient.put(`/listings/${listingId}`, payload);
    return data;
  },

  async destroy(listingId: number): Promise<ListingDeleteResponse> {
    const { data } = await apiClient.delete(`/listings/${listingId}`);
    return data;
  },
};
