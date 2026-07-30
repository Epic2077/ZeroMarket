import type { Listing } from "@/types/dataTypes";
import type { UserProfileRow } from "@/types/user-profile-types";

// Account status used across the platform-management panels.
export type AccountStatus = UserProfileRow["status"];

// Platform roles are sourced from backend profile rows.
export type PlatformRole = UserProfileRow["role"];

export type platformVerified = UserProfileRow["verified"];

// Backend profile row types are sourced from user-profile-types.ts
export type ProfileRole = UserProfileRow["role"];
export type ProfileStatus = UserProfileRow["status"];
export type SellerApplicationStatus =
  UserProfileRow["seller_application_status"];
export type AdminUserRow = UserProfileRow;

// Aggregated performance figures shown on a user's detail view. Product counts
// are derived live from the ListingsProvider, not stored here.
export interface UserAnalytics {
  requests: number;
  views: number;
  salesVolume: number; // toman
  responseRate: number; // %
  conversion: number; // %
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string; // Persian city label
  avatar: string; // initials
  avatarPath: string | null; // supabase storage path in "avatar" bucket
  role: PlatformRole;
  verified: platformVerified;
  status: AccountStatus;
  joinedAt: string; // Persian year
  analytics: UserAnalytics;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  assignedUserIds: string[];
}

// Shape of the edit-profile form (owner/admin editing a member's details).
export interface ProfileInput {
  name: string;
  email: string;
  phone: string;
  city: string;
}

// The full set of product fields editable from the product editor page.
export interface ProductInput {
  brand: string;
  model: string;
  trim: string;
  year: number;
  color: string;
  colorHex: string;
  engine: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
  city: string;
  deliveryDays: number;
  price: number;
  status: Listing["status"];
  factoryOptions: string[];
  sellerNotes?: string;
}
