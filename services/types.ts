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
  user_type?: "admin" | "agent" | "customer" | null;
};
export type RegisterResponse = { user: string; token: string; token_type: "Bearer" };

// User Management
export type UserGender = "male" | "female" | "other";
export type UserType = "customer" | "agent" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: UserGender;
  user_type: UserType;
  avatar?: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedUsers {
  current_page: number;
  data: User[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export type UserListResponse = { status: "success"; data: PaginatedUsers };

export type UserCreateRequest = {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: UserGender;
  user_type: UserType;
  email_verified_at?: boolean | null;
};

export type UserCreateResponse = { status: "success"; message: "User created successfully"; data: User };

export type UserShowResponse = { status: "success"; data: User };

export type UserUpdateRequest = {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  gender?: UserGender;
  user_type?: UserType;
  email_verified_at?: boolean;
};

export type UserUpdateResponse = { status: "success"; message: "User updated successfully"; data: User };

export type UserDeleteResponse = { status: "success"; message: "User deleted successfully" };

// Activity Logging
export type ActivityAction = "login" | "logout" | "create" | "update" | "delete" | "view";

export interface Activity {
  id: number;
  user_id: number;
  action: ActivityAction;
  description: string;
  model_type: string | null;
  model_id: number | null;
  changes: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    user_type: UserType;
  };
}

export interface PaginatedActivities {
  current_page: number;
  data: Activity[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export type ActivityListResponse = { status: "success"; data: PaginatedActivities };
export type ActivityShowResponse = { status: "success"; data: Activity };

export interface ActivityStatistics {
  total_activities: number;
  by_action: Record<string, number>;
  by_date: Record<string, number>;
  recent_actions: string[];
}

export type ActivityStatisticsResponse = { status: "success"; data: ActivityStatistics };

export type ActivityTimelineResponse = { status: "success"; data: Record<string, Activity[]> };

// Dashboard Statistics
export interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalAgents?: number;
  totalCustomers?: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  activeBookings: number;
  averageRating: number;
  platformGrowth: number;
  supportTickets?: number;
  myProperties?: number;
  myBookings?: number;
  myRevenue?: number;
  savedProperties?: number;
  unreadMessages?: number;
}

export type DashboardStatsResponse = { status: "success"; data: DashboardStats };

export interface TopProperty {
  id: number;
  name: string;
  owner: string;
  location: string;
  bookings: number;
  revenue: number;
  rating: number;
}

export interface PendingApproval {
  id: number;
  type: string;
  title: string;
  owner: string;
  location: string;
  submitted: string;
  status: string;
}

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
  description: string;
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

// Listings (aligned with OpenAPI)
export interface Listing {
  id: number;
  agent_id: number;
  property_type_id: number;
  title: string;
  slug: string;
  description: string;
  region: string;
  city: string;
  location: string;
  price: string;
  discount_price: string | null;
  discount_percentage: string | null;
  number_available: number;
  is_available: boolean;
  is_negotiable: boolean;
  is_featured: boolean;
  is_approved: boolean;
  status: string;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  
  // Purpose flags
  for_rent?: boolean | null;
  for_purchase?: boolean | null;
  
  // Address & geolocation
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  
  // Land-specific fields
  land_area?: number | null;
  land_area_unit?: string | null;
  land_dimensions?: string | null;
  zoning?: string | null;
  
  // House-specific fields
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor_area?: number | null;
  floor_area_unit?: string | null;
  year_built?: number | null;
  house_type?: string | null;
  
  // Hotel-specific fields
  rooms_count?: number | null;
  star_rating?: number | null;
  has_restaurant?: boolean | null;
  has_pool?: boolean | null;
  
  // Related data
  facilities?: Facility[];
  images?: ListingImage[];
  videos?: ListingVideo[];
  property_type?: PropertyType;
  is_saved?: boolean;
  saved_at?: string | null;
}
export type ListingCreateRequest = {
  title: string;
  description: string;
  property_type_id: number;
  price: number;
  region: string;
  city: string;
  location: string;
  discount_price?: number | null;
  discount_percentage?: number | null;
  number_available: number;
  is_available: boolean;
  is_negotiable?: boolean | null;
  is_featured?: boolean | null;
  is_approved?: boolean | null;
  status: boolean;
  facilities_id: number[];
  
  // Purpose flags
  for_rent?: boolean | null;
  for_purchase?: boolean | null;
  
  // Address & geolocation
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  
  // Land-specific fields
  land_area?: number | null;
  land_area_unit?: string | null;
  land_dimensions?: string | null;
  zoning?: string | null;
  
  // House-specific fields
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor_area?: number | null;
  floor_area_unit?: string | null;
  year_built?: number | null;
  house_type?: string | null;
  
  // Hotel-specific fields
  rooms_count?: number | null;
  star_rating?: number | null;
  has_restaurant?: boolean | null;
  has_pool?: boolean | null;
  
  /** additional field sometimes present in schema */
  ['facilities_id*']?: string;
};
export type ListingCreateResponse = { status: "success"; message: "Listing created successfully"; data: any };
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

// Admin Properties Management
export type PropertyStatus = "available" | "unavailable" | "pending" | "sold";

export interface AdminProperty {
  facilities: Facility[];
  images: ListingImage[];
  id: number;
  agent_id: number;
  property_type_id: number;
  title: string;
  slug: string;
  description: string;
  region: string;
  city: string;
  location: string;
  price: string | number;
  discount_price: string | number | null;
  discount_percentage: string | number | null;
  number_available: number;
  is_available: boolean;
  is_negotiable: boolean;
  is_featured: boolean;
  is_approved: boolean;
  status: PropertyStatus;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  agent?: {
    user: any;
    id: number;
    name: string;
    email: string;
  };
  property_type?: PropertyType;
  
  // Purpose flags
  for_rent?: boolean | null;
  for_purchase?: boolean | null;
  
  // Address & geolocation
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  
  // Land-specific fields
  land_area?: number | null;
  land_area_unit?: string | null;
  land_dimensions?: string | null;
  zoning?: string | null;
  
  // House-specific fields
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor_area?: number | null;
  floor_area_unit?: string | null;
  year_built?: number | null;
  house_type?: string | null;
  
  // Hotel-specific fields
  rooms_count?: number | null;
  star_rating?: number | null;
  has_restaurant?: boolean | null;
  has_pool?: boolean | null;
  
  videos?: ListingVideo[];
  is_saved?: boolean;
  saved_at?: string | null;
}

export interface PaginatedProperties {
  current_page: number;
  data: AdminProperty[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export type AdminPropertiesListResponse = { status: "success"; data: PaginatedProperties };

export type AdminPropertyCreateRequest = {
  agent_id: number;
  title: string;
  description: string;
  region: string;
  city: string;
  location: string;
  price: number;
  property_type_id: number;
  discount_price?: number | null;
  discount_percentage?: number | null;
  number_available: number;
  is_available?: boolean;
  is_negotiable?: boolean;
  is_featured?: boolean;
  is_approved?: boolean;
  status: PropertyStatus;
  facilities_id: number[];
  
  // Purpose flags
  for_rent?: boolean | null;
  for_purchase?: boolean | null;
  
  // Address & geolocation
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  
  // Land-specific fields
  land_area?: number | null;
  land_area_unit?: string | null;
  land_dimensions?: string | null;
  zoning?: string | null;
  
  // House-specific fields
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor_area?: number | null;
  floor_area_unit?: string | null;
  year_built?: number | null;
  house_type?: string | null;
  
  // Hotel-specific fields
  rooms_count?: number | null;
  star_rating?: number | null;
  has_restaurant?: boolean | null;
  has_pool?: boolean | null;
};

export type AdminPropertyCreateResponse = { status: "success"; message: "Property created successfully"; data: AdminProperty };

export type AdminPropertyShowResponse = { status: "success"; data: AdminProperty };

export type AdminPropertyUpdateRequest = {
  status?: PropertyStatus;
  is_approved?: boolean;
  is_featured?: boolean;
  is_available?: boolean;
  title?: string;
  description?: string;
  price?: number;
  discount_price?: number | null;
  discount_percentage?: number | null;
  number_available?: number;
  
  // Purpose flags
  for_rent?: boolean | null;
  for_purchase?: boolean | null;
  
  // Address & geolocation
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  
  // Land-specific fields
  land_area?: number | null;
  land_area_unit?: string | null;
  land_dimensions?: string | null;
  zoning?: string | null;
  
  // House-specific fields
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor_area?: number | null;
  floor_area_unit?: string | null;
  year_built?: number | null;
  house_type?: string | null;
  
  // Hotel-specific fields
  rooms_count?: number | null;
  star_rating?: number | null;
  has_restaurant?: boolean | null;
  has_pool?: boolean | null;
  
  facilities_id?: number[];
};

export type AdminPropertyUpdateResponse = { status: "success"; message: "Property updated successfully"; data: AdminProperty };

export type AdminPropertyDeleteResponse = { status: "success"; message: "Property deleted successfully" };

export type AdminPropertyApprovalRequest = {
  is_approved: boolean;
  reason?: string;
};

export type AdminPropertyApprovalResponse = { status: "success"; message: string; data: AdminProperty };

export type AdminPropertyFeaturedResponse = { status: "success"; message: string; data: AdminProperty };

export interface PropertyStatistics {
  total: number;
  available: number;
  unavailable: number;
  pending_approval: number;
  approved: number;
  featured: number;
  by_property_type: Record<string, number>;
  by_city: Record<string, number>;
}

export type PropertyStatisticsResponse = { status: "success"; data: PropertyStatistics };

// Listing Images
export interface ListingImage {
  id: number;
  listing_id: number;
  image_path?: string;
  image_url?: string;
  url?: string;
  alt_text: string | null;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

export type ListingImagesResponse = { status: "success"; data: ListingImage[] };

export type ListingImageCreateResponse = {
  status: "success";
  message: "Images stored successfully";
  count: number;
  images: ListingImage[];
};

export type ListingImageDeleteResponse = { status: "success"; message: "Image deleted successfully" };

// Listing Videos
export interface ListingVideo {
  id: number;
  listing_id: number;
  video_url?: string;
  url?: string;
  description?: string | null;
  thumbnail?: string | null;
  created_at: string;
  updated_at: string;
}

export type ListingVideosResponse = { status: "success"; data: ListingVideo[] };

export type ListingVideoCreateResponse = {
  status: "success";
  message: "Videos stored successfully";
  count: number;
  videos: ListingVideo[];
};

export type ListingVideoDeleteResponse = { status: "success"; message: "Video deleted successfully" };
// Agent Management
export type AgentStatus = "pending" | "approved" | "rejected";

export interface Agent {
  id: number;
  user_id: number;
  profile_photo: string | null;
  bio: string | null;
  id_card_num: string;
  country: string;
  region: string;
  city: string;
  address: string;
  id_image_front: string;
  id_image_back: string;
  status: AgentStatus;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface PaginatedAgents {
  current_page: number;
  data: Agent[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export type AgentRegistrationRequest = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  gender: UserGender;
  user_type: "agent";
  profile_photo?: File | null;
  bio?: string | null;
  id_card_num: string;
  country: string;
  region: string;
  city: string;
  address: string;
  id_image_front: File;
  id_image_back: File;
};

export type AgentRegistrationResponse = {
  status: "success";
  message: "Agent registration successful. Your account is pending approval.";
  data: {
    user: User;
    agent: Agent;
    token: string;
    token_type: "Bearer";
  };
};

export type AgentCreateRequest = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  gender: UserGender;
  user_type?: "agent";
  profile_photo?: File | null;
  bio?: string | null;
  id_card_num: string;
  country: string;
  region: string;
  city: string;
  address: string;
  id_image_front: File;
  id_image_back: File;
  status?: AgentStatus;
};

export type AgentCreateResponse = {
  status: "success";
  message: "Agent created successfully";
  data: Agent;
};

export type AgentListResponse = { status: "success"; data: PaginatedAgents };
export type PendingAgentListResponse = { status: "success"; count: number; data: Agent[] };

export type AgentShowResponse = { status: "success"; data: Agent };
export type PendingAgentShowResponse = { status: "success"; data: Agent };

export type AgentUpdateRequest = {
  name?: string;
  email?: string;
  phone?: string;
  gender?: UserGender;
  profile_photo?: File | null;
  bio?: string | null;
  id_card_num?: string;
  country?: string;
  region?: string;
  city?: string;
  address?: string;
  id_image_front?: File;
  id_image_back?: File;
  status?: AgentStatus;
};

export type AgentUpdateResponse = {
  status: "success";
  message: "Agent updated successfully";
  data: Agent;
};

export type AgentDeleteResponse = { status: "success"; message: "Agent deleted successfully" };

export type AgentStatusUpdateRequest = {
  status: AgentStatus;
};

export type AgentStatusUpdateResponse = {
  status: "success";
  message: "Agent status updated successfully";
  data: Agent;
};