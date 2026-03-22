import apiClient from '@/lib/apiClient';

export interface PublicSettings {
  site_name?: string;
  site_title?: string;
  site_description?: string;
  site_email?: string;
  site_phone?: string;
  site_address?: string;
  support_email?: string;
  contact_email?: string;
  support_phone_secondary?: string;
  support_whatsapp_phone?: string;
  default_language?: string;
  default_currency?: string;
  maintenance_mode?: boolean;
  customer_booking_free_mode?: boolean;
  customer_platform_access_fee_enabled?: boolean;
  platform_fee_xaf?: number;
  launch_enforce_city_scope?: boolean;
  launch_rollout_cities?: string[];
  launch_rentals_only?: boolean;
  launch_hotel_enabled?: boolean;
  launch_sales_enabled?: boolean;
  about_mission_title?: string;
  about_mission_description?: string;
  about_vision_title?: string;
  about_vision_description?: string;
  about_journey_title?: string;
  about_journey_items?: Array<{ year?: string; title?: string; description?: string }>;
  about_team_title?: string;
  about_team_description?: string;
  about_team_members?: Array<{
    name?: string;
    role?: string;
    image?: string;
    description?: string;
    link?: string;
  }>;
  about_stats_items?: Array<{ label?: string; number?: string }>;
  about_cta_title?: string;
  about_cta_description?: string;
  about_cta_button_text?: string;
  about_cta_button_link?: string;
  platform_how_steps_title?: string;
  platform_how_steps_description?: string;
  platform_how_steps_items?: Array<{ accent?: string; title?: string; description?: string }>;
  platform_popular_searches_title?: string;
  platform_popular_searches_items?: Array<{ label?: string; link?: string }>;
  enable_virtual_tours?: boolean;
  enable_landlord_listing?: boolean;
  [key: string]: any;
}

class SettingsService {
  private static cache: PublicSettings = {};
  private static cacheTime: number = 0;
  private static cacheIsComplete: boolean = false;
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch public settings from the backend
   * Supports optional filtering by specific keys
   */
  async getPublicSettings(keys?: string[]): Promise<PublicSettings> {
    const now = Date.now();
    const isCacheFresh = now - SettingsService.cacheTime < SettingsService.CACHE_DURATION;

    // Use cache only when it safely contains what the caller asked for.
    if (isCacheFresh) {
      if (!keys || keys.length === 0) {
        if (SettingsService.cacheIsComplete) {
          return SettingsService.cache;
        }
      } else {
        const hasAllRequestedKeys = keys.every((key) =>
          Object.prototype.hasOwnProperty.call(SettingsService.cache, key)
        );

        if (hasAllRequestedKeys) {
          return SettingsService.cache;
        }
      }
    }

    try {
      const params = new URLSearchParams();
      if (keys && keys.length > 0) {
        params.append('keys', keys.join(','));
      }

      const response = await apiClient.get(`/public/settings${params.toString() ? '?' + params : ''}`);

      if (response.data && response.data.data) {
        const settings = response.data.data as PublicSettings;

        // Key-filtered requests return partial payloads, so merge into cache.
        if (keys && keys.length > 0) {
          SettingsService.cache = { ...SettingsService.cache, ...settings };
        } else {
          SettingsService.cache = settings;
          SettingsService.cacheIsComplete = true;
        }

        SettingsService.cacheTime = now;
        return SettingsService.cache;
      }

      return SettingsService.cache;
    } catch (error) {
      console.error('Failed to fetch public settings:', error);

      // Fall back to whatever cache is available to avoid sudden blank UI.
      if (keys && keys.length > 0) {
        return SettingsService.cache;
      }

      return SettingsService.cache;
    }
  }

  /**
   * Get a specific setting value
   */
  async getSettingValue<T = any>(key: string): Promise<T | null> {
    const settings = await this.getPublicSettings([key]);
    return (settings[key] as T) || null;
  }

  /**
   * Check if maintenance mode is enabled
   */
  async isMaintenanceModeEnabled(): Promise<boolean> {
    const maintenanceMode = await this.getSettingValue<boolean>('maintenance_mode');
    return maintenanceMode === true;
  }

  /**
   * Get launch rollout cities
   */
  async getLaunchRolloutCities(): Promise<string[]> {
    const cities = await this.getSettingValue<string[]>('launch_rollout_cities');
    return Array.isArray(cities) ? cities : [];
  }

  /**
   * Clear cache (useful after settings update)
   */
  clearCache(): void {
    SettingsService.cache = {};
    SettingsService.cacheTime = 0;
    SettingsService.cacheIsComplete = false;
  }
}

export const settingsService = new SettingsService();
