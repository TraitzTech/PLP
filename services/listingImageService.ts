import apiClient from "@/lib/apiClient";
import type { ListingImage, ListingImagesResponse } from "./types";

export const listingImageService = {
  /**
   * Get images for a listing
   */
  async getImagesByListing(listingId: string | number): Promise<any> {
    try {
      const response = await apiClient.get(
        `/listings/${listingId}/images`
      );
      return response.data.data || response.data || [];
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
    files: File[]
  ): Promise<ListingImage[]> {
    try {
      if (!files || files.length === 0) {
        throw new Error("No files provided");
      }

      const formData = new FormData();
      
      // Append all files to FormData
      files.forEach((file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not a valid image file`);
        }
        formData.append("images[]", file);
      });

      const response = await apiClient.post(
        `/listings/${listingId}/images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data.data || response.data || [];
    } catch (error: any) {
      console.error(`Error uploading images for listing ${listingId}:`, error);
      
      // Log detailed error info
      if (error.response?.status === 403) {
        console.error("Authorization failed. Possible causes:");
        console.error("1. User is not authenticated");
        console.error("2. User is not an agent");
        console.error("3. Agent status is not 'approved'");
      }
      
      throw error;
    }
  },

  /**
   * Delete a single image
   */
  async deleteImage(imageId: string | number): Promise<void> {
    try {
      await apiClient.delete(`/listings/${imageId}/images`);
    } catch (error) {
      console.error(`Failed to delete image ${imageId}:`, error);
      throw error;
    }
  },

  /**
   * Delete multiple images
   */
  async deleteImages(imageIds: (string | number)[]): Promise<void> {
    try {
      await Promise.all(
        imageIds.map(id => this.deleteImage(id))
      );
    } catch (error) {
      console.error("Failed to delete images:", error);
      throw error;
    }
  },
};
