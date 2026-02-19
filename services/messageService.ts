import apiClient from "@/lib/apiClient";

// Types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image?: string;
  user_type: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  listing_id?: number;
  message: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  attachment_url?: string;
  attachment_name?: string;
  attachment_mime_type?: string;
  attachment_size?: number;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
  sender?: User;
  receiver?: User;
  listing?: {
    id: number;
    title: string;
    address?: string;
  };
}

export interface Conversation {
  user: User;
  last_message: {
    id: number;
    message: string;
    message_type: string;
    attachment_name?: string;
    is_read: boolean;
    created_at: string;
    sender_id: number;
  };
  unread_count: number;
}

export interface SendMessageData {
  receiver_id: number;
  message?: string;
  listing_id?: number;
  attachment?: File;
}

export interface MessagesResponse {
  status: string;
  data: {
    messages: Message[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  };
}

export interface ConversationsResponse {
  status: string;
  data: {
    conversations: Conversation[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  };
}

export interface SearchUsersResponse {
  status: string;
  data: {
    users: User[];
    pagination: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  };
}

export const messageService = {
  /**
   * Get all conversations for the current user
   */
  getConversations: async (page: number = 1, perPage: number = 20): Promise<ConversationsResponse> => {
    const { data } = await apiClient.get(`/messages/conversations`, {
      params: { page, per_page: perPage }
    });
    return data;
  },

  /**
   * Get messages for a specific conversation with a user
   */
  getConversation: async (userId: number, page: number = 1, perPage: number = 50): Promise<MessagesResponse> => {
    const { data } = await apiClient.get(`/messages/conversation/${userId}`, {
      params: { page, per_page: perPage }
    });
    return data;
  },

  /**
   * Send a message (with optional attachment)
   */
  sendMessage: async (messageData: SendMessageData): Promise<{ status: string; data: { message: Message } }> => {
    const formData = new FormData();
    formData.append('receiver_id', String(messageData.receiver_id));
    
    if (messageData.message) {
      formData.append('message', messageData.message);
    }
    
    if (messageData.listing_id) {
      formData.append('listing_id', String(messageData.listing_id));
    }
    
    if (messageData.attachment) {
      formData.append('attachment', messageData.attachment);
    }

    const { data } = await apiClient.post('/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  /**
   * Mark a single message as read
   */
  markAsRead: async (messageId: number): Promise<{ status: string; data: { message: Message } }> => {
    const { data } = await apiClient.patch(`/messages/${messageId}/read`);
    return data;
  },

  /**
   * Mark all messages in a conversation as read
   */
  markConversationAsRead: async (userId: number): Promise<{ status: string; message: string; data: { marked_count: number } }> => {
    const { data } = await apiClient.patch(`/messages/conversation/${userId}/read`);
    return data;
  },

  /**
   * Get unread message count
   */
  getUnreadCount: async (): Promise<{ status: string; data: { unread_count: number } }> => {
    const { data } = await apiClient.get('/messages/unread-count');
    return data;
  },

  /**
   * Delete a message
   */
  deleteMessage: async (messageId: number): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.delete(`/messages/${messageId}`);
    return data;
  },

  /**
   * Search for users to start a new conversation
   */
  searchUsers: async (search: string, page: number = 1, perPage: number = 10): Promise<SearchUsersResponse> => {
    const { data } = await apiClient.get('/messages/search-users', {
      params: { search, page, per_page: perPage }
    });
    return data;
  },

  /**
   * Get all messages (for admin/general listing)
   */
  getAllMessages: async (params?: {
    page?: number;
    per_page?: number;
    is_read?: boolean;
  }): Promise<MessagesResponse> => {
    const { data } = await apiClient.get('/messages', { params });
    return data;
  },

  /**
   * Helper to get file type icon based on mime type
   */
  getFileTypeIcon: (mimeType?: string): string => {
    if (!mimeType) return '📄';
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📑';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📄';
  },

  /**
   * Format file size for display
   */
  formatFileSize: (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  /**
   * Check if message has attachment
   */
  hasAttachment: (message: Message): boolean => {
    return !!message.attachment_url && message.message_type !== 'text';
  },

  /**
   * Get preview text for a message (used in conversation list)
   */
  getMessagePreview: (message: { message?: string; message_type: string; attachment_name?: string }): string => {
    if (message.message) {
      return message.message.length > 50 ? message.message.substring(0, 50) + '...' : message.message;
    }
    switch (message.message_type) {
      case 'image': return '📷 Image';
      case 'video': return '🎬 Video';
      case 'audio': return '🎵 Audio';
      case 'file': return `📎 ${message.attachment_name || 'File'}`;
      default: return '';
    }
  }
};

export default messageService;
