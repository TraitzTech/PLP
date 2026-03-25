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
    try {
      const { data } = await apiClient.post<ListingVideosUploadResponse>(`/listings/${listingId}/videos`, form);
      return data;
    } catch (error: any) {
      const status = error?.status ?? error?.response?.status;
      const rawData = error?.data ?? error?.response?.data;
      const firstValidationError =
        Array.isArray(rawData?.errors) && rawData.errors.length > 0 ? rawData.errors[0] : undefined;

      const message =
        (typeof error?.message === "string" && error.message.trim().length > 0 && error.message) ||
        (typeof rawData?.message === "string" && rawData.message) ||
        (typeof firstValidationError === "string" && firstValidationError) ||
        (typeof rawData === "string" && rawData) ||
        (status === 413 ? "Video upload too large. Please upload smaller videos." : "") ||
        "Failed to upload videos. Please try again.";

      throw (error && typeof error === "object")
        ? Object.assign(error, { status, message })
        : { status, message };
    }
  },

  async delete(videoId: number | string): Promise<{ status: "success"; message: "Video deleted successfully" } | { status: "error"; message: "Video not found" }> {
    const { data } = await apiClient.delete(`/listings/${videoId}/videos`);
    return data;
  },
};
