import apiClient from "@/lib/apiClient";

export interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  user_type: string;
  avatar: string | null;
  bio?: string;
  company?: string;
  license_number?: string;
  country?: string;
  region?: string;
  city?: string;
  address?: string;
  created_at: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  phone?: string;
  bio?: string;
  profile_photo?: File;
  country?: string;
  region?: string;
  city?: string;
  address?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const profileService = {
  /**
   * Get the current user's profile
   */
  async getProfile(): Promise<ProfileData> {
    const { data } = await apiClient.get<{ status: string; data: ProfileData }>("/profile");
    return data.data;
  },

  /**
   * Update the current user's profile (supports file upload)
   */
  async updateProfile(payload: ProfileUpdatePayload): Promise<ProfileData> {
    const formData = new FormData();

    if (payload.name !== undefined) formData.append("name", payload.name);
    if (payload.phone !== undefined) formData.append("phone", payload.phone);
    if (payload.bio !== undefined) formData.append("bio", payload.bio);
    if (payload.profile_photo) formData.append("profile_photo", payload.profile_photo);
    if (payload.country !== undefined) formData.append("country", payload.country);
    if (payload.region !== undefined) formData.append("region", payload.region);
    if (payload.city !== undefined) formData.append("city", payload.city);
    if (payload.address !== undefined) formData.append("address", payload.address);

    const { data } = await apiClient.post<{ status: string; message: string; data: ProfileData }>(
      "/profile",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data.data;
  },

  /**
   * Change the current user's password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ status: string; message: string }>(
      "/profile/change-password",
      payload
    );
    return { message: data.message };
  },
};
