"use client";

import React, { useState, useEffect } from "react";
import { PropertyCard } from "./property-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/components/translation-provider";
import { publicPropertyService } from "@/services/publicPropertyService";
import { listingImageService } from "@/services/listingImageService";
import type { AdminProperty } from "@/services/types";

// Helper function to get image URL from backend storage
function getImageUrl(imagePath?: string): string {
  if (!imagePath) {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" text-anchor="middle" dy=".3em" fill="%23999"%3ENo image%3C/text%3E%3C/svg%3E';
  }
  return `${process.env.NEXT_PUBLIC_API_URL}/../storage/listing_images/${imagePath}`;
}

// Skeleton loader for property cards
function PropertyCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-full h-48 rounded-lg" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-1/2 h-4" />
    </div>
  );
}

export function FeaturedProperties() {
  const pathname = usePathname();
  const t = useTranslations();
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const locale = React.useMemo(() => {
    const first = pathname?.split("/").filter(Boolean)[0];
    return first === "en" || first === "fr" ? `/${first}` : "/en";
  }, [pathname]);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch featured properties from public endpoint (no authentication required)
        const response = await publicPropertyService.getAllProperties({
          is_featured: true,
          per_page: 8,
        });

        // Extract properties from response
        const allProperties = Array.isArray(response.data) ? response.data : [];

        // Filter to ensure only featured properties are shown
        const fetchedProperties = allProperties.filter(
          (property: any) => property.is_featured === true,
        );

        // Fetch images for each property
        const propertiesWithImages = await Promise.all(
          fetchedProperties.slice(0, 8).map(async (property) => {
            try {
              const imagesResponse =
                await listingImageService.getImagesByListing(property.id);
              const images =
                (imagesResponse as any).data || (imagesResponse as any) || [];

              // Ensure images have the correct structure
              const formattedImages = Array.isArray(images)
                ? images.map((img: any) => ({
                    id: img.id,
                    image_path: img.image_path || img.image_url || img.url,
                    image_url: img.image_url || img.image_path || img.url,
                    url: img.url || img.image_path || img.image_url,
                  }))
                : [];

              // Merge with existing images if property already has them
              const mergedImages = [
                ...(property.images || []),
                ...formattedImages,
              ];

              return {
                ...property,
                images: mergedImages,
              };
            } catch (err) {
              console.error(
                `Failed to fetch images for property ${property.id}:`,
                err,
              );
              return {
                ...property,
                images: property.images || [],
              };
            }
          }),
        );

        setProperties(propertiesWithImages);
      } catch (err) {
        console.error("Error fetching featured properties:", err);
        setError(t("featured.error", "Failed to load featured properties"));
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {t("featured.title", "Featured Properties")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl">
              {t(
                "featured.subtitle",
                "Discover our handpicked selection of premium properties that offer exceptional experiences and unmatched value.",
              )}
            </p>
          </div>

          <Link href={`${locale}/search`}>
            <Button className="btn-primary group">
              {t("featured.viewAll", "View All Properties")}
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {t("featured.empty", "No featured properties available")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
