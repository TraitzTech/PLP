import apiClient from "@/lib/apiClient";
import type {
  ListingVideosResponse,
  ListingVideoCreateResponse,
  ListingVideoDeleteResponse,
} from "./types";

export const listingVideoService = {
  /**
   * Get videos for a listing
   */
  async getVideosByListing(listingId: string | number): Promise<ListingVideosResponse> {
    try {
      const response = await apiClient.get<ListingVideosResponse>(`/listings/${listingId}/videos`);
      const payload: any = response.data;

      // Backward compatibility: older API shape returned a raw array.
      if (Array.isArray(payload)) {
        return {
          status: "success",
          data: payload,
        } as ListingVideosResponse;
      }

      return {
        status: payload?.status || "success",
        data: Array.isArray(payload?.data) ? payload.data : [],
      } as ListingVideosResponse;
    } catch (error) {
      console.error(`Failed to fetch videos for listing ${listingId}:`, error);
      throw error;
    }
  },

  /**
   * Upload videos for a listing
   */
  async uploadVideos(
    listingId: string | number,
    files: File[],
    url?: string
  ): Promise<ListingVideoCreateResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("videos[]", file);
      });
      if (url) {
        formData.append("url", url);
      }

      const response = await apiClient.post<ListingVideoCreateResponse>(
        `/listings/${listingId}/videos`,
        formData
      );
      return response.data;
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

      const enriched =
        error && typeof error === "object"
          ? Object.assign(error, { status, message })
          : { status, message };

      console.error(`Failed to upload videos for listing ${listingId}:`, enriched);
      throw enriched;
    }
  },

  /**
   * Delete a video
   */
  async deleteVideo(videoId: string | number): Promise<ListingVideoDeleteResponse> {
    try {
      const response = await apiClient.delete<ListingVideoDeleteResponse>(
        `/listings/${videoId}/videos`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to delete video ${videoId}:`, error);
      throw error;
    }
  },
};
