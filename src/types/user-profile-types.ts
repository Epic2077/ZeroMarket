import type { Session, User } from "@supabase/supabase-js";

export interface UserProfileRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatar_path: string | null;
  role: "USER" | "ADMIN" | "OWNER";
  status: "ACTIVE" | "SUSPENDED";
  verified: boolean;
  seller_application_status: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  seller_slug: string | null;
  banner_preset_id: string | null;
  banner_image_path: string | null;
  response_rate: number | null;
  total_views: number | null;
  total_sales_volume: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserInfoContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfileRow | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}
