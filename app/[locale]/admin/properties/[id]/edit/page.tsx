"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Loader2, Upload, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { propertyManagementService } from "@/services/propertyManagementService";
import { listingImageService } from "@/services/listingImageService";
import { listingVideoService } from "@/services/listingVideoService";
import { userManagementService } from "@/services/userManagementService";
import { propertyTypeService } from "@/services/propertyTypeService";
import { facilitiesService } from "@/services/facilitiesService";
import type { AdminProperty, User, PropertyType, Facility, ListingImage, ListingVideo } from "@/services/types";

export default function EditAdminPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [property, setProperty] = useState<AdminProperty | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [existingImages, setExistingImages] = useState<ListingImage[]>([]);
  const [existingVideos, setExistingVideos] = useState<ListingVideo[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newVideoFiles, setNewVideoFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [deletingImageIds, setDeletingImageIds] = useState<number[]>([]);
  const [deletingVideoIds, setDeletingVideoIds] = useState<number[]>([]);
  const [formData, setFormData] = useState<any>({
    agent_id: 0,
    title: "",
    description: "",
    property_type_id: 0,
    price: 0,
    region: "",
    city: "",
    location: "",
    discount_price: null,
    discount_percentage: null,
    number_available: 1,
    is_available: true,
    is_negotiable: false,
    is_featured: false,
    is_approved: true,
    status: true,
    facilities_id: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch property details
      const propertyRes = await propertyManagementService.getProperty(params.id as string);
      const propertyData = propertyRes.data;
      setProperty(propertyData);

      // Fetch agents
      const agentsRes = await userManagementService.getAllUsers({ user_type: "agent", per_page: 100 });
      setAgents(agentsRes.data?.data || []);

      // Fetch property types
      const typesRes = await propertyTypeService.getAllPropertyTypes();
      setPropertyTypes(Array.isArray(typesRes) ? typesRes : []);

      // Fetch facilities
      const facilitiesRes = await facilitiesService.getAllFacilities();
      setFacilities(Array.isArray(facilitiesRes) ? facilitiesRes : []);

      // Fetch existing images
      try {
        const imagesRes = await listingImageService.getImagesByListing(params.id as string);
        setExistingImages(imagesRes.data || []);
      } catch (error) {
        console.error("Error fetching images:", error);
        setExistingImages([]);
      }

      // Fetch existing videos
      try {
        const videosRes = await listingVideoService.getVideosByListing(params.id as string);
        setExistingVideos(videosRes.data || []);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setExistingVideos([]);
      }

      // Set form data
      setFormData({
        agent_id: propertyData.agent_id || 0,
        title: propertyData.title || "",
        description: propertyData.description || "",
        property_type_id: propertyData.property_type_id || 0,
        price: propertyData.price || 0,
        region: propertyData.region || "",
        city: propertyData.city || "",
        location: propertyData.location || "",
        discount_price: propertyData.discount_price || null,
        discount_percentage: propertyData.discount_percentage || null,
        number_available: propertyData.number_available || 1,
        is_available: propertyData.is_available !== false,
        is_negotiable: propertyData.is_negotiable || false,
        is_featured: propertyData.is_featured || false,
        is_approved: propertyData.is_approved || false,
        status: propertyData.status !== false,
        facilities_id: propertyData.facilities_id || [],
      });
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error(error.response?.data?.message || "Failed to fetch property details");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFacilityToggle = (facilityId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      facilities_id: prev.facilities_id.includes(parseInt(facilityId))
        ? prev.facilities_id.filter((id: number) => id !== parseInt(facilityId))
        : [...prev.facilities_id, parseInt(facilityId)],
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImageFiles((prev) => [...prev, ...files]);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewVideoFiles((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewVideo = (index: number) => {
    setNewVideoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteExistingImage = async (imageId: number) => {
    try {
      setDeletingImageIds((prev) => [...prev, imageId]);
      await listingImageService.deleteImage(imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Image deleted successfully");
    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    } finally {
      setDeletingImageIds((prev) => prev.filter((id) => id !== imageId));
    }
  };

  const deleteExistingVideo = async (videoId: number) => {
    try {
      setDeletingVideoIds((prev) => [...prev, videoId]);
      await listingVideoService.deleteVideo(videoId);
      setExistingVideos((prev) => prev.filter((vid) => vid.id !== videoId));
      toast.success("Video deleted successfully");
    } catch (error: any) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    } finally {
      setDeletingVideoIds((prev) => prev.filter((id) => id !== videoId));
    }
  };

  const getImageUrl = (image: ListingImage): string => {
    if (image.image_path) {
      return `${process.env.NEXT_PUBLIC_API_URL}/../storage/listing_images/${image.image_path}`;
    }
    return image.url || image.image_url || '';
  };

  const getVideoUrl = (video: ListingVideo): string => {
    if (video.video_url && !video.video_url.startsWith('http')) {
      return `${process.env.NEXT_PUBLIC_API_URL}/../storage/listing_videos/${video.video_url}`;
    }
    return video.url || video.video_url || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!property) return;

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (formData.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    if (formData.facilities_id.length === 0) {
      toast.error("Please select at least one facility");
      return;
    }

    try {
      setIsSaving(true);
      await propertyManagementService.updateProperty(property.id, formData);
      toast.success("Property updated successfully");
      router.push("/admin/properties");
    } catch (error: any) {
      console.error("Error updating property:", error);
      toast.error(error.response?.data?.message || "Failed to update property");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="admin">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10" />
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>

          {/* Form Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
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

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Property</h1>
            <p className="text-muted-foreground">Update property details</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent & Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Agent & Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agent_id">Assigned Agent *</Label>
                <Select
                  value={formData.agent_id?.toString() || ""}
                  onValueChange={(value) => handleInputChange("agent_id", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name} ({agent.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Property title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Detailed description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select
                    value={formData.property_type_id?.toString() || ""}
                    onValueChange={(value) => handleInputChange("property_type_id", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
                    placeholder="Price"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_price">Discount Price</Label>
                  <Input
                    id="discount_price"
                    type="number"
                    value={formData.discount_price || ""}
                    onChange={(e) => handleInputChange("discount_price", e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Discount price"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label htmlFor="discount_percentage">Discount Percentage</Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    value={formData.discount_percentage || ""}
                    onChange={(e) => handleInputChange("discount_percentage", e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Discount %"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="region">Region *</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => handleInputChange("region", e.target.value)}
                    placeholder="Region"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location/Address *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Street address"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability & Status */}
          <Card>
            <CardHeader>
              <CardTitle>Availability & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="number_available">Units Available</Label>
                  <Input
                    id="number_available"
                    type="number"
                    value={formData.number_available}
                    onChange={(e) => handleInputChange("number_available", parseInt(e.target.value))}
                    placeholder="Number of units"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) => handleInputChange("is_available", checked)}
                  />
                  <Label htmlFor="is_available" className="cursor-pointer">
                    Available for booking
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_negotiable"
                    checked={formData.is_negotiable}
                    onCheckedChange={(checked) => handleInputChange("is_negotiable", checked)}
                  />
                  <Label htmlFor="is_negotiable" className="cursor-pointer">
                    Price negotiable
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleInputChange("is_featured", checked)}
                  />
                  <Label htmlFor="is_featured" className="cursor-pointer">
                    Featured property
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_approved"
                    checked={formData.is_approved}
                    onCheckedChange={(checked) => handleInputChange("is_approved", checked)}
                  />
                  <Label htmlFor="is_approved" className="cursor-pointer">
                    Approved
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="status"
                    checked={formData.status}
                    onCheckedChange={(checked) => handleInputChange("status", checked)}
                  />
                  <Label htmlFor="status" className="cursor-pointer">
                    Active
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card>
            <CardHeader>
              <CardTitle>Facilities (Select at least one) *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {facilities.map((facility) => (
                  <div key={facility.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`facility-${facility.id}`}
                      checked={formData.facilities_id.includes(facility.id)}
                      onCheckedChange={() => handleFacilityToggle(facility.id.toString())}
                    />
                    <Label htmlFor={`facility-${facility.id}`} className="cursor-pointer">
                      {facility.name}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-plp-purple hover:bg-plp-purple/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}