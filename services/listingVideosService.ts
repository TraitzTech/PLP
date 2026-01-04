import apiClient from "@/lib/apiClient";

export type ListingVideosUploadRequest = {
  url?: string | null;
  videos: File[] | Blob[];
};

export type ListingVideosUploadResponse = {
  status: "success";
  message: "Videos stored successfully";
  count: string;
  videos: string[];
};

export const listingVideosService = {
  async getByListing(listingId: number | string): Promise<any> {
    const { data } = await apiClient.get(`/listings/${listingId}/videos`);
    return data;
  },

  async upload(listingId: number | string, payload: ListingVideosUploadRequest): Promise<ListingVideosUploadResponse> {
    const form = new FormData();
    if (payload.url != null) form.append("url", String(payload.url));
    for (const vid of payload.videos) {
      form.append("videos[]", vid as any);
    }
    const { data } = await apiClient.post<ListingVideosUploadResponse>(`/listings/${listingId}/videos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    } as any);
    return data;
  },

  async delete(videoId: number | string): Promise<{ status: "success"; message: "Video deleted successfully" } | { status: "error"; message: "Video not found" }> {
    const { data } = await apiClient.delete(`/listings/${videoId}/videos`);
    return data;
  },
};
