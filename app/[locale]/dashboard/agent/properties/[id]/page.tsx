"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Calendar, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { listingService } from "@/services/listingService";
import type { Listing, Facility } from "@/services/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Helper function to construct image URL
function getImageUrl(imagePath: string): string {
  if (imagePath && !imagePath.startsWith('http')) {
    return `${process.env.NEXT_PUBLIC_API_URL}/../storage/listing_images/${imagePath}`;
  }
  return imagePath || '';
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPropertyDetails = async () => {
    try {
      setIsLoading(true);
      const response = await listingService.getListing(params.id as string);
      console.log("Property response:", response);
      
      // Handle both response structures
      const propertyData = response?.data || response;
      setProperty(propertyData);
    } catch (error: any) {
      console.error("Error fetching property:", error);
      toast.error(error.response?.data?.message || "Failed to fetch property details");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchPropertyDetails();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!property) return;

    try {
      setIsDeleting(true);
      await listingService.deleteListing(property.id);
      toast.success("Property deleted successfully");
      router.push("/dashboard/agent/properties");
    } catch (error: any) {
      console.error("Error deleting property:", error);
      toast.error(error.response?.data?.message || "Failed to delete property");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="agent">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-10 w-96 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* Badge Skeleton */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-6 w-24" />
            ))}
          </div>

          {/* Image Carousel Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-video rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout userType="agent">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Property not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = () => {
    const status = String(property.status).toLowerCase();
    const isAvailable = status === "1" || status === "available" || status === "true";

    return (
      <Badge variant={isAvailable ? "default" : "destructive"}>
        {isAvailable ? "Available" : "Unavailable"}
      </Badge>
    );
  };

  // Get facilities from property object
  const facilities = property.facilities || [];
  const images = property.images || [];

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{property.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span>{property.location}, {property.city}, {property.region}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/agent/properties/${property.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2">
          {getStatusBadge()}
          {property.is_featured && (
            <Badge className="bg-yellow-500">Featured</Badge>
          )}
          {property.is_approved ? (
            <Badge className="bg-green-500">
              <CheckCircle className="mr-1 h-3 w-3" />
              Approved
            </Badge>
          ) : (
            <Badge variant="secondary">
              <XCircle className="mr-1 h-3 w-3" />
              Pending Admin Approval
            </Badge>
          )}
          {property.is_negotiable && (
            <Badge variant="outline">Negotiable</Badge>
          )}
        </div>

        {/* Images Carousel */}
        {images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Property Images ({images.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Carousel className="w-full">
                <CarouselContent>
                  {images.map((image) => (
                    <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(image.image_path)}
                          alt={property.title}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" text-anchor="middle" dy=".3em" fill="%23999"%3EImage not available%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </CardContent>
          </Card>
        )}

        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price & Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Price & Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold text-plp-purple">
                  {new Intl.NumberFormat('en-US').format(Number(property.price))} XAF
                </p>
                {property.discount_price && (
                  <p className="text-sm text-green-600">
                    Discount: {new Intl.NumberFormat('en-US').format(Number(property.discount_price))} XAF 
                    {property.discount_percentage && ` (${property.discount_percentage}% off)`}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Units Available</p>
                <p className="text-lg font-semibold">{property.number_available}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Property Type</p>
                <p className="text-lg font-semibold">{property.property_type?.name || "—"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Property Info */}
          <Card>
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Listed</p>
                  <p className="text-sm font-medium">
                    {property.created_at ? new Date(property.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">
                    {property.updated_at ? new Date(property.updated_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Property ID</p>
                <p className="text-sm font-medium">#{property.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agent</p>
                <p className="text-sm font-medium">{property.agent?.user?.name || "—"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {property.description}
            </p>
          </CardContent>
        </Card>

        {/* Facilities */}
        {facilities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Facilities & Amenities ({facilities.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {facilities.map((facility) => (
                  <Badge key={facility.id} variant="secondary" className="px-3 py-1">
                    {facility.icon && <span className="mr-1">{facility.icon}</span>}
                    {facility.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Region</p>
                <p className="font-medium">{property.region}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">{property.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{property.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}