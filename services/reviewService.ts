import apiClient from "@/lib/apiClient";

// Types
export interface Review {
  id: number;
  user_id: number | null;
  guest_name?: string;
  guest_email?: string;
  is_guest_review?: boolean;
  listing_id: number;
  booking_id: number | null;
  rating: number;
  comment: string;
  is_approved: boolean;
  approved_at: string | null;
  approved_by: number | null;
  admin_notes: string | null;
  owner_response: string | null;
  owner_response_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
  };
  listing?: {
    id: number;
    title: string;
    city?: string;
    region?: string;
  };
}

export interface CreateReviewRequest {
  listing_id: number;
  booking_id?: number;
  rating: number;
  comment: string;
}

export interface GuestReviewRequest {
  listing_id: number;
  rating: number;
  comment: string;
  guest_name: string;
  guest_email: string;
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  data: Review;
}

export interface ReviewsListResponse {
  success: boolean;
  data: Review[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    average_rating?: number;
    rating_distribution?: Record<number, number>;
  };
}

export interface ReviewStatistics {
  total_reviews: number;
  pending_reviews: number;
  approved_reviews: number;
  average_rating: number;
  reviews_today: number;
  reviews_this_week: number;
  reviews_this_month: number;
  rating_distribution: Record<number, number>;
}

export const reviewService = {
  /**
   * Get approved reviews for a listing (public)
   */
  async getListingReviews(listingId: number, params?: { per_page?: number; page?: number }): Promise<ReviewsListResponse> {
    const response = await apiClient.get<ReviewsListResponse>(`/listings/${listingId}/reviews`, { params });
    return response.data;
  },

  /**
   * Get current user's reviews
   */
  async getMyReviews(params?: { per_page?: number; page?: number }): Promise<ReviewsListResponse> {
    const response = await apiClient.get<ReviewsListResponse>('/reviews/my-reviews', { params });
    return response.data;
  },

  /**
   * Create a new review (authenticated user)
   */
  async createReview(data: CreateReviewRequest): Promise<ReviewResponse> {
    const response = await apiClient.post<ReviewResponse>('/reviews', data);
    return response.data;
  },

  /**
   * Create a review as guest (no authentication required)
   */
  async createGuestReview(data: GuestReviewRequest): Promise<ReviewResponse> {
    const response = await apiClient.post<ReviewResponse>('/reviews/guest', data);
    return response.data;
  },

  /**
   * Update a review (only if not approved)
   */
  async updateReview(id: number, data: Partial<CreateReviewRequest>): Promise<ReviewResponse> {
    const response = await apiClient.put<ReviewResponse>(`/reviews/${id}`, data);
    return response.data;
  },

  /**
   * Delete a review (only if not approved)
   */
  async deleteReview(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/reviews/${id}`);
    return response.data;
  },
};

// Admin review service
export const adminReviewService = {
  /**
   * Get all reviews with filters (admin)
   */
  async getAllReviews(params?: {
    per_page?: number;
    page?: number;
    is_approved?: boolean;
    listing_id?: number;
    user_id?: number;
    rating?: number;
    min_rating?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<ReviewsListResponse & { statistics: ReviewStatistics }> {
    const response = await apiClient.get<ReviewsListResponse & { statistics: ReviewStatistics }>('/admin/reviews', { params });
    return response.data;
  },

  /**
   * Get a specific review (admin)
   */
  async getReview(id: number): Promise<{ success: boolean; data: Review }> {
    const response = await apiClient.get<{ success: boolean; data: Review }>(`/admin/reviews/${id}`);
    return response.data;
  },

  /**
   * Approve a review
   */
  async approveReview(id: number, adminNotes?: string): Promise<ReviewResponse> {
    const response = await apiClient.patch<ReviewResponse>(`/admin/reviews/${id}/approve`, { admin_notes: adminNotes });
    return response.data;
  },

  /**
   * Reject a review
   */
  async rejectReview(id: number, reason?: string): Promise<ReviewResponse> {
    const response = await apiClient.patch<ReviewResponse>(`/admin/reviews/${id}/reject`, { reason });
    return response.data;
  },

  /**
   * Update admin notes
   */
  async updateNotes(id: number, adminNotes: string): Promise<ReviewResponse> {
    const response = await apiClient.patch<ReviewResponse>(`/admin/reviews/${id}/notes`, { admin_notes: adminNotes });
    return response.data;
  },

  /**
   * Delete a review (admin)
   */
  async deleteReview(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/admin/reviews/${id}`);
    return response.data;
  },

  /**
   * Get review statistics
   */
  async getStatistics(): Promise<{ success: boolean; data: ReviewStatistics }> {
    const response = await apiClient.get<{ success: boolean; data: ReviewStatistics }>('/admin/reviews/statistics');
    return response.data;
  },
};

export default reviewService;
