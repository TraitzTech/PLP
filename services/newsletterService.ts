import apiClient from "@/lib/apiClient";

export interface NewsletterSubscribeRequest {
  email: string;
  name?: string;
}

export interface NewsletterResponse {
  status: "success" | "info" | "error";
  message: string;
  data?: {
    email: string;
    subscribed_at: string;
  };
}

export interface NewsletterStatusResponse {
  status: "success";
  subscribed: boolean;
  subscribed_at?: string;
}

export const newsletterService = {
  /**
   * Subscribe to the newsletter
   */
  async subscribe(data: NewsletterSubscribeRequest): Promise<NewsletterResponse> {
    try {
      const response = await apiClient.post<NewsletterResponse>("/newsletter/subscribe", data, {
        timeout: 12000,
      });
      return response.data;
    } catch (error: any) {
      if (error?.code === 'ECONNABORTED' || String(error?.message || '').toLowerCase().includes('timeout')) {
        throw {
          ...error,
          message: 'Request timed out. Please try subscribing again.',
        };
      }
      throw error;
    }
  },

  /**
   * Check subscription status by email
   */
  async checkStatus(email: string): Promise<NewsletterStatusResponse> {
    const response = await apiClient.post<NewsletterStatusResponse>("/newsletter/status", { email });
    return response.data;
  },

  /**
   * Get the number of times popup has been shown
   */
  getPopupSeenCount(): number {
    if (typeof window === "undefined") return 999;
    return parseInt(window.localStorage.getItem("plp_newsletter_popup_seen_count") || "0", 10);
  },

  /**
   * Check if visitor has seen the newsletter popup enough times
   * Show popup up to 3 times before stopping
   */
  hasSeenPopup(): boolean {
    if (typeof window === "undefined") return true;
    return this.getPopupSeenCount() >= 3;
  },

  /**
   * Mark that visitor has seen the newsletter popup (increment count)
   */
  markPopupAsSeen(): void {
    if (typeof window === "undefined") return;
    const count = this.getPopupSeenCount() + 1;
    window.localStorage.setItem("plp_newsletter_popup_seen_count", count.toString());
  },

  /**
   * Check if user has already subscribed (stored locally)
   */
  isSubscribedLocally(): boolean {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("plp_newsletter_subscribed") === "true";
  },

  /**
   * Mark user as subscribed locally
   */
  markAsSubscribed(): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("plp_newsletter_subscribed", "true");
  },

  /**
   * Get the number of times visitor has been on the site
   */
  getVisitCount(): number {
    if (typeof window === "undefined") return 0;
    return parseInt(window.localStorage.getItem("plp_visit_count") || "0", 10);
  },

  /**
   * Increment and return visit count
   */
  incrementVisitCount(): number {
    if (typeof window === "undefined") return 0;
    const count = this.getVisitCount() + 1;
    window.localStorage.setItem("plp_visit_count", count.toString());
    return count;
  },

  /**
   * Check if popup should be shown
   * Show popup on 2nd visit if not seen before and not subscribed
   */
  shouldShowPopup(): boolean {
    if (typeof window === "undefined") return false;
    const visitCount = this.getVisitCount();
    const hasSeenPopup = this.hasSeenPopup();
    const isSubscribed = this.isSubscribedLocally();
    
    // Show popup on 1st+ visit, up to 3 times, if not subscribed
    return visitCount >= 1 && !hasSeenPopup && !isSubscribed;
  },
};
