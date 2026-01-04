"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/navigation/footer";
import { PropertyDetailsWrapper } from "@/components/properties/property-details-wrapper";
import { propertyManagementService } from "@/services/propertyManagementService";
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

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
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

                const response = await propertyManagementService.getProperty(params.id);
                const prop: AdminProperty = (response as any).data || (response as any);
                
                console.log("Property response:", prop);
                console.log("Property title:", prop?.title);
                console.log("Property price:", prop?.price);
                console.log("Property facilities:", prop?.facilities);

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
                    rating: 4.5,
                    reviews: 0,
                    images: images.length ? images : [getImageUrl()],
                    amenities: (prop?.facilities || []).map((f: any) => f.name).filter(Boolean),
                    facilities: prop?.facilities || [],
                    type: prop?.property_type?.name || "Property",
                    bedrooms: prop?.number_available || 0,
                    bathrooms: 0,
                    area: 0,
                    description: prop?.description || "",
                    agent: prop?.agent || null,
                    region: prop?.region || "",
                    city: prop?.city || "",
                    address: prop?.location || "",
                    numberAvailable: prop?.number_available || 0,
                    isNegotiable: prop?.is_negotiable || false,
                    isApproved: prop?.is_approved || false,
                    isFeatured: prop?.is_featured || false,
                    createdAt: prop?.created_at || new Date().toISOString(),
                    updatedAt: prop?.updated_at || new Date().toISOString(),
                };

                setProperty(displayProperty);

                // Fetch similar properties by type
                try {
                    const simRes = await propertyManagementService.getAllProperties({
                        is_approved: true,
                        per_page: 4,
                    });
                    const sims = (simRes as any).data?.data || [];
                    const mapped = sims
                        .filter((p: any) => p.id !== prop.id)
                        .slice(0, 3)
                        .map((p: any) => {
                            const firstImage = p.images?.[0];
                            const imagePath = firstImage?.image_path || firstImage?.image_url;
                            return {
                                id: String(p.id),
                                title: p.title,
                                location: p.location || `${p.city}, ${p.region}`,
                                price: Number(p.price),
                                priceUnit: "night",
                                rating: 4.3,
                                reviews: 0,
                                images: [getImageUrl(imagePath)],
                                amenities: (p.facilities || []).map((f: any) => f.name).filter(Boolean),
                                type: p.property_type?.name || "Property",
                                bedrooms: p.number_available || 0,
                                bathrooms: 0,
                                area: 0,
                            };
                        });
                    setSimilarProperties(mapped);
                } catch (err) {
                    setSimilarProperties([]);
                }

                // Placeholder reviews
                setReviews([
                    {
                        id: 1,
                        user: prop.agent?.user?.name || "Guest",
                        avatar: "",
                        rating: 5,
                        date: new Date().toISOString(),
                        comment: prop.description,
                    },
                ]);
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
    }, [params.id]);

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