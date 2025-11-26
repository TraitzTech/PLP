// Types aligned with provided OpenAPI schema (0.0.1)

// Common
export type ApiMessageResponse = { message: string };
export type ApiStatusResponse = { status: string };

export type ValidationErrorResponse = {
  message: string;
  errors: Record<string, string[]>;
};

export type AuthErrorResponse = { message: string };
export type NotFoundResponse = { message: string };

// Auth
export type LoginRequest = { email: string; password: string };
export type LoginResponse = { user: string; token: string };

export type RegisterRequest = {
    name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  user_type?: "admin" | "owner" | null;
};
export type RegisterResponse = { user: string; token: string; token_type: "Bearer" };

export type ForgotPasswordRequest = { email: string };
export type ForgotPasswordResponse = ApiStatusResponse;

export type ResetPasswordRequest = {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
};
export type ResetPasswordResponse = ApiStatusResponse;

export type VerifyEmailResponse = { message: "email verified successfully" };
export type VerificationNotificationResponse = { status: "verification-link-sent" | "already-verified" };

// Facilities
export interface Facility {
  id: number;
  icon: string | null;
  name: string;
  slug: string;
  status: number;
  created_at: string | null;
  updated_at: string | null;
}
export type FacilityCreateRequest = {
  icon?: string | null;
  name: string;
  slug?: string;
  status?: boolean | number;
};
export type FacilityCreateResponse = { status: "success"; message: "Facility created successfully"; data: Facility };
export type FacilityShowResponse = { status: "success"; data: any };
export type FacilityUpdateResponse = { status: "success"; message: "Facility updated successfully"; data: any };
export type FacilityDeleteResponse = { status: "success"; message: "Facility deleted successfully" };
export type FacilityNotFoundResponse = { status: "error"; message: "Facility not found" };

// Property Types
export interface PropertyType {
  id: number;
  name: string;
  description: string | null;
  status: number;
  created_at: string | null;
  updated_at: string | null;
}
export type PropertyTypeCreateRequest = {
  name: string;
  description?: string | null;
  status?: boolean;
};
export type PropertyTypeCreateResponse = { status: "success"; message: "Property type created successfully"; data: PropertyType };
export type PropertyTypeShowResponse = { status: "success"; data: any };
export type PropertyTypeUpdateResponse = { status: "success"; message: "Property type updated successfully"; data: any };
export type PropertyTypeDeleteResponse204 = void; // No content
export type PropertyTypeNotFoundResponse = { status: "error"; message: "Property type not found" };

// Listings
export interface Listing {
  id: number;
  owner_id: number;
  title: string;
  slug: string;
  description: string;
  region: string;
  city: string;
  address: string | null;
  is_featured: number;
  is_approved: number;
  status: number;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
export type ListingCreateRequest = {
  title: string;
  description: string;
  price: number;
  region: string;
  city: string;
  address?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  status: boolean;
};
export type ListingCreateResponse = { status: "success"; message: "Listing created successfully"; data: Listing };
export type ListingDeleteResponse = { status: "success"; message: "Listing deleted successfully" };

// Listing Schedules
export interface ListingSchedule {
  id: number;
  listing_id: number;
  day: string;
  start_time: string;
  end_time: string;
  status: number;
  created_at: string | null;
  updated_at: string | null;
}
export type ListingScheduleRequest = {
  day: string;
  start_time: string;
  end_time: string;
  status: boolean;
};
export type ListingScheduleCreateResponse = {
  status: "error"; // per spec, though likely intended "success"
  message: "Listing schedule created successfully";
  data: ListingSchedule;
};
export type ListingScheduleUpdateResponse = {
  status: "success";
  message: "Listing schedule updated successfully";
  data: any;
};
export type ListingScheduleNotFoundResponse = { status: "error"; message: "Listing schedule not found" };
export type ListingScheduleDeleteResponse204 = void; // No content
