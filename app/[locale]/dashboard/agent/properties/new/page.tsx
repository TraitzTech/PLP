"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useTranslations } from "@/components/translation-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Upload, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { FormStep } from "@/components/ui/multi-step-form";
import { LocationPicker } from "@/components/properties/location-picker";
import { facilitiesService } from "@/services/facilitiesService";
import { propertyTypeService } from "@/services/propertyTypeService";
import { listingService } from "@/services/listingService";
import { listingImageService } from "@/services/listingImageService";
import { listingVideoService } from "@/services/listingVideoService";
import { settingsService } from "@/services/settingsService";
import type {
  Facility,
  PropertyType,
  ListingCreateRequest,
} from "@/services/types";
import { AREA_UNITS, HOUSE_TYPES, ZONING_OPTIONS } from "@/lib/propertyHelpers";

export default function CreatePropertyPage() {
  const t = useTranslations();
  const router = useRouter();
  const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [launchRentalsOnly, setLaunchRentalsOnly] = useState(true);
  const [launchSalesEnabled, setLaunchSalesEnabled] = useState(false);
  const [allowedCities, setAllowedCities] = useState<string[]>([]);
  const [enforceCityScope, setEnforceCityScope] = useState(true);

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
    for_rent: false,
    for_purchase: false,
    address: "",
    latitude: null,
    longitude: null,
    land_area: null,
    land_area_unit: "sqm",
    land_dimensions: "",
    zoning: "",
    bedrooms: null,
    bathrooms: null,
    floor_area: null,
    floor_area_unit: "sqm",
    year_built: null,
    house_type: "",
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

      const launchSettings = await settingsService.getPublicSettings([
        "launch_rentals_only",
        "launch_sales_enabled",
        "launch_enforce_city_scope",
        "launch_rollout_cities",
      ]);

      const rentalsOnly = launchSettings.launch_rentals_only !== false;
      const salesEnabled = launchSettings.launch_sales_enabled === true;
      const enforceCity = launchSettings.launch_enforce_city_scope !== false;
      const rolloutCitiesRaw = Array.isArray(
        launchSettings.launch_rollout_cities,
      )
        ? launchSettings.launch_rollout_cities
        : [];
      const rolloutCities = rolloutCitiesRaw
        .map((value) => String(value ?? "").trim())
        .filter(Boolean);

      setFacilities(Array.isArray(facilitiesData) ? facilitiesData : []);
      setPropertyTypes(
        Array.isArray(propertyTypesData)
          ? propertyTypesData.filter(
              (type) => type.status === 1 || type.status === true,
            )
          : [],
      );
      setLaunchRentalsOnly(rentalsOnly);
      setLaunchSalesEnabled(salesEnabled);
      setEnforceCityScope(enforceCity);
      setAllowedCities(rolloutCities);
      if (rentalsOnly) {
        setFormData((prev) => ({
          ...prev,
          for_rent: true,
          for_purchase: false,
        }));
      }
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

  const handleFacilityToggle = (facilityId: number) => {
    setFormData((prev) => ({
      ...prev,
      facilities_id: prev.facilities_id.includes(facilityId)
        ? prev.facilities_id.filter((id) => id !== facilityId)
        : [...prev.facilities_id, facilityId],
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        toast.error(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    if (files.length === 0) return;

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

  const getSelectedPropertyTypeName = (): string => {
    const selectedType = propertyTypes.find(
      (t) => t.id === formData.property_type_id,
    );
    return selectedType?.name.toLowerCase() || "";
  };

  const areaUnits = AREA_UNITS.map((unit) => ({
    ...unit,
    label: t(
      `dashboards.agent.properties.options.areaUnits.${unit.value}`,
      unit.label,
    ),
  }));

  const houseTypes = HOUSE_TYPES.map((type) => ({
    ...type,
    label: t(
      `dashboards.agent.properties.options.houseTypes.${type.value}`,
      type.label,
    ),
  }));

  const zoningOptions = ZONING_OPTIONS.map((zone) => ({
    ...zone,
    label: t(
      `dashboards.agent.properties.options.zoning.${zone.value}`,
      zone.label,
    ),
  }));

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Information
        if (!formData.title.trim()) {
          toast.error(
            t(
              "dashboards.agent.properties.validation.titleRequired",
              "Please enter a property title",
            ),
          );
          return false;
        }
        if (!formData.description.trim()) {
          toast.error(
            t(
              "dashboards.agent.properties.validation.descriptionRequired",
              "Please enter a property description",
            ),
          );
          return false;
        }
        if (!formData.property_type_id) {
          toast.error(
            t(
              "dashboards.agent.properties.validation.typeRequired",
              "Please select a property type",
            ),
          );
          return false;
        }
        if (!formData.price || formData.price <= 0) {
          toast.error(
            t(
              "dashboards.agent.properties.validation.priceRequired",
              "Please enter a valid price",
            ),
          );
          return false;
        }
        if (!formData.for_rent && !formData.for_purchase) {
          toast.error(
            t(
              "dashboards.agent.properties.validation.purposeRequired",
              "Please select at least one purpose (rent or purchase)",
            ),
          );
          return false;
        }
        return true;
      case 1: // Location
        if (
          !formData.region.trim() ||
          !formData.city.trim() ||
          !formData.location.trim()
        ) {
          toast.error(
            t(
              "dashboards.agent.properties.validation.locationRequired",
              "Please fill in all required location fields",
            ),
          );
          return false;
        }
        return true;
      case 2: // Property-specific fields
        const typeName = getSelectedPropertyTypeName();

        if (typeName === "house") {
          if (!formData.bedrooms || formData.bedrooms <= 0) {
            toast.error(
              t(
                "dashboards.agent.properties.validation.bedroomsRequired",
                "Please enter number of bedrooms",
              ),
            );
            return false;
          }
          if (!formData.bathrooms || formData.bathrooms <= 0) {
            toast.error(
              t(
                "dashboards.agent.properties.validation.bathroomsRequired",
                "Please enter number of bathrooms",
              ),
            );
            return false;
          }
        } else if (typeName === "land") {
          if (!formData.land_area || formData.land_area <= 0) {
            toast.error(
              t(
                "dashboards.agent.properties.validation.landAreaRequired",
                "Please enter land area",
              ),
            );
            return false;
          }
        } else if (typeName === "hotel") {
          if (!formData.rooms_count || formData.rooms_count <= 0) {
            toast.error(
              t(
                "dashboards.agent.properties.validation.roomsRequired",
                "Please enter number of rooms",
              ),
            );
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

  const validateAll = () => {
    const stepsToValidate = [0, 1, 2, 3];
    for (const step of stepsToValidate) {
      if (!validateStep(step)) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      return;
    }
    try {
      setIsLoading(true);

      const response = await listingService.createListing(formData);
      const newListingId = response.data.id;

      toast.success(
        t(
          "dashboards.agent.properties.success.created",
          "Property created successfully!",
        ),
      );

      // Upload images
      if (imageFiles.length > 0) {
        try {
          await listingImageService.uploadImages(newListingId, imageFiles);
          toast.success(
            t(
              "dashboards.agent.properties.success.imagesUploaded",
              "{count} image(s) uploaded successfully",
            ).replace("{count}", String(imageFiles.length)),
          );
        } catch (imageError: any) {
          console.error("Image upload error:", imageError);

          if (imageError.response?.status === 403) {
            toast.error(
              t(
                "dashboards.agent.properties.errors.imagePermission",
                "You don't have permission to upload images. Please ensure your agent account is approved.",
              ),
            );
          } else {
            toast.error(
              imageError?.message ||
                imageError.response?.data?.message ||
                t(
                  "dashboards.agent.properties.errors.uploadImages",
                  "Failed to upload images",
                ),
            );
          }
          // Don't stop the flow - property was created successfully
        }
      }

      if (videoFiles.length > 0) {
        toast.info(
          t(
            "dashboards.agent.properties.info.uploadingVideos",
            "Uploading videos in the background... you can continue browsing.",
          ),
          { duration: 5000 },
        );
        listingVideoService
          .uploadVideos(newListingId, videoFiles)
          .then(() => {
            toast.success(
              t(
                "dashboards.agent.properties.success.videosUploaded",
                "{count} video(s) uploaded successfully",
              ).replace("{count}", String(videoFiles.length)),
            );
          })
          .catch((error: any) => {
            console.error("Error uploading videos:", error);
            toast.error(
              error?.message ||
                t(
                  "dashboards.agent.properties.errors.uploadVideos",
                  "Some videos failed to upload. You can retry from Edit Property.",
                ),
            );
          });
      }

      toast.info(
        t(
          "dashboards.agent.properties.info.submitted",
          "Your property has been submitted. An admin will review it before it becomes public.",
        ),
        { duration: 5000 },
      );

      router.push("/dashboard/agent/properties");
    } catch (error: any) {
      console.error("Error creating property:", error);
      const errors = error.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        errors.forEach((err) => toast.error(err));
      } else {
        toast.error(
          error?.message ||
            error.response?.data?.message ||
            t(
              "dashboards.agent.properties.errors.createFailed",
              "Failed to create property",
            ),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderPropertyTypeFields = () => {
    const typeName = getSelectedPropertyTypeName();

    if (typeName === "house") {
      return (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">
            {t(
              "dashboards.agent.properties.sections.houseDetails",
              "House Details",
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms || ""}
                onChange={(e) =>
                  handleInputChange(
                    "bedrooms",
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                placeholder="e.g., 3"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                value={formData.bathrooms || ""}
                onChange={(e) =>
                  handleInputChange(
                    "bathrooms",
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                placeholder="e.g., 2"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="floor_area">
                {t(
                  "dashboards.agent.properties.labels.floorArea",
                  "Floor Area",
                )}
              </Label>
              <Input
                id="floor_area"
                type="number"
                min="0"
                step="0.01"
                value={formData.floor_area || ""}
                onChange={(e) =>
                  handleInputChange(
                    "floor_area",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                placeholder={t(
                  "dashboards.agent.properties.placeholders.floorArea",
                  "e.g., 120.5",
                )}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="floor_area_unit">
                {t("dashboards.agent.properties.labels.areaUnit", "Area Unit")}
              </Label>
              <Select
                value={formData.floor_area_unit || "sqm"}
                onValueChange={(value) =>
                  handleInputChange("floor_area_unit", value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {areaUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="house_type">
                {t(
                  "dashboards.agent.properties.labels.houseType",
                  "House Type",
                )}
              </Label>
              <Select
                value={formData.house_type || ""}
                onValueChange={(value) =>
                  handleInputChange("house_type", value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue
                    placeholder={t(
                      "dashboards.agent.properties.placeholders.selectType",
                      "Select type",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {houseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year_built">
                {t(
                  "dashboards.agent.properties.labels.yearBuilt",
                  "Year Built",
                )}
              </Label>
              <Input
                id="year_built"
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                value={formData.year_built || ""}
                onChange={(e) =>
                  handleInputChange(
                    "year_built",
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                placeholder={t(
                  "dashboards.agent.properties.placeholders.yearBuilt",
                  "e.g., 2020",
                )}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      );
    }

    if (typeName === "land") {
      return (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">
            {t(
              "dashboards.agent.properties.sections.landDetails",
              "Land Details",
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="land_area">
                {t("dashboards.agent.properties.labels.landArea", "Land Area")}{" "}
                *
              </Label>
              <Input
                id="land_area"
                type="number"
                min="0"
                step="0.01"
                value={formData.land_area || ""}
                onChange={(e) =>
                  handleInputChange(
                    "land_area",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                placeholder={t(
                  "dashboards.agent.properties.placeholders.landArea",
                  "e.g., 1500",
                )}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="land_area_unit">
                {t("dashboards.agent.properties.labels.areaUnit", "Area Unit")}
              </Label>
              <Select
                value={formData.land_area_unit || "sqm"}
                onValueChange={(value) =>
                  handleInputChange("land_area_unit", value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AREA_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="land_dimensions">
              {t(
                "dashboards.agent.properties.labels.landDimensions",
                "Land Dimensions",
              )}
            </Label>
            <Input
              id="land_dimensions"
              value={formData.land_dimensions || ""}
              onChange={(e) =>
                handleInputChange("land_dimensions", e.target.value)
              }
              placeholder={t(
                "dashboards.agent.properties.placeholders.landDimensions",
                "e.g., 30m x 50m",
              )}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="zoning">
              {t("dashboards.agent.properties.labels.zoning", "Zoning")}
            </Label>
            <Select
              value={formData.zoning || ""}
              onValueChange={(value) => handleInputChange("zoning", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue
                  placeholder={t(
                    "dashboards.agent.properties.placeholders.selectZoning",
                    "Select zoning",
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {zoningOptions.map((zone) => (
                  <SelectItem key={zone.value} value={zone.value}>
                    {zone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    if (typeName === "hotel") {
      return (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg">
            {t(
              "dashboards.agent.properties.sections.hotelDetails",
              "Hotel Details",
            )}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rooms_count">
                {t(
                  "dashboards.agent.properties.labels.roomsCount",
                  "Number of Rooms",
                )}{" "}
                *
              </Label>
              <Input
                id="rooms_count"
                type="number"
                min="1"
                value={formData.rooms_count || ""}
                onChange={(e) =>
                  handleInputChange(
                    "rooms_count",
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
                placeholder={t(
                  "dashboards.agent.properties.placeholders.roomsCount",
                  "e.g., 45",
                )}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="star_rating">
                {t(
                  "dashboards.agent.properties.labels.starRating",
                  "Star Rating",
                )}
              </Label>
              <Select
                value={formData.star_rating?.toString() || ""}
                onValueChange={(value) =>
                  handleInputChange(
                    "star_rating",
                    value ? parseInt(value) : null,
                  )
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue
                    placeholder={t(
                      "dashboards.agent.properties.placeholders.selectRating",
                      "Select rating",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating}{" "}
                      {t("dashboards.agent.properties.labels.star", "Star")}
                      {rating > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">
              {t(
                "dashboards.agent.properties.sections.hotelAmenities",
                "Hotel Amenities",
              )}
            </h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_restaurant"
                checked={formData.has_restaurant || false}
                onCheckedChange={(checked) =>
                  handleInputChange("has_restaurant", checked)
                }
              />
              <Label
                htmlFor="has_restaurant"
                className="font-normal cursor-pointer"
              >
                {t(
                  "dashboards.agent.properties.labels.hasRestaurant",
                  "Has Restaurant",
                )}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_pool"
                checked={formData.has_pool || false}
                onCheckedChange={(checked) =>
                  handleInputChange("has_pool", checked)
                }
              />
              <Label htmlFor="has_pool" className="font-normal cursor-pointer">
                {t(
                  "dashboards.agent.properties.labels.hasPool",
                  "Has Swimming Pool",
                )}
              </Label>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-8 text-gray-500">
        <p>
          {t(
            "dashboards.agent.properties.empty.selectType",
            "Select a property type to see specific fields",
          )}
        </p>
      </div>
    );
  };

  const steps: FormStep[] = [
    {
      id: "basic",
      title: t(
        "dashboards.agent.properties.steps.basic.title",
        "Basic Information",
      ),
      description: t(
        "dashboards.agent.properties.steps.basic.description",
        "Property title, description, and pricing",
      ),
      content: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">
              {t("dashboards.agent.properties.labels.title", "Property Title")}{" "}
              *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder={t(
                "dashboards.agent.properties.placeholders.title",
                "e.g., Luxury Villa with Ocean View",
              )}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">
              {t(
                "dashboards.agent.properties.labels.description",
                "Description",
              )}{" "}
              *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={t(
                "dashboards.agent.properties.placeholders.description",
                "Describe your property in detail...",
              )}
              rows={5}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="property_type">
                {t(
                  "dashboards.agent.properties.labels.propertyType",
                  "Property Type",
                )}{" "}
                *
              </Label>
              <Select
                value={formData.property_type_id.toString()}
                onValueChange={(value) =>
                  handleInputChange("property_type_id", parseInt(value))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue
                    placeholder={t(
                      "dashboards.agent.properties.placeholders.selectPropertyType",
                      "Select property type",
                    )}
                  />
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
              <Label htmlFor="number_available">
                {t(
                  "dashboards.agent.properties.labels.unitsAvailable",
                  "Units Available",
                )}{" "}
                *
              </Label>
              <Input
                id="number_available"
                type="number"
                min="1"
                value={formData.number_available}
                onChange={(e) =>
                  handleInputChange(
                    "number_available",
                    parseInt(e.target.value),
                  )
                }
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">
              {t("dashboards.agent.properties.labels.purpose", "Purpose")} *
            </h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="for_rent"
                  checked={formData.for_rent || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("for_rent", checked)
                  }
                  disabled={launchRentalsOnly}
                />
                <Label
                  htmlFor="for_rent"
                  className="font-normal cursor-pointer"
                >
                  {t("dashboards.agent.properties.labels.forRent", "For Rent")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="for_purchase"
                  checked={formData.for_purchase || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("for_purchase", checked)
                  }
                  disabled={launchRentalsOnly || !launchSalesEnabled}
                />
                <Label
                  htmlFor="for_purchase"
                  className="font-normal cursor-pointer"
                >
                  {t(
                    "dashboards.agent.properties.labels.forPurchase",
                    "For Sale/Purchase",
                  )}
                </Label>
              </div>
            </div>
            {launchRentalsOnly && (
              <p className="text-sm text-amber-700">
                {t(
                  "dashboards.agent.properties.info.salesDisabledLaunch",
                  "Sales are disabled for launch. Listings must be rental.",
                )}
              </p>
            )}
            {!launchSalesEnabled && !launchRentalsOnly && (
              <p className="text-sm text-amber-700">
                {t(
                  "dashboards.agent.properties.info.salesDisabledAdmin",
                  "Sales are currently disabled by admin settings.",
                )}
              </p>
            )}
            {formData.for_rent && !formData.for_purchase && (
              <p className="text-sm text-gray-600">
                {t(
                  "dashboards.agent.properties.info.monthlyRent",
                  "Price will be shown as monthly rent",
                )}
              </p>
            )}
            {formData.for_purchase && !formData.for_rent && (
              <p className="text-sm text-gray-600">
                {t(
                  "dashboards.agent.properties.info.purchasePrice",
                  "Price will be shown as purchase price",
                )}
              </p>
            )}
            {formData.for_rent && formData.for_purchase && (
              <p className="text-sm text-gray-600">
                {t(
                  "dashboards.agent.properties.info.bothPurposes",
                  "Property available for both rent and purchase",
                )}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">
                {t("dashboards.agent.properties.labels.price", "Price")} *{" "}
                {formData.for_rent &&
                  t("dashboards.agent.properties.labels.monthly", "(Monthly)")}
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  handleInputChange("price", parseFloat(e.target.value))
                }
                placeholder={t(
                  "dashboards.agent.properties.placeholders.price",
                  "0.00",
                )}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="discount_price">
                {t(
                  "dashboards.agent.properties.labels.discountPrice",
                  "Discount Price (Optional)",
                )}
              </Label>
              <Input
                id="discount_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_price || ""}
                onChange={(e) =>
                  handleInputChange(
                    "discount_price",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                placeholder={t(
                  "dashboards.agent.properties.placeholders.price",
                  "0.00",
                )}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="discount_percentage">
                {t(
                  "dashboards.agent.properties.labels.discountPercent",
                  "Discount % (Optional)",
                )}
              </Label>
              <Input
                id="discount_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.discount_percentage || ""}
                onChange={(e) =>
                  handleInputChange(
                    "discount_percentage",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                placeholder={t(
                  "dashboards.agent.properties.placeholders.discountPercent",
                  "0",
                )}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "location",
      title: t("dashboards.agent.properties.steps.location.title", "Location"),
      description: t(
        "dashboards.agent.properties.steps.location.description",
        "Property location details",
      ),
      content: (
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t(
                "dashboards.agent.properties.info.locationHelp",
                "Enter the complete location details of your property to help customers find it easily.",
              )}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="region">
                {t("dashboards.agent.properties.labels.region", "Region")} *
              </Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                placeholder={t(
                  "dashboards.agent.properties.placeholders.region",
                  "e.g., California",
                )}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="city">
                {t("dashboards.agent.properties.labels.city", "City")} *
              </Label>
              {allowedCities.length > 0 ? (
                <>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => handleInputChange("city", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue
                        placeholder={t(
                          "dashboards.agent.properties.placeholders.selectCity",
                          "Select a city",
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {enforceCityScope
                      ? t(
                          "dashboards.agent.properties.info.cityRestricted",
                          "City options are restricted by admin settings.",
                        )
                      : t(
                          "dashboards.agent.properties.info.citySuggested",
                          "City options are suggested from admin settings.",
                        )}
                  </p>
                </>
              ) : (
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder={t(
                    "dashboards.agent.properties.placeholders.city",
                    "e.g., Douala",
                  )}
                  className="mt-1"
                />
              )}
            </div>

            <div>
              <Label htmlFor="location">
                {t(
                  "dashboards.agent.properties.labels.location",
                  "Location/Neighborhood",
                )}{" "}
                *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder={t(
                  "dashboards.agent.properties.placeholders.location",
                  "e.g., Downtown LA",
                )}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">
              {t(
                "dashboards.agent.properties.labels.address",
                "Full Address (Optional)",
              )}
            </Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder={t(
                "dashboards.agent.properties.placeholders.address",
                "e.g., 123 Main Street, Apt 4B",
              )}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              {t(
                "dashboards.agent.properties.info.mapAddress",
                "This will be used to show the property on a map",
              )}
            </p>
          </div>

          <div>
            <Label>
              {t(
                "dashboards.agent.properties.labels.pickLocation",
                "Pick Location from Map",
              )}
            </Label>
            <p className="text-xs text-gray-500 mb-3">
              {t(
                "dashboards.agent.properties.info.pickLocation",
                "Search for a location or click on the map to automatically get the coordinates",
              )}
            </p>
            <LocationPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              address={formData.address}
              onLocationSelect={(lat, lng, addr) => {
                handleInputChange("latitude", lat);
                handleInputChange("longitude", lng);
                if (addr && !formData.address) {
                  handleInputChange("address", addr);
                }
              }}
              height="400px"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
            <div>
              <Label htmlFor="latitude">
                {t("dashboards.agent.properties.labels.latitude", "Latitude")}
              </Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude || ""}
                onChange={(e) =>
                  handleInputChange(
                    "latitude",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                placeholder={t(
                  "dashboards.agent.properties.placeholders.latitude",
                  "e.g., 34.0522",
                )}
                className="mt-1"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="longitude">
                {t("dashboards.agent.properties.labels.longitude", "Longitude")}
              </Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude || ""}
                onChange={(e) =>
                  handleInputChange(
                    "longitude",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                placeholder={t(
                  "dashboards.agent.properties.placeholders.longitude",
                  "e.g., -118.2437",
                )}
                className="mt-1"
                disabled
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">
              {t(
                "dashboards.agent.properties.sections.availability",
                "Property Availability",
              )}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_available", checked)
                  }
                />
                <Label
                  htmlFor="is_available"
                  className="font-normal cursor-pointer"
                >
                  {t(
                    "dashboards.agent.properties.labels.availableForBooking",
                    "Property is available for booking",
                  )}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_negotiable"
                  checked={formData.is_negotiable || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_negotiable", checked)
                  }
                />
                <Label
                  htmlFor="is_negotiable"
                  className="font-normal cursor-pointer"
                >
                  {t(
                    "dashboards.agent.properties.labels.negotiable",
                    "Price is negotiable",
                  )}
                </Label>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "property-details",
      title: t(
        "dashboards.agent.properties.steps.details.title",
        "Property Details",
      ),
      description: t(
        "dashboards.agent.properties.steps.details.description",
        "Property type-specific information",
      ),
      content: (
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t(
                "dashboards.agent.properties.info.typeSpecific",
                "Provide specific details about your",
              )}{" "}
              {getSelectedPropertyTypeName()}{" "}
              {t("dashboards.agent.properties.info.property", "property.")}
            </AlertDescription>
          </Alert>

          {formData.property_type_id ? (
            renderPropertyTypeFields()
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>
                {t(
                  "dashboards.agent.properties.empty.selectPreviousType",
                  "Please select a property type in the previous step",
                )}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "facilities",
      title: t(
        "dashboards.agent.properties.steps.facilities.title",
        "Facilities",
      ),
      description: t(
        "dashboards.agent.properties.steps.facilities.description",
        "Select amenities and facilities",
      ),
      content: (
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t(
                "dashboards.agent.properties.info.facilitiesHelp",
                "Select at least one facility to better describe your property to potential customers.",
              )}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {facilities.map((facility) => (
              <div
                key={facility.id}
                className="flex items-start space-x-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={`facility-${facility.id}`}
                  checked={formData.facilities_id.includes(facility.id)}
                  onCheckedChange={() => handleFacilityToggle(facility.id)}
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
                  <span className="font-semibold">
                    {formData.facilities_id.length}
                  </span>{" "}
                  {t(
                    "dashboards.agent.properties.info.facilityCount",
                    "facility/amenities selected",
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ),
    },
    {
      id: "media",
      title: t(
        "dashboards.agent.properties.steps.media.title",
        "Media & Images",
      ),
      description: t(
        "dashboards.agent.properties.steps.media.description",
        "Upload photos and videos",
      ),
      content: (
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t(
                "dashboards.agent.properties.info.mediaHelp",
                "High-quality images and videos help attract more customers. Media is optional but highly recommended.",
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span>
                {t(
                  "dashboards.agent.properties.sections.images",
                  "Property Images",
                )}
              </span>
              {imagePreviews.length > 0 && (
                <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {imagePreviews.length}{" "}
                  {t("dashboards.agent.properties.labels.image", "image")}
                  {imagePreviews.length !== 1
                    ? t("dashboards.agent.properties.labels.pluralSuffix", "s")
                    : ""}
                </span>
              )}
            </h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
              <Label htmlFor="images" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    {t(
                      "dashboards.agent.properties.actions.uploadImages",
                      "Click to upload images",
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t(
                      "dashboards.agent.properties.actions.dragAndDrop",
                      "or drag and drop",
                    )}
                  </p>
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

          <div className="space-y-4 border-t pt-6">
            <h3 className="font-semibold flex items-center gap-2">
              <span>
                {t(
                  "dashboards.agent.properties.sections.videos",
                  "Virtual Tour Videos (Optional)",
                )}
              </span>
              {videoFiles.length > 0 && (
                <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {videoFiles.length}{" "}
                  {t("dashboards.agent.properties.labels.video", "video")}{" "}
                  {videoFiles.length !== 1
                    ? t("dashboards.agent.properties.labels.pluralSuffix", "s")
                    : ""}
                </span>
              )}
            </h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors">
              <Label htmlFor="videos" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    {t(
                      "dashboards.agent.properties.actions.uploadVideos",
                      "Click to upload virtual tour videos",
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t(
                      "dashboards.agent.properties.info.videoFormats",
                      "Use short walkthrough or aerial clips (MP4, WebM, Ogg)",
                    )}
                  </p>
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
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200"
                  >
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
            <h1 className="text-3xl font-bold tracking-tight">
              {t(
                "dashboards.agent.properties.pageTitle",
                "Create New Property",
              )}
            </h1>
            <p className="text-muted-foreground">
              {t(
                "dashboards.agent.properties.pageSubtitle",
                "Add a new property listing to your portfolio. Your property will be reviewed by an admin before becoming public.",
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {steps.map((step) => (
            <Card key={step.id}>
              <CardHeader>
                <CardTitle>{step.title}</CardTitle>
                {step.description ? (
                  <CardDescription>{step.description}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-6">{step.content}</CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isLoading
                ? t(
                    "dashboards.agent.properties.submitting",
                    "Creating Property...",
                  )
                : t("dashboards.agent.properties.submit", "Submit Property")}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
