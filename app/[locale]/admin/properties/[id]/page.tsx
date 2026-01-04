"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Calendar, Edit, Trash2, CheckCircle, XCircle, Star, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { propertyManagementService } from "@/services/propertyManagementService";
import type { AdminProperty, Facility } from "@/services/types";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Helper function to construct image URL
function getImageUrl(imagePath: string): string {
  if (imagePath && !imagePath.startsWith('http')) {
    return `${process.env.NEXT_PUBLIC_API_URL}/../storage/listing_images/${imagePath}`;
  }
  return imagePath || '';
}

export default function AdminPropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<AdminProperty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalType, setApprovalType] = useState<"approve" | "reject">("approve");
  const [approvalReason, setApprovalReason] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isTogglingFeatured, setIsTogglingFeatured] = useState(false);

  const fetchPropertyDetails = async () => {
    try {
      setIsLoading(true);
      const response = await propertyManagementService.getProperty(params.id as string);
      console.log("Admin property response:", response);
      
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
      await propertyManagementService.deleteProperty(property.id);
      toast.success("Property deleted successfully");
      router.push("/admin/properties");
    } catch (error: any) {
      console.error("Error deleting property:", error);
      toast.error(error.response?.data?.message || "Failed to delete property");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleApprovalClick = (type: "approve" | "reject") => {
    setApprovalType(type);
    setApprovalReason("");
    setApprovalDialogOpen(true);
  };

  const handleConfirmApproval = async () => {
    if (!property) return;

    if (approvalType === "reject" && !approvalReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setIsApproving(true);
      await propertyManagementService.updateApprovalStatus(property.id, {
        is_approved: approvalType === "approve",
        reason: approvalReason || (approvalType === "approve" ? "Approved by admin" : "Rejected by admin"),
      });

      toast.success(
        approvalType === "approve"
          ? "Property approved successfully"
          : "Property rejected successfully"
      );

      setApprovalDialogOpen(false);
      setApprovalReason("");
      fetchPropertyDetails();
    } catch (error: any) {
      console.error("Error updating approval status:", error);
      toast.error(
        error.response?.data?.message || 
        `Failed to ${approvalType} property`
      );
    } finally {
      setIsApproving(false);
    }
  };

  const handleToggleFeatured = async () => {
    if (!property) return;

    try {
      setIsTogglingFeatured(true);
      await propertyManagementService.toggleFeaturedStatus(property.id);
      toast.success(
        property.is_featured
          ? "Property removed from featured"
          : "Property marked as featured"
      );
      fetchPropertyDetails();
    } catch (error: any) {
      console.error("Error toggling featured status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update featured status"
      );
    } finally {
      setIsTogglingFeatured(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="admin">
        <div className="space-y-6">
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
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-24" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!property) {
    return (
      <DashboardLayout userType="admin">
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

  // Get data from property object
  const facilities = property.facilities || [];
  const images = property.images || [];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
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
              onClick={() => router.push(`/admin/properties/${property.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {getStatusBadge()}
          {property.is_featured ? (
            <Badge className="bg-yellow-500">
              <Star className="mr-1 h-3 w-3" />
              Featured
            </Badge>
          ) : (
            <Badge variant="outline">Not Featured</Badge>
          )}
          {property.is_approved ? (
            <Badge className="bg-green-500">
              <CheckCircle className="mr-1 h-3 w-3" />
              Approved
            </Badge>
          ) : (
            <Badge variant="secondary">
              <XCircle className="mr-1 h-3 w-3" />
              Pending Approval
            </Badge>
          )}
          {property.is_negotiable && <Badge variant="outline">Negotiable</Badge>}
        </div>

        {/* Admin Actions Alert */}
        {!property.is_approved && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900">
              This property is pending approval. Please review and approve or reject it.
            </AlertDescription>
          </Alert>
        )}

        {/* Admin Control Buttons */}
        <div className="flex flex-wrap gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex-1 min-w-fit">
            {!property.is_approved ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprovalClick("approve")}
                  disabled={isApproving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleApprovalClick("reject")}
                  disabled={isApproving}
                  variant="destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            ) : (
              <div className="text-sm text-green-900 font-medium">
                ✓ Property is approved
              </div>
            )}
          </div>
          <Button
            onClick={handleToggleFeatured}
            disabled={isTogglingFeatured}
            variant={property.is_featured ? "default" : "outline"}
          >
            <Star className="mr-2 h-4 w-4" />
            {property.is_featured ? "Unfeature" : "Mark as Featured"}
          </Button>
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
                          src={getImageUrl(image.image_path || '')}
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

        {/* Property Details Grid */}
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

          {/* Agent Info */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.agent && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Agent Name</p>
                    <p className="text-lg font-semibold">{property.agent.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Agent Email</p>
                    <p className="text-sm font-medium break-all">{property.agent.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Agent Phone</p>
                    <p className="text-sm font-medium">{property.agent.user.phone || "Not provided"}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Listed On</p>
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
                <p className="text-sm font-medium font-mono">#{property.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
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
                    {facility.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Details */}
        <Card>
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
          </CardHeader>
          <CardContent>
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
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{property.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalType === "approve" ? "Approve Property" : "Reject Property"}
            </DialogTitle>
            <DialogDescription>
              {approvalType === "approve"
                ? "This property will be approved and become visible to customers."
                : "Please provide a reason for rejecting this property."}
            </DialogDescription>
          </DialogHeader>

          {approvalType === "reject" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for Rejection *</Label>
                <Textarea
                  id="reason"
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApproval}
              disabled={isApproving}
              className={approvalType === "reject" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {approvalType === "approve" ? "Approving..." : "Rejecting..."}
                </>
              ) : approvalType === "approve" ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Property
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Property
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property
              and all associated data including images and videos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}