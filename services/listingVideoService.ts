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
      return response.data;
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
        formData.append("videos", file);
      });
      if (url) {
        formData.append("url", url);
      }

      const response = await apiClient.post<ListingVideoCreateResponse>(
        `/listings/${listingId}/videos`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to upload videos for listing ${listingId}:`, error);
      throw error;
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
