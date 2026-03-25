export function getBackendOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (!raw) return "";

  const trimmed = raw.replace(/\/+$/, "");
  // Common setup: NEXT_PUBLIC_API_URL = https://host.tld/api
  return trimmed.replace(/\/api$/, "");
}

export function resolveListingImageObjectSrc(image: any): string | null {
  const candidate = image?.image_url || image?.url || image?.image_path;
  if (typeof candidate !== "string" || candidate.trim() === "") return null;

  const src = candidate.trim();
  if (src.startsWith("http") || src.startsWith("data:")) return src;

  const origin = getBackendOrigin();
  if (src.startsWith("/")) {
    return origin ? `${origin}${src}` : src;
  }

  // Filename (e.g. "listing_12_img_abc.jpg")
  return origin ? `${origin}/storage/listing_images/${src}` : `/storage/listing_images/${src}`;
}

export function resolveListingImageSrc(listing: any): string | null {
  const images = listing?.images;
  if (!Array.isArray(images) || images.length === 0) return null;

  const featured = images.find((img: any) => Boolean(img?.is_featured)) || images[0];
  return resolveListingImageObjectSrc(featured);
}

export function resolveListingVideoObjectSrc(video: any): string | null {
  const candidate = video?.video_url || video?.url || video?.video_path;
  if (typeof candidate !== "string" || candidate.trim() === "") return null;

  const src = candidate.trim();
  if (src.startsWith("http") || src.startsWith("data:")) return src;

  const origin = getBackendOrigin();
  if (src.startsWith("/")) {
    return origin ? `${origin}${src}` : src;
  }

  return origin ? `${origin}/storage/listing_videos/${src}` : `/storage/listing_videos/${src}`;
}
