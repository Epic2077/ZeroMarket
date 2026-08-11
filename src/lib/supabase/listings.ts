import { supabase } from "./client";
import type { Listing } from "@/types/dataTypes";
import { formatPersianDateTime } from "@/lib/utils";
import type { SellerDisplayFields } from "./sellers";

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
  listing_type: string;
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

// ── Duplicate check ─────────────────────────────────────────────────

/** Check whether the seller already has an active listing with the same
 *  brand / model / year / trim / color / city. Returns the duplicate's id if found. */
export async function checkDuplicateListing(
  client: SupabaseClient,
  sellerId: string,
  brand: string,
  model: string,
  year: number,
  trim: string,
  color: string,
  city: string,
  excludeId?: string,
): Promise<string | null> {
  let query = client
    .from("listings")
    .select("id")
    .match({ seller_id: sellerId, brand, model, year, trim, color, city })
    .in("status", ["WAITING", "AVAILABLE", "NEGOTIABLE", "RESERVED"]);

  if (excludeId) query = query.neq("id", excludeId);

  const { data } = await query.maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

// ── Market insights ──────────────────────────────────────────────────

import type { MarketDisplayFields } from "@/types/dataTypes";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Fetch market analytics from `car_market_insights` and compute display
 *  fields (price-vs-market %, trend %). Returns null when no data exists.
 *  Works with both server and client supabase clients. */
export async function getMarketInsight(
  client: SupabaseClient,
  brand: string,
  model: string,
  year: number,
  listingPrice: number,
): Promise<MarketDisplayFields | null> {
  const { data, error } = await client
    .from("car_market_insights")
    .select("avg_listed_price, avg_price_7d_ago")
    .eq("brand", brand)
    .eq("model", model)
    .eq("year", String(year)) // year is text in car_market_insights
    .maybeSingle();

  if (error || !data) return null;

  const avg = Number(data.avg_listed_price);
  if (!avg || avg <= 0) return null;

  const priceVsMarket = Math.round(((listingPrice - avg) / avg) * 100);
  const ago7d = Number(data.avg_price_7d_ago || 0);
  const trend7d = ago7d > 0 ? Math.round(((avg - ago7d) / ago7d) * 100) : 0;

  return { marketAvgBuy: avg, marketAvgSell: avg, priceVsMarket, trend7d };
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
 *  Accepts optional seller display fields and market insight data. */
export function listingRowToListing(
  row: ListingRow,
  seller?: SellerDisplayFields,
  market?: MarketDisplayFields,
): Listing {
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
    sellerName: seller?.sellerName ?? "فروشنده",
    sellerVerified: seller?.sellerVerified ?? false,
    sellerResponseRate: seller?.sellerResponseRate ?? 90,
    sellerMemberSince: seller?.sellerMemberSince ?? "۱۴۰۲",
    sellerActiveListings: seller?.sellerActiveListings ?? 1,
    sellerAvatar: seller?.sellerAvatar ?? null,
    price: row.price,
    priceUnit: row.price_unit ?? "تومان",
    status: STATUS_MAP[row.status] ?? "active",
    listedDate: formatPersianDateTime(row.created_at),
    factoryOptions: row.other_options ?? [],
    marketAvgBuy: market?.marketAvgBuy ?? row.price,
    marketAvgSell: market?.marketAvgSell ?? row.price,
    priceVsMarket: market?.priceVsMarket ?? 0,
    trend7d: market?.trend7d ?? 0,
    listingType: (row.listing_type === "BUY"
      ? "BUY"
      : "SELL") as Listing["listingType"],
  };
}
