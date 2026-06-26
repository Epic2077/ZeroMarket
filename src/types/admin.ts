import type { Listing } from "@/types/dataTypes";

// Account status used across the platform-management panels.
export type AccountStatus = "active" | "suspended";

// The progression a member moves through: a buyer can be promoted to a seller,
// and a seller to a verified ("confirmed") seller — and demoted back down.
export type PlatformRole = "buyer" | "seller" | "confirmed_seller";

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
  role: PlatformRole;
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
}
