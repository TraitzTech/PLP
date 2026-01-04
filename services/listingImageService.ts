import apiClient from "@/lib/apiClient";
import type {
  ListingImagesResponse,
  ListingImageCreateResponse,
  ListingImageDeleteResponse,
} from "./types";

export const listingImageService = {
  /**
   * Get images for a listing
   */
  async getImagesByListing(listingId: string | number): Promise<ListingImagesResponse> {
    try {
      const response = await apiClient.get<ListingImagesResponse>(`/listings/${listingId}/images`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch images for listing ${listingId}:`, error);
      throw error;
    }
  },

  /**
   * Upload images for a listing
   */
  async uploadImages(
    listingId: string | number,
    files: File[],
    altText?: string
  ): Promise<ListingImageCreateResponse> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });
      if (altText) {
        formData.append("alt_text", altText);
      }

      const response = await apiClient.post<ListingImageCreateResponse>(
        `/listings/${listingId}/images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to upload images for listing ${listingId}:`, error);
      throw error;
    }
  },

  /**
   * Delete an image
   */
  async deleteImage(imageId: string | number): Promise<ListingImageDeleteResponse> {
    try {
      const response = await apiClient.delete<ListingImageDeleteResponse>(
        `/listings/${imageId}/images`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to delete image ${imageId}:`, error);
      throw error;
    }
  },
};
