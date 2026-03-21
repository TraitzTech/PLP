import apiClient from "@/lib/apiClient";

// Types
export interface Booking {
  id: number;
  user_id: number | null;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  is_guest_booking?: boolean;
  listing_id: number;
  check_in_date: string;
  check_out_date: string;
  guest_count: number | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_price: number;
  currency: string;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  can_chat_with_agent?: boolean;
  requires_platform_fee?: boolean;
  special_requests: string | null;
  discount_code: string | null;
  created_at: string;
  updated_at: string;
  listing?: {
    id: number;
    title: string;
    city?: string;
    region?: string;
    price?: number;
    discount_price?: number;
    images?: Array<{ id: number; image_url?: string; image_path?: string; is_featured?: boolean }>;
    property_type?: { id: number; name: string };
    agent?: {
      id: number;
      user?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
      };
    };
  };
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
}

export interface CreateBookingRequest {
  listing_id: number;
  check_in_date: string;
  check_out_date: string;
  guest_count?: number;
  special_requests?: string;
  discount_code?: string;
  payment_id?: number;
}

export interface GuestBookingRequest {
  listing_id: number;
  check_in_date: string;
  check_out_date: string;
  guest_count?: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_requests?: string;
  discount_code?: string;
  payment_id?: number;
}

export interface BookingResponse {
  status: string;
  message: string;
  data: Booking;
}

export interface BookingsListResponse {
  status: string;
  count?: number;
  data: Booking[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface BookingStatistics {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  bookings_this_month?: number;
  revenue_this_month?: number;
}

export const bookingService = {
  /**
   * Create a new booking (authenticated user)
   */
  async createBooking(data: CreateBookingRequest): Promise<BookingResponse> {
    const response = await apiClient.post<BookingResponse>('/bookings', data);
    return response.data;
  },

  /**
   * Create a booking as guest (no authentication required)
   */
  async createGuestBooking(data: GuestBookingRequest): Promise<BookingResponse> {
    const response = await apiClient.post<BookingResponse>('/bookings/guest', data);
    return response.data;
  },

  /**
   * Get all bookings for current user
   */
  async getMyBookings(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
  }): Promise<BookingsListResponse> {
    const response = await apiClient.get<BookingsListResponse>('/bookings', { params });
    return response.data;
  },

  /**
   * Delete a booking
   */
  async deleteBooking(id: number): Promise<{ status: string; message: string }> {
    const response = await apiClient.delete<{ status: string; message: string }>(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Get a specific booking
   */
  async getBooking(id: number): Promise<BookingResponse> {
    const response = await apiClient.get<BookingResponse>(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Update a booking
   */
  async updateBooking(id: number, data: Partial<CreateBookingRequest>): Promise<BookingResponse> {
    const response = await apiClient.put<BookingResponse>(`/bookings/${id}`, data);
    return response.data;
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(id: number): Promise<BookingResponse> {
    const response = await apiClient.patch<BookingResponse>(`/bookings/${id}/cancel`);
    return response.data;
  },

  /**
   * Calculate booking price (client-side helper)
   */
  calculatePrice(pricePerNight: number, checkIn: Date, checkOut: Date): { nights: number; total: number } {
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return {
      nights,
      total: nights * pricePerNight,
    };
  },
};

// Agent booking service
export const agentBookingService = {
  /**
   * Get all bookings for agent's properties
   */
  async getBookings(params?: {
    status?: string;
    payment_status?: string;
    listing_id?: number;
    from_date?: string;
    to_date?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<BookingsListResponse> {
    const response = await apiClient.get<BookingsListResponse>('/agent/bookings', { params });
    return response.data;
  },

  /**
   * Get a specific booking
   */
  async getBooking(id: number): Promise<BookingResponse> {
    const response = await apiClient.get<BookingResponse>(`/agent/bookings/${id}`);
    return response.data;
  },

  /**
   * Confirm a pending booking
   */
  async confirmBooking(id: number): Promise<BookingResponse> {
    const response = await apiClient.patch<BookingResponse>(`/agent/bookings/${id}/confirm`);
    return response.data;
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(id: number, reason?: string): Promise<BookingResponse> {
    const response = await apiClient.patch<BookingResponse>(`/agent/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Mark a booking as completed
   */
  async completeBooking(id: number): Promise<BookingResponse> {
    const response = await apiClient.patch<BookingResponse>(`/agent/bookings/${id}/complete`);
    return response.data;
  },

  /**
   * Get booking statistics
   */
  async getStatistics(): Promise<{ status: string; data: BookingStatistics }> {
    const response = await apiClient.get<{ status: string; data: BookingStatistics }>('/agent/bookings/statistics');
    return response.data;
  },
};

// Admin booking service
export const adminBookingService = {
  /**
   * Get all bookings (admin)
   */
  async getBookings(params?: {
    status?: string;
    payment_status?: string;
    user_id?: number;
    listing_id?: number;
    agent_id?: number;
    from_date?: string;
    to_date?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<BookingsListResponse> {
    const response = await apiClient.get<BookingsListResponse>('/admin/bookings', { params });
    return response.data;
  },

  /**
   * Get a specific booking
   */
  async getBooking(id: number): Promise<BookingResponse> {
    const response = await apiClient.get<BookingResponse>(`/admin/bookings/${id}`);
    return response.data;
  },

  /**
   * Create a new booking (admin)
   */
  async createBooking(data: {
    user_id: number;
    listing_id: number;
    check_in_date: string;
    check_out_date: string;
    guest_count: number;
    total_price: number;
    currency?: string;
    status?: string;
    payment_status?: string;
    special_requests?: string;
    discount_code?: string;
  }): Promise<BookingResponse> {
    const response = await apiClient.post<BookingResponse>('/admin/bookings', data);
    return response.data;
  },

  /**
   * Update a booking
   */
  async updateBooking(id: number, data: Partial<Booking>): Promise<BookingResponse> {
    const response = await apiClient.put<BookingResponse>(`/admin/bookings/${id}`, data);
    return response.data;
  },

  /**
   * Update booking status
   */
  async updateStatus(id: number, status: string, reason?: string): Promise<BookingResponse> {
    const response = await apiClient.patch<BookingResponse>(`/admin/bookings/${id}/status`, { status, reason });
    return response.data;
  },

  /**
   * Update payment status
   */
  async updatePaymentStatus(id: number, payment_status: string): Promise<BookingResponse> {
    const response = await apiClient.patch<BookingResponse>(`/admin/bookings/${id}/payment-status`, { payment_status });
    return response.data;
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(id: number, reason?: string): Promise<BookingResponse> {
    const response = await apiClient.patch<BookingResponse>(`/admin/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Delete a booking
   */
  async deleteBooking(id: number): Promise<{ status: string; message: string }> {
    const response = await apiClient.delete<{ status: string; message: string }>(`/admin/bookings/${id}`);
    return response.data;
  },

  /**
   * Get booking statistics
   */
  async getStatistics(): Promise<{ status: string; data: BookingStatistics }> {
    const response = await apiClient.get<{ status: string; data: BookingStatistics }>('/admin/bookings/statistics');
    return response.data;
  },
};

export default bookingService;
