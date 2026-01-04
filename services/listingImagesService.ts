import apiClient from "@/lib/apiClient";

export type ListingImagesUploadRequest = {
  alt_text?: string | null;
  images: File[] | Blob[];
};

export type ListingImagesUploadResponse = {
  status: "success";
  message: "Images stored successfully";
  count: string;
  images: string[];
};

export const listingImagesService = {
  async getByListing(listingId: number | string): Promise<any> {
    const { data } = await apiClient.get(`/listings/${listingId}/images`);
    return data;
  },

  async upload(listingId: number | string, payload: ListingImagesUploadRequest): Promise<ListingImagesUploadResponse> {
    const form = new FormData();
    if (payload.alt_text != null) form.append("alt_text", String(payload.alt_text));
    for (const img of payload.images) {
      form.append("images[]", img as any);
    }
    const { data } = await apiClient.post<ListingImagesUploadResponse>(`/listings/${listingId}/images`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    } as any);
    return data;
  },

  async delete(imageId: number | string): Promise<{ status: "success"; message: "Image deleted successfully" } | { status: "error"; message: "Image not found" }> {
    const { data } = await apiClient.delete(`/listings/${imageId}/images`);
    return data;
  },
};
