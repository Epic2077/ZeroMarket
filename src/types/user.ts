import type { RequestStatus } from "@/context/sellerDashboard";
import type { ReactNode } from "react";

export type UserRole = "user" | "seller";

// Lifecycle of a regular user's request to be upgraded to a verified seller.
export type SellerApplicationStatus = "none" | "pending" | "approved";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
  avatar: string; // initials shown in the avatar circle
  memberSince: string; // Persian (Jalali) year
  role: UserRole;
  verified: boolean;
  sellerApplicationStatus: SellerApplicationStatus;
}

// A listing the buyer has bookmarked or recently viewed.
export interface SavedListing {
  id: string;
  listingId: string;
  title: string;
  trim: string;
  city: string;
  price: number;
  avatar: string; // brand initials
  status: "active" | "pending" | "sold" | "negotiable" | "reserved";
  savedAt: string;
}

// A purchase/negotiation request the buyer has submitted to a seller.
export interface MyRequest {
  id: string;
  title: string;
  seller: string;
  offer: number;
  status: RequestStatus;
  time: string;
}

// A standing alert that notifies the buyer when a model crosses a target price.
export interface PriceAlert {
  id: string;
  title: string;
  targetPrice: number;
  currentPrice: number;
  active: boolean;
  city?: string;
  color?: string;
}

export interface UserNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  kind: "request" | "price" | "saved" | "system";
  href?: string;
  actionLabel?: string;
  icon?: ReactNode;
}

export interface NotificationPref {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
}
