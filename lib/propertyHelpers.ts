import { AdminProperty, Listing, PropertyType } from "@/services/types";

/**
 * Get property type name from property type object or ID
 */
export function getPropertyTypeName(propertyType?: PropertyType | number): string {
  if (!propertyType) return "Unknown";
  if (typeof propertyType === "number") return "Unknown";
  return propertyType.name;
}

/**
 * Check if property is a house
 */
export function isHouseProperty(property: AdminProperty | Listing): boolean {
  const typeName = getPropertyTypeName(property.property_type);
  return typeName.toLowerCase() === "house";
}

/**
 * Check if property is a hotel
 */
export function isHotelProperty(property: AdminProperty | Listing): boolean {
  const typeName = getPropertyTypeName(property.property_type);
  return typeName.toLowerCase() === "hotel";
}

/**
 * Check if property is land
 */
export function isLandProperty(property: AdminProperty | Listing): boolean {
  const typeName = getPropertyTypeName(property.property_type);
  return typeName.toLowerCase() === "land";
}

/**
 * Get property type specific summary text for cards
 */
export function getPropertyTypeSummary(property: AdminProperty | Listing): string {
  if (isHouseProperty(property)) {
    const parts: string[] = [];
    if (property.bedrooms) parts.push(`${property.bedrooms} bd`);
    if (property.bathrooms) parts.push(`${property.bathrooms} ba`);
    if (property.floor_area) {
      parts.push(`${property.floor_area} ${property.floor_area_unit || "sqm"}`);
    }
    return parts.join(" • ");
  }
  
  if (isLandProperty(property)) {
    const parts: string[] = [];
    if (property.land_area) {
      parts.push(`${property.land_area} ${property.land_area_unit || "sqm"}`);
    }
    if (property.land_dimensions) parts.push(property.land_dimensions);
    return parts.join(" • ");
  }
  
  if (isHotelProperty(property)) {
    const parts: string[] = [];
    if (property.rooms_count) parts.push(`${property.rooms_count} rooms`);
    if (property.star_rating) parts.push(`${property.star_rating}★`);
    if (property.has_pool) parts.push("Pool");
    if (property.has_restaurant) parts.push("Restaurant");
    return parts.join(" • ");
  }
  
  return "";
}

/**
 * Normalize boolean value - handles both boolean and numeric (0, 1) values
 */
function normalizeBoolean(value: any): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
  return false;
}

/**
 * Get purpose badges for property
 */
export function getPropertyPurposeBadges(property: AdminProperty | Listing): string[] {
  const badges: string[] = [];
  const for_rent = normalizeBoolean(property.for_rent);
  const for_purchase = normalizeBoolean(property.for_purchase);
  
  if (for_rent) badges.push("For Rent");
  if (for_purchase) badges.push("For Sale");
  return badges;
}

/**
 * Get price label based on purpose
 */
export function getPriceLabel(property: AdminProperty | Listing): string {
  const for_rent = normalizeBoolean(property.for_rent);
  const for_purchase = normalizeBoolean(property.for_purchase);
  
  if (for_rent && !for_purchase) return "/month";
  if (for_purchase && !for_rent) return "";
  if (for_rent && for_purchase) return "/month (or purchase)";
  return "";
}

/**
 * Get detailed price context for property details page
 */
export function getPriceContext(property: AdminProperty | Listing): {
  label: string;
  unit: string;
  description: string;
} {
  const for_rent = normalizeBoolean(property.for_rent);
  const for_purchase = normalizeBoolean(property.for_purchase);
  
  if (for_rent && !for_purchase) {
    return {
      label: "/month",
      unit: "per month",
      description: "This property is available for rent"
    };
  }
  if (for_purchase && !for_rent) {
    return {
      label: "",
      unit: "total price",
      description: "This property is available for purchase"
    };
  }
  if (for_rent && for_purchase) {
    return {
      label: "/month",
      unit: "per month (or purchase at listed price)",
      description: "This property is available for both rent and purchase"
    };
  }
  return {
    label: "",
    unit: "price",
    description: "Property purpose not specified"
  };
}

/**
 * Format price with XAF currency
 */
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
}

/**
 * Get area unit options
 */
export const AREA_UNITS = [
  { value: "sqm", label: "Square Meters (sqm)" },
  { value: "sqft", label: "Square Feet (sqft)" },
  { value: "acres", label: "Acres" },
  { value: "hectares", label: "Hectares" },
];

/**
 * Get house type options
 */
export const HOUSE_TYPES = [
  { value: "detached", label: "Detached" },
  { value: "semi-detached", label: "Semi-Detached" },
  { value: "terrace", label: "Terrace" },
  { value: "bungalow", label: "Bungalow" },
  { value: "villa", label: "Villa" },
  { value: "cottage", label: "Cottage" },
];

/**
 * Get zoning options
 */
export const ZONING_OPTIONS = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "agricultural", label: "Agricultural" },
  { value: "mixed", label: "Mixed Use" },
];
