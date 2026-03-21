import apiClient from '@/lib/apiClient';

export interface HomepageFeaturedAgent {
  id: number;
  name: string;
  city: string | null;
  profile_photo: string | null;
  listings_count: number;
}

export interface HomepagePortalNumbers {
  properties_listed: number;
  verified_agents: number;
  cities_covered: number;
  monthly_visitors: number;
}

export interface HomepageProperty {
  id: number;
  title: string;
  city?: string;
  region?: string;
  price?: number;
  discount_price?: number;
  currency?: string;
  created_at?: string;
  images?: Array<{ id: number; image_path?: string; image_url?: string }>;
}

export interface HomepagePayload {
  why_use_points: string[];
  cities_covered: string[];
  portal_numbers: HomepagePortalNumbers;
  featured_agent: HomepageFeaturedAgent | null;
  recent_properties: HomepageProperty[];
}

export interface HomepageResponse {
  status: string;
  data: HomepagePayload;
}

export const homepageService = {
  async getHomepageData(): Promise<HomepagePayload> {
    const response = await apiClient.get<HomepageResponse>('/public/homepage');
    return response.data.data;
  },
};
