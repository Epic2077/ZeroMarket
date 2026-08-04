import { supabase } from "./client";
import type { Listing } from "@/types/dataTypes";

// ── Row shape matching the Supabase `listings` table ──────────────────

export interface ListingRow {
  id: string;
  seller_id: string;
  slug: string;
  brand: string;
  model: string;
  is_custom_model: boolean;
  trim: string;
  year: number;
  price: number;
  price_unit: string;
  body_type: string;
  engine_power: string;
  gearbox: string;
  fuel: string;
  color: string;
  color_hex: string;
  city: string;
  shipment_days: number;
  status: string;
  other_options: string[];
  created_at: string;
  updated_at: string;
}

export type ListingStatus =
  | "WAITING"
  | "AVAILABLE"
  | "NEGOTIABLE"
  | "SOLD"
  | "RESERVED";

export interface ListingsFilter {
  status?: ListingStatus | ListingStatus[];
  brand?: string;
  sellerId?: string;
  search?: string;
}

// ── Fetchers ──────────────────────────────────────────────────────────

/** Fetch all listings, optionally filtered. */
export async function fetchListings(
  filter?: ListingsFilter,
): Promise<ListingRow[]> {
  let query = supabase.from("listings").select("*");

  if (filter?.status) {
    if (Array.isArray(filter.status)) {
      query = query.in("status", filter.status);
    } else {
      query = query.eq("status", filter.status);
    }
  }

  if (filter?.brand) {
    query = query.eq("brand", filter.brand);
  }

  if (filter?.sellerId) {
    query = query.eq("seller_id", filter.sellerId);
  }

  if (filter?.search) {
    query = query.or(
      `brand.ilike.%${filter.search}%,model.ilike.%${filter.search}%,trim.ilike.%${filter.search}%`,
    );
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) throw error;
  return (data ?? []) as ListingRow[];
}

/** Fetch a single listing by id. */
export async function fetchListingById(id: string): Promise<ListingRow | null> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }
  return data as ListingRow;
}

/** Fetch listings for a specific seller. */
export async function fetchListingsBySeller(
  sellerId: string,
): Promise<ListingRow[]> {
  return fetchListings({ sellerId: sellerId });
}

// ── Converter: Supabase ListingRow → frontend Listing ────────────────

const STATUS_MAP: Record<string, Listing["status"]> = {
  WAITING: "pending",
  AVAILABLE: "active",
  NEGOTIABLE: "negotiable",
  SOLD: "sold",
  RESERVED: "reserved",
};

/** Convert a raw Supabase listing row into the frontend `Listing` shape.
 *  Seller fields use sensible defaults until we join with the sellers table. */
export function listingRowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    seller_id: row.seller_id,
    ownerId: row.seller_id,
    brand: row.brand,
    model: row.model,
    trim: row.trim,
    year: row.year,
    color: row.color,
    colorHex: row.color_hex,
    engine: row.engine_power,
    transmission: row.gearbox,
    fuelType: row.fuel,
    bodyType: row.body_type,
    city: row.city,
    deliveryDays: row.shipment_days,
    sellerName: "فروشنده",
    sellerVerified: false,
    sellerResponseRate: 90,
    sellerMemberSince: "۱۴۰۲",
    sellerActiveListings: 1,
    sellerAvatar: null,
    price: row.price,
    priceUnit: row.price_unit ?? "تومان",
    status: STATUS_MAP[row.status] ?? "active",
    listedDate: row.created_at,
    factoryOptions: row.other_options ?? [],
    marketAvgBuy: row.price,
    marketAvgSell: row.price,
    priceVsMarket: 0,
    trend7d: 0,
  };
}
