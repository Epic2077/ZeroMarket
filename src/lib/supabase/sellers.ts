import { supabase } from "./client";
import type { SellerSummary } from "@/types/dataTypes";

// ── Row shape matching the Supabase `sellers` table ──────────────────

export interface SellerRow {
  id: string;
  full_name: string;
  verified: boolean;
  answer_rate: number;
  city: string;
  banner_path: string | null;
  avatar_path: string | null;
  active_listings_count: number;
  total_sold_count: number;
  seller_score: number;
  created_at: string;
  updated_at: string;
}

// ── Fetchers ──────────────────────────────────────────────────────────

/** Fetch all sellers. */
export async function fetchSellers(): Promise<SellerRow[]> {
  const { data, error } = await supabase
    .from("sellers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SellerRow[];
}

/** Fetch count of verified sellers. */
export async function fetchVerifiedSellersCount(): Promise<number> {
  const { count, error } = await supabase
    .from("sellers")
    .select("*", { count: "exact", head: true })
    .eq("verified", true);

  if (error) throw error;
  return count ?? 0;
}

/** Fetch a single seller by id. */
export async function fetchSellerById(id: string): Promise<SellerRow | null> {
  const { data, error } = await supabase
    .from("sellers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as SellerRow;
}

// ── Lightweight listing aggregates per seller ────────────────────────

export interface SellerListingSummary {
  brands: string[];
  minPrice: number;
  totalListings: number;
  activeListings: number;
}

interface SellerListingRowLike {
  seller_id: string;
  brand: string;
  price: number;
  status: string;
}

const ACTIVE_STATUSES = new Set(["AVAILABLE", "NEGOTIABLE"]);

export function aggregateSellerListingStats(
  rows: SellerListingRowLike[],
): Map<string, SellerListingSummary> {
  const map = new Map<string, SellerListingSummary>();

  for (const row of rows) {
    const sellerId = row.seller_id;
    let agg = map.get(sellerId);
    if (!agg) {
      agg = {
        brands: [],
        minPrice: Infinity,
        totalListings: 0,
        activeListings: 0,
      };
      map.set(sellerId, agg);
    }

    agg.totalListings += 1;
    if (ACTIVE_STATUSES.has(row.status)) {
      agg.activeListings += 1;
    }

    if (!agg.brands.includes(row.brand)) {
      agg.brands.push(row.brand);
    }

    if (row.price < agg.minPrice) {
      agg.minPrice = row.price;
    }
  }

  for (const agg of map.values()) {
    if (agg.minPrice === Infinity) agg.minPrice = 0;
  }

  return map;
}

/** Fetch distinct brands, minimum price, and listing counts per seller from
 *  the listings table. */
export async function fetchSellerBrandsAndMinPrice(): Promise<
  Map<string, SellerListingSummary>
> {
  const { data, error } = await supabase
    .from("listings")
    .select("seller_id, brand, price, status");

  if (error) throw error;

  return aggregateSellerListingStats((data ?? []) as SellerListingRowLike[]);
}

// ── Converter: Supabase SellerRow → frontend SellerSummary ───────────

/** Persian digits for member-since year conversion. */
function toPersianDigits(n: number): string {
  const fa = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n)
    .split("")
    .map((d) => fa[Number(d)] ?? d)
    .join("");
}

/** Generate initials from a Persian full_name. */
function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return parts[0].charAt(0) + parts[1].charAt(0);
  }
  return name.slice(0, 2);
}

/** Simple Farsi-based slug (transliterated). Falls back to id prefix. */
function sellerSlugFromName(name: string, id: string): string {
  const cleaned = name
    .trim()
    .replace(/[^\w\s\u0600-\u06FF]/g, "")
    .replace(/\s+/g, "-");
  return cleaned || `seller-${id.slice(0, 8)}`;
}

/** Extract seller display fields for a `Listing` from a `SellerRow`.
 *  Used when joining seller data into listing queries. */
export interface SellerDisplayFields {
  sellerName: string;
  sellerVerified: boolean;
  sellerResponseRate: number;
  sellerMemberSince: string;
  sellerActiveListings: number;
  sellerAvatar: string | null;
}

export function sellerRowToDisplayFields(
  row: SellerRow,
  listing?: SellerListingSummary,
): SellerDisplayFields {
  const memberYear = new Date(row.created_at).getFullYear();
  return {
    sellerName: row.full_name,
    sellerVerified: row.verified,
    sellerResponseRate: Math.round(row.answer_rate),
    sellerMemberSince: toPersianDigits(memberYear),
    sellerActiveListings: listing?.activeListings ?? row.active_listings_count,
    sellerAvatar: row.avatar_path ?? nameInitials(row.full_name),
  };
}

export function sellerRowToSummary(
  row: SellerRow,
  listing?: SellerListingSummary,
): any {
  const memberYear = new Date(row.created_at).getFullYear();
  const activeListings = listing?.activeListings ?? row.active_listings_count;
  const totalListings = listing?.totalListings ?? row.active_listings_count;

  const initials = nameInitials(row.full_name);

  const summary: any = {
    id: row.id,
    slug: sellerSlugFromName(row.full_name, row.id),
    name: row.full_name,
    nameEn: row.full_name,
    avatar_path: row.avatar_path ?? initials, // actual avatar from DB or initials as fallback
    avatar: initials, // fallback initials
    city: row.city,
    verified: row.verified,
    responseRate: Math.round(row.answer_rate),
    memberSince: toPersianDigits(memberYear),
    activeListings,
    totalListings,
    totalSoldCount: row.total_sold_count,
    sellerScore: row.seller_score,
    brands: listing?.brands ?? [],
    listings: [],
    minPrice: listing?.minPrice ?? 0,
  };
  return summary;
}
