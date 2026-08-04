import { supabase } from "./client";
import type { SellerSummary } from "@/context/sellers";

// ── Row shape matching the Supabase `sellers` table ──────────────────

export interface SellerRow {
  id: string;
  full_name: string;
  verified: boolean;
  answer_rate: number;
  city: string;
  banner_path: string | null;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
}

// ── Aggregated listing info per seller ───────────────────────────────

export interface SellerListingAggregate {
  sellerId: string;
  totalListings: number;
  activeListings: number;
  brands: string[];
  minPrice: number;
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

/** Fetch listing aggregates per seller (counts, brands, min price).
 *  Returns a map of seller_id → aggregate. */
export async function fetchSellerListingAggregates(): Promise<
  Map<string, SellerListingAggregate>
> {
  const { data, error } = await supabase
    .from("listings")
    .select("seller_id, brand, status, price");

  if (error) throw error;

  const map = new Map<string, SellerListingAggregate>();

  for (const row of data ?? []) {
    const sellerId = row.seller_id as string;
    let agg = map.get(sellerId);
    if (!agg) {
      agg = {
        sellerId,
        totalListings: 0,
        activeListings: 0,
        brands: [],
        minPrice: Infinity,
      };
      map.set(sellerId, agg);
    }

    agg.totalListings++;
    if (row.status === "AVAILABLE" || row.status === "NEGOTIABLE") {
      agg.activeListings++;
    }
    const brand = row.brand as string;
    if (!agg.brands.includes(brand)) {
      agg.brands.push(brand);
    }
    const price = row.price as number;
    if (price < agg.minPrice) {
      agg.minPrice = price;
    }
  }

  // Normalise minPrice for sellers with no listings
  for (const agg of map.values()) {
    if (agg.minPrice === Infinity) agg.minPrice = 0;
  }

  return map;
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

export function sellerRowToSummary(
  row: SellerRow,
  agg?: SellerListingAggregate,
): SellerSummary {
  const memberYear = new Date(row.created_at).getFullYear();

  return {
    id: row.id,
    slug: sellerSlugFromName(row.full_name, row.id),
    name: row.full_name,
    nameEn: row.full_name, // Supabase stores Persian names; used for search
    avatar: nameInitials(row.full_name),
    city: row.city,
    verified: row.verified,
    responseRate: Math.round(row.answer_rate),
    memberSince: toPersianDigits(memberYear),
    activeListings: agg?.activeListings ?? 0,
    totalListings: agg?.totalListings ?? 0,
    brands: agg?.brands ?? [],
    listings: [], // individual listings fetched separately on detail page
  };
}
