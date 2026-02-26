"use client";

import { use, useEffect, useState } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { PropertyDetailsWrapper } from "@/components/properties/property-details-wrapper";
import { publicPropertyService } from "@/services/publicPropertyService";
import { listingImageService } from "@/services/listingImageService";
import type { AdminProperty } from "@/services/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Helper to build image URLs from storage
function getImageUrl(imagePath?: string): string {
    if (!imagePath) {
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='16' text-anchor='middle' dy='.3em' fill='%23999'%3ENo image%3C/text%3E%3C/svg%3E";
    }
    return `${process.env.NEXT_PUBLIC_API_URL}/../storage/listing_images/${imagePath}`;
}

// Shimmer placeholder for page
function PropertyPageSkeleton() {
    return (
        <div className="space-y-8">
            <div className="h-10 w-64 bg-gray-100 rounded-lg" />
            <div className="h-96 bg-gray-100 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap the params Promise using React.use()
    const { id } = use(params);
    
    const [property, setProperty] = useState<any | null>(null);
    const [similarProperties, setSimilarProperties] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                setIsLoading(true);
                setHasError(null);

                const response = await publicPropertyService.getProperty(id);
                const prop: AdminProperty = (response.data as any) || (response.data as any);
                
                // Fetch images
                let images: string[] = [];
                try {
                    const imgRes = await listingImageService.getImagesByListing(prop.id);
                    images = ((imgRes as any) || []).map((img: any) => getImageUrl(img.image_path));
                } catch (err) {
                    images = [];
                }
                if (!images.length && prop.images?.length) {
                    images = prop.images.map((img: any) => getImageUrl(img.image_path || img.image_url));
                }

                console.log("Images fetched for property:", images);

                // Determine price unit based on property type
                const getPriceUnit = (type: string | undefined): string => {
                    const normalizedType = type?.toLowerCase() || "";
                    if (normalizedType.includes("hotel") || normalizedType.includes("villa") || normalizedType.includes("apartment")) {
                        return "night";
                    }
                    return "total";
                };

                // Map to display shape
                const displayProperty = {
                    id: String(prop?.id || ""),
                    title: prop?.title || "Property",
                    location: prop?.location || `${prop?.city || ""}, ${prop?.region || ""}`,
                    price: prop?.price ? Number(prop.price) : 0,
                    discountPrice: prop?.discount_price ? Number(prop.discount_price) : null,
                    discountPercentage: prop?.discount_percentage ? Number(prop.discount_percentage) : null,
                    priceUnit: getPriceUnit(prop?.property_type?.name),
                    rating: Number((prop as any)?.average_rating ?? (prop as any)?.rating ?? 0),
                    reviews: Number((prop as any)?.reviews_count ?? (prop as any)?.reviews?.length ?? 0),
                    images: images.length ? images : [getImageUrl()],
                    amenities: (prop?.facilities || []).map((f: any) => f.name).filter(Boolean),
                    facilities: prop?.facilities || [],
                    type: prop?.property_type?.name || "Property",
                    bedrooms: prop?.bedrooms || prop?.number_available || 0,
                    bathrooms: prop?.bathrooms || 0,
                    area: 0,
                    description: prop?.description || "",
                    agent: prop?.agent || null,
                    agent_id: prop?.agent_id || prop?.agent?.id || null,
                    can_view_agent: Boolean((prop as any)?.can_view_agent),
                    platform_fee_required: Boolean((prop as any)?.platform_fee_required),
                    region: prop?.region || "",
                    city: prop?.city || "",
                    address: prop?.address || prop?.location || "",
                    numberAvailable: prop?.number_available || 0,
                    isNegotiable: prop?.is_negotiable || false,
                    isApproved: prop?.is_approved || false,
                    isFeatured: prop?.is_featured || false,
                    is_available: prop?.is_available || true,
                    is_approved: prop?.is_approved || false,
                    is_featured: prop?.is_featured || false,
                    is_negotiable: prop?.is_negotiable || false,
                    for_rent: prop?.for_rent,
                    for_purchase: prop?.for_purchase,
                    floor_area: prop?.floor_area || 0,
                    floor_area_unit: prop?.floor_area_unit || "sqm",
                    land_area: prop?.land_area || 0,
                    land_area_unit: prop?.land_area_unit || "sqm",
                    land_dimensions: prop?.land_dimensions || "",
                    year_built: prop?.year_built || 0,
                    rooms_count: prop?.rooms_count || 0,
                    star_rating: prop?.star_rating || 0,
                    has_pool: prop?.has_pool || false,
                    has_restaurant: prop?.has_restaurant || false,
                    house_type: prop?.house_type || "",
                    latitude: prop?.latitude || 0,
                    longitude: prop?.longitude || 0,
                    property_type: prop?.property_type,
                    createdAt: prop?.created_at || new Date().toISOString(),
                    updatedAt: prop?.updated_at || new Date().toISOString(),
                };

                setProperty(displayProperty);

                // Fetch similar properties by type
                try {
                    const simRes = await publicPropertyService.getAllProperties({
                        per_page: 4,
                    });
                    const sims = (simRes as any).data || [];
                    const mapped = sims
                        .filter((p: any) => p.id !== prop.id)
                        .slice(0, 3)
                        .map((p: any) => {
                            // Fetch images for similar property
                            let simImages: any[] = [];
                            if (p.images && p.images.length > 0) {
                                simImages = p.images.map((img: any) => ({
                                    image_path: img.image_path || img.image_url,
                                    image_url: img.image_url || img.image_path,
                                    url: img.url,
                                }));
                            }

                            return {
                                id: String(p.id),
                                title: p.title,
                                location: p.location || `${p.city}, ${p.region}`,
                                price: Number(p.price),
                                priceUnit: getPriceUnit(p.property_type?.name),
                                rating: Number((p as any)?.average_rating ?? (p as any)?.rating ?? 0),
                                reviews: Number((p as any)?.reviews_count ?? (p as any)?.reviews?.length ?? 0),
                                images: simImages.length > 0 ? simImages : [],
                                amenities: (p.facilities || []).map((f: any) => f.name).filter(Boolean),
                                facilities: p.facilities || [],
                                property_type: p.property_type || null,
                                type: p.property_type?.name || "Property",
                                bedrooms: p.bedrooms || p.number_available || 0,
                                bathrooms: p.bathrooms || 0,
                                city: p.city || "",
                                region: p.region || "",
                                floor_area: p.floor_area || 0,
                                floor_area_unit: p.floor_area_unit || "sqm",
                                land_area: p.land_area || 0,
                                land_area_unit: p.land_area_unit || "sqm",
                                is_featured: p.is_featured || false,
                                is_available: p.is_available || true,
                                for_rent: p.for_rent,
                                for_purchase: p.for_purchase,
                            };
                        });
                    setSimilarProperties(mapped);
                } catch (err) {
                    setSimilarProperties([]);
                }

                // Placeholder reviews
                setReviews([]);
            } catch (error: any) {
                console.error("Failed to load property", error);
                const message = error?.response?.data?.message || "Failed to load property";
                toast.error(message);
                setHasError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperty();
    }, [id]); // Now using the unwrapped id

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
                {isLoading && <PropertyPageSkeleton />}
                {!isLoading && hasError && (
                    <div className="text-center text-gray-700 bg-red-50 border border-red-100 rounded-xl p-6">
                        {hasError}
                    </div>
                )}
                {!isLoading && property && (
                    <PropertyDetailsWrapper
                        property={property}
                        similarProperties={similarProperties}
                        reviews={reviews}
                    />
                )}
            </div>

            <Footer />
        </div>
    );
}
