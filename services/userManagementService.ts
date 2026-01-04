import apiClient from "@/lib/apiClient";
import type {
  UserListResponse,
  UserCreateRequest,
  UserCreateResponse,
  UserShowResponse,
  UserUpdateRequest,
  UserUpdateResponse,
  UserDeleteResponse,
} from "./types";

const BASE_URL = "/manage-users";

export const userManagementService = {
  /**
   * Get all users with optional filters
   */
  async getAllUsers(params?: {
    per_page?: number;
    page?: number;
    user_type?: string;
    search?: string;
  }): Promise<UserListResponse> {
    const response = await apiClient.get<UserListResponse>(BASE_URL, { params });
    return response.data;
  },

  /**
   * Get a single user by ID
   */
  async getUser(id: string | number): Promise<UserShowResponse> {
    const response = await apiClient.get<UserShowResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new user
   */
  async createUser(data: UserCreateRequest): Promise<UserCreateResponse> {
    const response = await apiClient.post<UserCreateResponse>(BASE_URL, data);
    return response.data;
  },

  /**
   * Update an existing user
   */
  async updateUser(
    id: string | number,
    data: UserUpdateRequest
  ): Promise<UserUpdateResponse> {
    const response = await apiClient.put<UserUpdateResponse>(
      `${BASE_URL}/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a user
   */
  async deleteUser(id: string | number): Promise<UserDeleteResponse> {
    const response = await apiClient.delete<UserDeleteResponse>(
      `${BASE_URL}/${id}`
    );
    return response.data;
  },
};
