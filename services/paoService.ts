import apiClient from "@/lib/apiClient";
import type {
  PaoDashboardStats,
  Landlord,
  LandlordRequest,
  PaoProperty,
  PaoPropertyRequest,
  PaoTask,
  PaoTaskRequest,
  PaoVisit,
  PaoVisitRequest,
  PaoEarning,
  PaoEarningsSummary,
  ListingImageCreateResponse,
} from "./types";

/**
 * Convert request object to FormData for multipart/form-data
 */
function createFormData(data: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item instanceof File) {
          formData.append(`${key}[]`, item);
        } else {
          formData.append(`${key}[]`, String(item));
        }
      });
    } else if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}

export const paoService = {
  // ---- Dashboard ----
  async getDashboardStats(): Promise<PaoDashboardStats> {
    const { data } = await apiClient.get<{ status: string; data: PaoDashboardStats }>(
      "/pao/dashboard/stats"
    );
    return data.data;
  },

  // ---- Landlords ----
  async getLandlords(params?: { search?: string }): Promise<Landlord[]> {
    const { data } = await apiClient.get<{ status: string; data: Landlord[] }>(
      "/pao/landlords",
      { params }
    );
    return data.data;
  },

  async getLandlord(id: string | number): Promise<Landlord> {
    const { data } = await apiClient.get<{ status: string; data: Landlord }>(
      `/pao/landlords/${id}`
    );
    return data.data;
  },

  async createLandlord(payload: LandlordRequest): Promise<Landlord> {
    const { data } = await apiClient.post<{ status: string; data: Landlord }>(
      "/pao/landlords",
      payload
    );
    return data.data;
  },

  async updateLandlord(id: string | number, payload: Partial<LandlordRequest>): Promise<Landlord> {
    const { data } = await apiClient.put<{ status: string; data: Landlord }>(
      `/pao/landlords/${id}`,
      payload
    );
    return data.data;
  },

  async deleteLandlord(id: string | number): Promise<void> {
    await apiClient.delete(`/pao/landlords/${id}`);
  },

  // ---- Properties ----
  async getProperties(params?: { verification_status?: string }): Promise<PaoProperty[]> {
    const { data } = await apiClient.get<{ status: string; data: PaoProperty[] }>(
      "/pao/properties",
      { params }
    );
    return data.data;
  },

  async getProperty(id: string | number): Promise<PaoProperty> {
    const { data } = await apiClient.get<{ status: string; data: PaoProperty }>(
      `/pao/properties/${id}`
    );
    return data.data;
  },

  async createProperty(payload: PaoPropertyRequest): Promise<PaoProperty> {
    const { data } = await apiClient.post<{ status: string; data: PaoProperty }>(
      "/pao/properties",
      payload
    );
    return data.data;
  },

  async updateProperty(id: string | number, payload: Partial<PaoPropertyRequest>): Promise<PaoProperty> {
    const { data } = await apiClient.put<{ status: string; data: PaoProperty }>(
      `/pao/properties/${id}`,
      payload
    );
    return data.data;
  },

  async uploadPropertyImages(listingId: string | number, images: File[]): Promise<ListingImageCreateResponse> {
    const formData = new FormData();
    images.forEach((image) => formData.append("images[]", image));

    const { data } = await apiClient.post<ListingImageCreateResponse>(
      `/pao/properties/${listingId}/images`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  // ---- Tasks ----
  async getTasks(params?: { status?: string; today_only?: boolean }): Promise<PaoTask[]> {
    const { data } = await apiClient.get<{ status: string; data: PaoTask[] }>("/pao/tasks", {
      params,
    });
    return data.data;
  },

  async createTask(payload: PaoTaskRequest): Promise<PaoTask> {
    const { data } = await apiClient.post<{ status: string; data: PaoTask }>(
      "/pao/tasks",
      payload
    );
    return data.data;
  },

  async updateTask(id: string | number, payload: Partial<PaoTaskRequest>): Promise<PaoTask> {
    const { data } = await apiClient.put<{ status: string; data: PaoTask }>(
      `/pao/tasks/${id}`,
      payload
    );
    return data.data;
  },

  async completeTask(id: string | number): Promise<PaoTask> {
    const { data } = await apiClient.patch<{ status: string; data: PaoTask }>(
      `/pao/tasks/${id}/complete`
    );
    return data.data;
  },

  async deleteTask(id: string | number): Promise<void> {
    await apiClient.delete(`/pao/tasks/${id}`);
  },

  // ---- Visits ----
  async getVisits(): Promise<PaoVisit[]> {
    const { data } = await apiClient.get<{ status: string; data: PaoVisit[] }>("/pao/visits");
    return data.data;
  },

  async getVisit(id: string | number): Promise<PaoVisit> {
    const { data } = await apiClient.get<{ status: string; data: PaoVisit }>(`/pao/visits/${id}`);
    return data.data;
  },

  async recordVisit(payload: PaoVisitRequest): Promise<PaoVisit> {
    const formData = createFormData(payload);
    const { data } = await apiClient.post<{ status: string; data: PaoVisit }>(
      "/pao/visits",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  // ---- Earnings ----
  async getEarnings(params?: { month?: string }): Promise<{ earnings: PaoEarning[]; summary: PaoEarningsSummary }> {
    const { data } = await apiClient.get<{
      status: string;
      data: { earnings: PaoEarning[]; summary: PaoEarningsSummary };
    }>("/pao/earnings", { params });
    return data.data;
  },
};
