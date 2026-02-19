import apiClient from "@/lib/apiClient";

// Types
export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  action_url: string | null;
  data: Record<string, any> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NotificationType = 
  | 'review'
  | 'booking'
  | 'property'
  | 'registration'
  | 'message'
  | 'system'
  | 'agent_approval'
  | 'property_approval';

export interface NotificationsResponse {
  status: string;
  data: {
    data: Notification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface UnreadCountResponse {
  status: string;
  data: {
    unread_count: number;
  };
}

export interface RecentNotificationsResponse {
  status: string;
  data: {
    notifications: Notification[];
    unread_count: number;
  };
}

export interface NotificationFilters {
  per_page?: number;
  page?: number;
  type?: NotificationType;
  unread_only?: boolean;
}

export const notificationService = {
  /**
   * Get all notifications with optional filters
   */
  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationsResponse> {
    const params = new URLSearchParams();
    
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.type) params.append('type', filters.type);
    if (filters.unread_only) params.append('unread_only', 'true');
    
    const { data } = await apiClient.get<NotificationsResponse>(
      `/notifications${params.toString() ? `?${params.toString()}` : ''}`
    );
    return data;
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const { data } = await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
    return data;
  },

  /**
   * Get recent notifications (for dropdown preview)
   */
  async getRecentNotifications(limit: number = 5): Promise<RecentNotificationsResponse> {
    const { data } = await apiClient.get<RecentNotificationsResponse>(
      `/notifications/recent?limit=${limit}`
    );
    return data;
  },

  /**
   * Get a specific notification
   */
  async getNotification(id: number): Promise<{ status: string; data: Notification }> {
    const { data } = await apiClient.get<{ status: string; data: Notification }>(
      `/notifications/${id}`
    );
    return data;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: number): Promise<{ status: string; message: string; data: Notification }> {
    const { data } = await apiClient.patch<{ status: string; message: string; data: Notification }>(
      `/notifications/${id}/read`
    );
    return data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ status: string; message: string }> {
    const { data } = await apiClient.post<{ status: string; message: string }>(
      '/notifications/mark-all-read'
    );
    return data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: number): Promise<{ status: string; message: string }> {
    const { data } = await apiClient.delete<{ status: string; message: string }>(
      `/notifications/${id}`
    );
    return data;
  },

  /**
   * Delete all read notifications
   */
  async deleteReadNotifications(): Promise<{ status: string; message: string }> {
    const { data } = await apiClient.delete<{ status: string; message: string }>(
      '/notifications/read'
    );
    return data;
  },

  /**
   * Get notification type icon name
   */
  getNotificationIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      review: 'Star',
      booking: 'Calendar',
      property: 'Building2',
      registration: 'UserPlus',
      message: 'MessageSquare',
      system: 'Bell',
      agent_approval: 'Shield',
      property_approval: 'CheckCircle',
    };
    return icons[type] || 'Bell';
  },

  /**
   * Get notification type color
   */
  getNotificationColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      review: 'text-yellow-500',
      booking: 'text-blue-500',
      property: 'text-green-500',
      registration: 'text-purple-500',
      message: 'text-indigo-500',
      system: 'text-gray-500',
      agent_approval: 'text-orange-500',
      property_approval: 'text-emerald-500',
    };
    return colors[type] || 'text-gray-500';
  },

  /**
   * Get notification type background color
   */
  getNotificationBgColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      review: 'bg-yellow-100',
      booking: 'bg-blue-100',
      property: 'bg-green-100',
      registration: 'bg-purple-100',
      message: 'bg-indigo-100',
      system: 'bg-gray-100',
      agent_approval: 'bg-orange-100',
      property_approval: 'bg-emerald-100',
    };
    return colors[type] || 'bg-gray-100';
  },
};
