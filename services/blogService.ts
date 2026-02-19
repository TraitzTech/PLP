import apiClient from "@/lib/apiClient";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Safely parse tags that may be a string, a JSON string, or already an array */
export function parseTags(tags: unknown): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: number;
  author_id: number;
  title_en: string;
  title_fr: string | null;
  slug: string;
  excerpt_en: string | null;
  excerpt_fr: string | null;
  content_en: string;
  content_fr: string | null;
  category: string;
  tags: string[] | null;
  image: string | null;
  image_url: string | null;
  read_time: number;
  views: number;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  author?: {
    id: number;
    name: string;
  };
  approved_comments?: BlogComment[];
}

export interface BlogComment {
  id: number;
  blog_post_id: number;
  user_id: number | null;
  parent_id: number | null;
  guest_name: string | null;
  guest_email: string | null;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_avatar: string | null;
  user?: {
    id: number;
    name: string;
  };
  replies?: BlogComment[];
}

export interface BlogListParams {
  search?: string;
  category?: string;
  sort?: 'newest' | 'oldest' | 'popular' | 'trending';
  featured?: boolean;
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

export interface BlogStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_views: number;
  total_comments: number;
  pending_comments: number;
  featured_posts: number;
}

// ─── Public Blog Service ────────────────────────────────────────────────────

export const blogService = {
  /**
   * Get published blog posts (public).
   */
  async getPosts(params?: BlogListParams): Promise<{ success: boolean; data: PaginatedResponse<BlogPost> }> {
    const response = await apiClient.get('/blog', { params });
    return response.data;
  },

  /**
   * Get a single blog post by slug (public).
   */
  async getPost(slug: string): Promise<{ success: boolean; data: BlogPost }> {
    const response = await apiClient.get(`/blog/${slug}`);
    return response.data;
  },

  /**
   * Get related posts.
   */
  async getRelatedPosts(slug: string): Promise<{ success: boolean; data: BlogPost[] }> {
    const response = await apiClient.get(`/blog/${slug}/related`);
    return response.data;
  },

  /**
   * Toggle like on a blog post (auth required).
   */
  async toggleLike(postId: number): Promise<{ success: boolean; data: { liked: boolean; likes_count: number } }> {
    const response = await apiClient.post(`/blog/${postId}/like`);
    return response.data;
  },

  /**
   * Add a comment to a blog post.
   */
  async addComment(
    postId: number,
    data: { content: string; parent_id?: number; guest_name?: string; guest_email?: string }
  ): Promise<{ success: boolean; message: string; data: BlogComment }> {
    const response = await apiClient.post(`/blog/${postId}/comments`, data);
    return response.data;
  },

  /**
   * Delete a comment.
   */
  async deleteComment(commentId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/blog/comments/${commentId}`);
    return response.data;
  },
};

// ─── Admin Blog Service ─────────────────────────────────────────────────────

export const adminBlogService = {
  /**
   * Get all blog posts (admin, includes drafts).
   */
  async getPosts(params?: {
    search?: string;
    category?: string;
    is_published?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<{ success: boolean; data: PaginatedResponse<BlogPost> }> {
    const response = await apiClient.get('/admin/blog', { params });
    return response.data;
  },

  /**
   * Get blog statistics.
   */
  async getStatistics(): Promise<{ success: boolean; data: BlogStats }> {
    const response = await apiClient.get('/admin/blog/statistics');
    return response.data;
  },

  /**
   * Get a single post (admin view).
   */
  async getPost(id: number): Promise<{ success: boolean; data: BlogPost }> {
    const response = await apiClient.get(`/admin/blog/${id}`);
    return response.data;
  },

  /**
   * Create a new blog post.
   */
  async createPost(data: FormData): Promise<{ success: boolean; message: string; data: BlogPost }> {
    const response = await apiClient.post('/admin/blog', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Update a blog post.
   */
  async updatePost(id: number, data: FormData): Promise<{ success: boolean; message: string; data: BlogPost }> {
    const response = await apiClient.post(`/admin/blog/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Delete a blog post.
   */
  async deletePost(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/admin/blog/${id}`);
    return response.data;
  },

  /**
   * Toggle featured status.
   */
  async toggleFeatured(id: number): Promise<{ success: boolean; message: string; data: BlogPost }> {
    const response = await apiClient.patch(`/admin/blog/${id}/featured`);
    return response.data;
  },

  /**
   * Toggle publish status.
   */
  async togglePublish(id: number): Promise<{ success: boolean; message: string; data: BlogPost }> {
    const response = await apiClient.patch(`/admin/blog/${id}/publish`);
    return response.data;
  },

  /**
   * Get pending comments.
   */
  async getPendingComments(params?: {
    page?: number;
    per_page?: number;
  }): Promise<{ success: boolean; data: PaginatedResponse<BlogComment> }> {
    const response = await apiClient.get('/admin/blog/pending-comments', { params });
    return response.data;
  },

  /**
   * Approve a comment.
   */
  async approveComment(commentId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch(`/admin/blog/comments/${commentId}/approve`);
    return response.data;
  },

  /**
   * Delete a comment (admin).
   */
  async deleteComment(commentId: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/admin/blog/comments/${commentId}`);
    return response.data;
  },
};
