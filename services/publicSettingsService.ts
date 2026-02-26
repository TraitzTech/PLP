import apiClient from '@/lib/apiClient';

export interface PublicLegalResponse {
  status: string;
  data: {
    terms: {
      content_en: string;
      content_fr: string;
      last_updated: string;
    };
    privacy: {
      content_en: string;
      content_fr: string;
      last_updated: string;
    };
    contact_email: string;
  };
}

export interface PublicSettingsResponse {
  status: string;
  data: Record<string, unknown>;
}

export const publicSettingsService = {
  async getLegalContent(): Promise<PublicLegalResponse> {
    const { data } = await apiClient.get<PublicLegalResponse>('/public/legal');
    return data;
  },

  async getSettings(keys?: string[]): Promise<PublicSettingsResponse> {
    const params = keys?.length ? { keys: keys.join(',') } : undefined;
    const { data } = await apiClient.get<PublicSettingsResponse>('/public/settings', { params });
    return data;
  },
};

