import apiClient from "@/lib/apiClient";
import type {
  Facility,
  FacilityCreateRequest,
  FacilityCreateResponse,
  FacilityUpdateResponse,
  FacilityDeleteResponse,
  FacilityNotFoundResponse,
} from "./types";

export const facilitiesService = {
  async index(): Promise<any> {
    const { data } = await apiClient.get("/facilities");
    return data;
  },

  async create(payload: FacilityCreateRequest): Promise<FacilityCreateResponse> {
    const { data } = await apiClient.post<FacilityCreateResponse>("/facilities", payload);
    return data;
  },

  async show(id: string | number): Promise<{ status: "success"; data: any } | FacilityNotFoundResponse> {
    const { data } = await apiClient.get(`/facilities/${id}`);
    return data;
  },

  async update(id: string | number, payload: Partial<Facility>): Promise<FacilityUpdateResponse | FacilityNotFoundResponse> {
    const { data } = await apiClient.put(`/facilities/${id}`, payload);
    return data;
  },

  async destroy(id: string | number): Promise<FacilityDeleteResponse | FacilityNotFoundResponse> {
    const { data } = await apiClient.delete(`/facilities/${id}`);
    return data;
  },
};
