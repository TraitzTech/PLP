import apiClient from '@/lib/apiClient';

export type SearchQueryPayload = {
  location?: string;
  type?: string;
  purpose?: string;
  priceMin?: number;
  priceMax?: number;
};

export type PopularSearchItem = {
  label: string;
  link: string;
  count: number;
  last_searched_at?: string;
};

export const searchAnalyticsService = {
  async logSearch(payload: SearchQueryPayload): Promise<void> {
    await apiClient.post('/search-queries/log', payload);
  },

  async getPopularSearches(limit = 5): Promise<PopularSearchItem[]> {
    const response = await apiClient.get('/public/popular-searches', {
      params: { limit },
    });

    return Array.isArray(response?.data?.data) ? response.data.data : [];
  },
};
