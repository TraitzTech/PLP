"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MultiStepForm, type FormStep } from "@/components/ui/multi-step-form";
import { facilitiesService } from "@/services/facilitiesService";
import { propertyTypeService } from "@/services/propertyTypeService";
import { listingService } from "@/services/listingService";
import { listingImageService } from "@/services/listingImageService";
import { listingVideoService } from "@/services/listingVideoService";
import type { Facility, PropertyType, ListingCreateRequest } from "@/services/types";
import { AREA_UNITS, HOUSE_TYPES, ZONING_OPTIONS } from "@/lib/propertyHelpers";

export default function CreatePropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false, false]);

  const [formData, setFormData] = useState<ListingCreateRequest>({
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
    is_approved: false,
    status: true,
    facilities_id: [],
    
    // Purpose flags
    for_rent: false,
    for_purchase: false,
    
    // Address & geolocation
    address: "",
    latitude: null,
    longitude: null,
    
    // Land-specific fields
    land_area: null,
    land_area_unit: "sqm",
    land_dimensions: "",
    zoning: "",
    
    // House-specific fields
    bedrooms: null,
    bathrooms: null,
    floor_area: null,
    floor_area_unit: "sqm",
    year_built: null,
    house_type: "",
    
    // Hotel-specific fields
    rooms_count: null,
    star_rating: null,
    has_restaurant: false,
    has_pool: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsDataLoading(true);
      const [facilitiesData, propertyTypesData] = await Promise.all([
        facilitiesService.getAllFacilities(),
        propertyTypeService.getAllPropertyTypes(),
      ]);

      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);
      setPropertyTypes(Array.isArray(propertyTypesData) ? propertyTypesData : []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load form data");
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleInputChange = (field: keyof ListingCreateRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFacilityToggle = (facilityId: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities_id: prev.facilities_id.includes(facilityId)
        ? prev.facilities_id.filter((id) => id !== facilityId)
        : [...prev.facilities_id, facilityId],
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);

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
    setVideoFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Information
        if (!formData.title.trim()) {
          toast.error("Please enter a property title");
          return false;
        }
        if (!formData.description.trim()) {
          toast.error("Please enter a property description");
          return false;
        }
        if (!formData.property_type_id) {
          toast.error("Please select a property type");
          return false;
        }
        if (!formData.price || formData.price <= 0) {
          toast.error("Please enter a valid price");
          return false;
        }
        if (!formData.for_rent && !formData.for_purchase) {
          toast.error("Please select at least one purpose (rent or purchase)");
          return false;
        }
        return true;
      case 1: // Location
        if (!formData.region.trim() || !formData.city.trim() || !formData.location.trim()) {
          toast.error("Please fill in all required location fields");
          return false;
        }
        return true;
      case 2: // Property-specific fields
        const selectedType = propertyTypes.find(t => t.id === formData.property_type_id);
        const typeName = selectedType?.name.toLowerCase();
        
        if (typeName === "house") {
          if (!formData.bedrooms || formData.bedrooms <= 0) {
            toast.error("Please enter number of bedrooms");
            return false;
          }
          if (!formData.bathrooms || formData.bathrooms <= 0) {
            toast.error("Please enter number of bathrooms");
            return false;
          }
        } else if (typeName === "land") {
          if (!formData.land_area || formData.land_area <= 0) {
            toast.error("Please enter land area");
            return false;
          }
        } else if (typeName === "hotel") {
          if (!formData.rooms_count || formData.rooms_count <= 0) {
            toast.error("Please enter number of rooms");
            return false;
          }
        }
        return true;
      case 3: // Facilities
        if (formData.facilities_id.length === 0) {
          toast.error("Please select at least one facility");
          return false;
        }
        return true;
      case 4: // Media
        return true;
      default:
        return true;
    }
  };

  const handleStepNext = async (): Promise<boolean> => {
    return validateStep(currentStep);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Create the listing
      const response = await listingService.createListing(formData);
      const newListingId = response.data.id;

      toast.success("Property created successfully!");

      // Upload images if any
      if (imageFiles.length > 0) {
        try {
          await listingImageService.uploadImages(newListingId, imageFiles);
          toast.success(`${imageFiles.length} image(s) uploaded successfully`);
        } catch (error: any) {
          console.error("Error uploading images:", error);
          toast.error("Property created but some images failed to upload");
        }
      }

      // Upload videos if any
      if (videoFiles.length > 0) {
        try {
          await listingVideoService.uploadVideos(newListingId, videoFiles);
          toast.success(`${videoFiles.length} video(s) uploaded successfully`);
        } catch (error: any) {
          console.error("Error uploading videos:", error);
          toast.error("Property created but some videos failed to upload");
        }
      }

      // Show notification about admin review
      toast.info(
        "Your property has been submitted. An admin will review it before it becomes public.",
        { duration: 5000 }
      );

      // Redirect to properties list
      router.push("/dashboard/agent/properties");
    } catch (error: any) {
      console.error("Error creating property:", error);
      toast.error(error.response?.data?.message || "Failed to create property");
    } finally {
      setIsLoading(false);
    }
  };

  const steps: FormStep[] = [
    {
      id: "basic",
      title: "Basic Information",
      description: "Property title, description, and pricing",
      isComplete: completedSteps[0],
      content: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Property Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Luxury Villa with Ocean View"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your property in detail..."
              rows={5}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="property_type">Property Type *</Label>
              <Select
                value={formData.property_type_id.toString()}
                onValueChange={(value) => handleInputChange("property_type_id", parseInt(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select property type" />
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
              <Label htmlFor="number_available">Units Available *</Label>
              <Input
                id="number_available"
                type="number"
                min="1"
                value={formData.number_available}
                onChange={(e) => handleInputChange("number_available", parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
                placeholder="0.00"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="discount_price">Discount Price (Optional)</Label>
              <Input
                id="discount_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_price || ""}
                onChange={(e) =>
                  handleInputChange("discount_price", e.target.value ? parseFloat(e.target.value) : null)
                }
                placeholder="0.00"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="discount_percentage">Discount % (Optional)</Label>
              <Input
                id="discount_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage || ""}
                onChange={(e) =>
                  handleInputChange("discount_percentage", e.target.value ? parseFloat(e.target.value) : null)
                }
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "location",
      title: "Location",
      description: "Property location details",
      isComplete: completedSteps[1],
      content: (
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Enter the complete location details of your property to help customers find it easily.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="region">Region *</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                placeholder="e.g., California"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="e.g., Los Angeles"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="location">Location/Address *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Downtown LA"
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Property Availability</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => handleInputChange("is_available", checked)}
                />
                <Label htmlFor="is_available" className="font-normal cursor-pointer">
                  Property is available for booking
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_negotiable"
                  checked={formData.is_negotiable || false}
                  onCheckedChange={(checked) => handleInputChange("is_negotiable", checked)}
                />
                <Label htmlFor="is_negotiable" className="font-normal cursor-pointer">
                  Price is negotiable
                </Label>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "facilities",
      title: "Facilities",
      description: "Select amenities and facilities",
      isComplete: completedSteps[2],
      content: (
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Select at least one facility to better describe your property to potential customers.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {facilities.map((facility) => (
              <div key={facility.id} className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <Checkbox
                  id={`facility-${facility.id}`}
                  checked={formData.facilities_id.includes(facility.id.toString())}
                  onCheckedChange={() => handleFacilityToggle(facility.id.toString())}
                  className="mt-1"
                />
                <Label
                  htmlFor={`facility-${facility.id}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {facility.name}
                </Label>
              </div>
            ))}
          </div>

          {formData.facilities_id.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">{formData.facilities_id.length}</span> facility/amenities selected
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ),
    },
    {
      id: "media",
      title: "Media & Images",
      description: "Upload photos and videos",
      isComplete: completedSteps[3],
      content: (
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              High-quality images and videos help attract more customers. Media is optional but highly recommended.
            </AlertDescription>
          </Alert>

          {/* Images Section */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>Property Images</span>
              {imagePreviews.length > 0 && (
                <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''}
                </span>
              )}
            </h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <Label htmlFor="images" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Click to upload images</p>
                  <p className="text-xs text-gray-500">or drag and drop</p>
                </div>
              </Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="cursor-pointer hidden"
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-md"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Videos Section */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="font-semibold flex items-center gap-2">
              <span>Property Videos (Optional)</span>
              {videoFiles.length > 0 && (
                <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {videoFiles.length} video{videoFiles.length !== 1 ? 's' : ''}
                </span>
              )}
            </h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors">
              <Label htmlFor="videos" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Click to upload videos</p>
                  <p className="text-xs text-gray-500">MP4, WebM, or Ogg format</p>
                </div>
              </Label>
              <Input
                id="videos"
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoSelect}
                className="cursor-pointer hidden"
              />
            </div>

            {videoFiles.length > 0 && (
              <div className="space-y-2">
                {videoFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVideo(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  if (isDataLoading) {
    return (
      <DashboardLayout userType="agent">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Property</h1>
            <p className="text-muted-foreground">
              Add a new property listing to your portfolio. Your property will be reviewed by an admin before becoming public.
            </p>
          </div>
        </div>

        <MultiStepForm
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onNext={handleStepNext}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitButtonText={isLoading ? "Creating Property..." : "Submit Property"}
          showStepIndicator={true}
        />
      </div>
    </DashboardLayout>
  );
}
