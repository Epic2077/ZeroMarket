import { supabase } from "./client";

// ── Row shape matching the Supabase `homepage_stats` table ──────────

export interface HomepageStatsRow {
  id: number;
  active_posts_count: number;
  today_new_posts: number;
  total_sellers: number;
  avg_response_rate: number;
  supported_brands: number;
  avg_post_price: number;
  price_change_since_last_week: number;
  last_updated: string;
}

// ── Fetcher ─────────────────────────────────────────────────────────

/** Fetch homepage stats from the current marketplace data. */
export async function fetchHomepageStats(): Promise<HomepageStatsRow | null> {
  const [
    { data: storedStats, error: storedStatsError },
    { data: listings, error: listingsError },
    { data: sellers, error: sellersError },
  ] = await Promise.all([
    supabase.from("homepage_stats").select("*").maybeSingle(),
    supabase
      .from("listings")
      .select("brand, price, status, created_at")
      .is("deleted_at", null),
    supabase.from("sellers").select("verified, answer_rate"),
  ]);

  if (storedStatsError) throw storedStatsError;
  if (listingsError) throw listingsError;
  if (sellersError) throw sellersError;

  const listingRows = (listings ?? []) as Array<{
    brand: string;
    price: number;
    status: string;
    created_at: string;
  }>;
  const sellerRows = (sellers ?? []) as Array<{
    verified: boolean;
    answer_rate: number | null;
  }>;
  const activeListings = listingRows.filter((listing) =>
    ["AVAILABLE", "NEGOTIABLE"].includes(listing.status),
  );
  const verifiedSellers = sellerRows.filter((seller) => seller.verified);
  const today = new Date().toISOString().slice(0, 10);
  const todayNewPosts = listingRows.filter((listing) =>
    listing.created_at.startsWith(today),
  ).length;
  const prices = activeListings
    .map((listing) => Number(listing.price))
    .filter(Number.isFinite);
  const responseRates = verifiedSellers
    .map((seller) => Number(seller.answer_rate))
    .filter(Number.isFinite);
  const stored = storedStats as HomepageStatsRow | null;

  return {
    id: stored?.id ?? 1,
    active_posts_count: activeListings.length,
    today_new_posts: todayNewPosts,
    total_sellers: verifiedSellers.length,
    avg_response_rate: responseRates.length
      ? responseRates.reduce((sum, rate) => sum + rate, 0) /
        responseRates.length
      : 0,
    supported_brands: new Set(activeListings.map((listing) => listing.brand))
      .size,
    avg_post_price: prices.length
      ? prices.reduce((sum, price) => sum + price, 0) / prices.length
      : 0,
    price_change_since_last_week: stored?.price_change_since_last_week ?? 0,
    last_updated: stored?.last_updated ?? new Date().toISOString(),
  };
}
