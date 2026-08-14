import apiClient from "@/lib/apiClient";
import type {
  Pao,
  AdminPaoCreateRequest,
  AdminPaoUpdateRequest,
  PaoStatus,
  VerificationStatus,
  PaoEarning,
  PaoEarningsSummary,
  PaoProperty,
} from "./types";

const BASE_URL = "/manage-paos";

/**
 * Convert request object to FormData for multipart/form-data
 */
function createFormData(data: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}

export const adminPaoService = {
  // ---- PAO account management ----
  async getAllPaos(): Promise<Pao[]> {
    const { data } = await apiClient.get<{ status: string; data: Pao[] }>(BASE_URL);
    return data.data;
  },

  async getPao(id: string | number): Promise<Pao> {
    const { data } = await apiClient.get<{ status: string; data: Pao }>(`${BASE_URL}/${id}`);
    return data.data;
  },

  async createPao(payload: AdminPaoCreateRequest): Promise<Pao> {
    const formData = createFormData(payload);
    const { data } = await apiClient.post<{ status: string; message: string; data: Pao }>(
      BASE_URL,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  async updatePao(id: string | number, payload: AdminPaoUpdateRequest): Promise<Pao> {
    const formData = createFormData(payload);
    formData.append("_method", "PUT");
    const { data } = await apiClient.post<{ status: string; data: Pao }>(
      `${BASE_URL}/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  async updatePaoStatus(id: string | number, status: PaoStatus): Promise<Pao> {
    const { data } = await apiClient.patch<{ status: string; data: Pao }>(
      `${BASE_URL}/${id}/status`,
      { status }
    );
    return data.data;
  },

  async deletePao(id: string | number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  // ---- Property verification queue ----
  async getVerificationQueue(params?: { verification_status?: string }): Promise<PaoProperty[]> {
    const { data } = await apiClient.get<{ status: string; data: PaoProperty[] }>(
      "/admin/pao-verifications",
      { params }
    );
    return data.data;
  },

  async getVerificationDetail(id: string | number): Promise<PaoProperty> {
    const { data } = await apiClient.get<{ status: string; data: PaoProperty }>(
      `/admin/pao-verifications/${id}`
    );
    return data.data;
  },

  async updateVerificationStatus(
    id: string | number,
    verification_status: VerificationStatus,
    notes?: string
  ): Promise<PaoProperty> {
    const { data } = await apiClient.patch<{ status: string; data: PaoProperty }>(
      `/admin/pao-verifications/${id}/status`,
      { verification_status, notes }
    );
    return data.data;
  },

  // ---- Earnings management ----
  async getAllEarnings(params?: {
    pao_id?: string | number;
    status?: string;
    type?: string;
  }): Promise<{ earnings: PaoEarning[]; summary: PaoEarningsSummary }> {
    const { data } = await apiClient.get<{
      status: string;
      data: { earnings: PaoEarning[]; summary: PaoEarningsSummary };
    }>("/admin/pao-earnings", { params });
    return data.data;
  },

  async awardOtherBonus(pao_id: number, amount: number, note: string): Promise<PaoEarning> {
    const { data } = await apiClient.post<{ status: string; data: PaoEarning }>(
      "/admin/pao-earnings/other-bonus",
      { pao_id, amount, note }
    );
    return data.data;
  },

  async markEarningsPaid(earning_ids: number[]): Promise<PaoEarning[]> {
    const { data } = await apiClient.post<{ status: string; data: PaoEarning[] }>(
      "/admin/pao-earnings/mark-paid",
      { earning_ids }
    );
    return data.data;
  },
};
