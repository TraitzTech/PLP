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
import { userManagementService } from "@/services/userManagementService";
import { propertyTypeService } from "@/services/propertyTypeService";
import { facilitiesService } from "@/services/facilitiesService";
import { Badge } from "@/components/ui/badge";
import type { AdminProperty, User, PropertyType, Facility, ListingImage, ListingVideo } from "@/services/types";
import { listingImageService } from "@/services/listingImageService";
import { listingVideoService } from "@/services/listingVideoService";

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
    address: "",
    latitude: "",
    longitude: "",
    discount_price: null,
    discount_percentage: null,
    number_available: 1,
    is_available: true,
    is_negotiable: false,
    is_featured: false,
    is_approved: true,
    status: "available",
    facilities_id: [],
    // Property details
    bedrooms: 0,
    bathrooms: 0,
    floor_area: 0,
    floor_area_unit: "sqm",
    land_area: 0,
    land_area_unit: "sqm",
    year_built: new Date().getFullYear(),
    rooms_count: 0,
    star_rating: 0,
    // Property purpose
    for_rent: false,
    for_purchase: false,
    // Hotel-specific
    has_restaurant: false,
    has_pool: false,
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

      // Fetch agents - handle paginated response
      const agentsRes = await userManagementService.getAllUsers({ user_type: "agent", per_page: 100 });
      const agentsArray = agentsRes?.data?.data ? agentsRes.data.data : (Array.isArray(agentsRes?.data) ? agentsRes.data : []);
      setAgents(agentsArray);

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

      // Helper to normalize boolean values
      const normalizeBoolean = (value: any): boolean => {
        if (typeof value === "boolean") return value;
        if (typeof value === "number") return value !== 0;
        if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
        return false;
      };

      const prop = propertyData as any;

      // Set form data
      setFormData({
        agent_id: prop.agent_id || 0,
        title: prop.title || "",
        description: prop.description || "",
        property_type_id: prop.property_type_id || 0,
        price: prop.price || 0,
        region: prop.region || "",
        city: prop.city || "",
        location: prop.location || "",
        address: prop.address || "",
        latitude: prop.latitude || "",
        longitude: prop.longitude || "",
        discount_price: prop.discount_price || null,
        discount_percentage: prop.discount_percentage || null,
        number_available: prop.number_available || 1,
        is_available: prop.is_available !== false,
        is_negotiable: prop.is_negotiable || false,
        is_featured: prop.is_featured || false,
        is_approved: prop.is_approved || false,
        status: prop.status || "available",
        facilities_id: prop.facilities?.map((f: any) => f.id) || [],
        bedrooms: prop.bedrooms || 0,
        bathrooms: prop.bathrooms || 0,
        floor_area: prop.floor_area || 0,
        floor_area_unit: prop.floor_area_unit || "sqm",
        land_area: prop.land_area || 0,
        land_area_unit: prop.land_area_unit || "sqm",
        year_built: prop.year_built || new Date().getFullYear(),
        rooms_count: prop.rooms_count || 0,
        star_rating: prop.star_rating || 0,
        for_rent: normalizeBoolean(prop.for_rent),
        for_purchase: normalizeBoolean(prop.for_purchase),
        has_restaurant: prop.has_restaurant || false,
        has_pool: prop.has_pool || false,
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
      await propertyManagementService.deletePropertyImage(imageId);
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
      await propertyManagementService.deletePropertyVideo(videoId);
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
      
      // Update property details
      await propertyManagementService.updateProperty(property.id, formData);
      
      // Upload new images if any
      if (newImageFiles.length > 0) {
        try {
          await propertyManagementService.uploadPropertyImages(property.id, newImageFiles);
          toast.success("Images uploaded successfully");
        } catch (error) {
          console.error("Error uploading images:", error);
          toast.error("Property updated but failed to upload some images");
        }
      }

      // Upload new videos if any
      if (newVideoFiles.length > 0) {
        try {
          await propertyManagementService.uploadPropertyVideos(property.id, newVideoFiles);
          toast.success("Videos uploaded successfully");
        } catch (error) {
          console.error("Error uploading videos:", error);
          toast.error("Property updated but failed to upload some videos");
        }
      }

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address">Address (Full)</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Complete address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    placeholder="e.g., 3.8667"
                    step="0.0001"
                  />
                </div>

                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    placeholder="e.g., 11.5167"
                    step="0.0001"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange("bedrooms", parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange("bathrooms", parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="year_built">Year Built</Label>
                  <Input
                    id="year_built"
                    type="number"
                    value={formData.year_built}
                    onChange={(e) => handleInputChange("year_built", parseInt(e.target.value) || new Date().getFullYear())}
                    placeholder={new Date().getFullYear().toString()}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <Label htmlFor="star_rating">Star Rating</Label>
                  <Input
                    id="star_rating"
                    type="number"
                    value={formData.star_rating}
                    onChange={(e) => handleInputChange("star_rating", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    max="5"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="floor_area">Floor Area</Label>
                    <Input
                      id="floor_area"
                      type="number"
                      value={formData.floor_area}
                      onChange={(e) => handleInputChange("floor_area", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="floor_area_unit">Unit</Label>
                    <Select value={formData.floor_area_unit} onValueChange={(value) => handleInputChange("floor_area_unit", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sqm">Square Meters</SelectItem>
                        <SelectItem value="sqft">Square Feet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="land_area">Land Area</Label>
                    <Input
                      id="land_area"
                      type="number"
                      value={formData.land_area}
                      onChange={(e) => handleInputChange("land_area", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="land_area_unit">Unit</Label>
                    <Select value={formData.land_area_unit} onValueChange={(value) => handleInputChange("land_area_unit", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sqm">Square Meters</SelectItem>
                        <SelectItem value="sqft">Square Feet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rooms_count">Total Rooms (Hotel)</Label>
                  <Input
                    id="rooms_count"
                    type="number"
                    value={formData.rooms_count}
                    onChange={(e) => handleInputChange("rooms_count", parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="flex items-end">
                  <div className="space-y-2 flex-1">
                    <Label>Hotel Amenities</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="has_restaurant"
                          checked={formData.has_restaurant}
                          onCheckedChange={(checked) => handleInputChange("has_restaurant", checked)}
                        />
                        <Label htmlFor="has_restaurant" className="cursor-pointer text-sm">
                          Restaurant
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="has_pool"
                          checked={formData.has_pool}
                          onCheckedChange={(checked) => handleInputChange("has_pool", checked)}
                        />
                        <Label htmlFor="has_pool" className="cursor-pointer text-sm">
                          Swimming Pool
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Purpose */}
          <Card>
            <CardHeader>
              <CardTitle>Property Purpose</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="for_rent"
                  checked={formData.for_rent}
                  onCheckedChange={(checked) => handleInputChange("for_rent", checked)}
                />
                <Label htmlFor="for_rent" className="cursor-pointer">
                  Available for Rent
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="for_purchase"
                  checked={formData.for_purchase}
                  onCheckedChange={(checked) => handleInputChange("for_purchase", checked)}
                />
                <Label htmlFor="for_purchase" className="cursor-pointer">
                  Available for Purchase
                </Label>
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

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || "available"}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
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

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Current Images ({existingImages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(image)}
                          alt="Property"
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteExistingImage(image.id)}
                        disabled={deletingImageIds.includes(image.id)}
                      >
                        {deletingImageIds.includes(image.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload New Images */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newImages" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-plp-purple transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload images</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
                  </div>
                  <Input
                    id="newImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </Label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeNewImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Badge className="absolute bottom-2 left-2 bg-green-600">New</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Videos */}
          {existingVideos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Current Videos ({existingVideos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {existingVideos.map((video) => (
                    <div key={video.id} className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                        <video
                          src={getVideoUrl(video)}
                          controls
                          className="w-full h-full object-cover"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteExistingVideo(video.id)}
                        disabled={deletingVideoIds.includes(video.id)}
                      >
                        {deletingVideoIds.includes(video.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload New Videos */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Videos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newVideos" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-plp-purple transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Click to upload videos</p>
                    <p className="text-xs text-gray-400 mt-1">MP4, WebM up to 50MB each</p>
                  </div>
                  <Input
                    id="newVideos"
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoSelect}
                    className="hidden"
                  />
                </Label>
              </div>

              {newVideoFiles.length > 0 && (
                <div className="space-y-2">
                  {newVideoFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-600">New</Badge>
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeNewVideo(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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