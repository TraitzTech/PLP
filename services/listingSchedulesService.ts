import apiClient from "@/lib/apiClient";
import type {
  ListingSchedule,
  ListingScheduleRequest,
  ListingScheduleCreateResponse,
  ListingScheduleUpdateResponse,
  ListingScheduleNotFoundResponse,
  ListingScheduleDeleteResponse204,
} from "./types";

export const listingSchedulesService = {
  async index(): Promise<any> {
    const { data } = await apiClient.get("/listing-schedules");
    return data;
  },

  async create(payload: ListingScheduleRequest): Promise<ListingScheduleCreateResponse> {
    const { data } = await apiClient.post<ListingScheduleCreateResponse>("/listing-schedules", payload);
    return data;
  },

  async show(id: string | number): Promise<any> {
    const { data } = await apiClient.get(`/listing-schedules/${id}`);
    return data;
  },

  async update(id: string | number, payload: ListingScheduleRequest): Promise<ListingScheduleUpdateResponse | ListingScheduleNotFoundResponse> {
    const { data } = await apiClient.put(`/listing-schedules/${id}`, payload);
    return data;
  },

  async destroy(id: string | number): Promise<ListingScheduleDeleteResponse204 | ListingScheduleNotFoundResponse> {
    const response = await apiClient.delete(`/listing-schedules/${id}`);
    // DELETE returns 204 No Content when successful
    return response.data;
  },
};
