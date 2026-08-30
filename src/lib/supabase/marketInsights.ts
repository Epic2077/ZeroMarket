import { supabase } from "./client";
import type { ListingRow } from "./listings";

/** Keyed by "brand|model|year", value is the avg listed price. */
export type MarketPriceMap = Map<string, number>;

/**
 * Fetch avg_listed_price for all unique brand+model(+year) combos
 * in the given listings, so we can compute priceVsMarket per listing.
 */
export async function fetchMarketPriceMap(
  listings: ListingRow[],
): Promise<MarketPriceMap> {
  if (!listings.length) return new Map();

  const keys = new Set<string>();
  const filters: { brand: string; model: string; year: string }[] = [];

  for (const l of listings) {
    const key = `${l.brand}|${l.model}|${l.year}`;
    if (!keys.has(key)) {
      keys.add(key);
      filters.push({ brand: l.brand, model: l.model, year: String(l.year) });
    }
  }

  // Batch fetch — Supabase allows up to ~200 OR conditions, so chunk if needed
  const map: MarketPriceMap = new Map();
  const chunks = chunkArray(filters, 100);

  for (const chunk of chunks) {
    let query = supabase
      .from("car_market_insights")
      .select("brand, model, year, avg_listed_price");

    // Build OR filter
    const orFilters = chunk
      .map(
        (f) => `and(brand.eq.${f.brand},model.eq.${f.model},year.eq.${f.year})`,
      )
      .join(",");
    query = query.or(orFilters);

    const { data } = await query;
    for (const row of data ?? []) {
      const key = `${row.brand}|${row.model}|${row.year}`;
      map.set(key, Number(row.avg_listed_price));
    }
  }

  return map;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/** Compute priceVsMarket for a listing given the market average. */
export function computePriceVsMarket(
  listingPrice: number,
  marketAvg: number,
): number {
  if (!marketAvg || marketAvg <= 0) return 0;
  return Math.round(((listingPrice - marketAvg) / marketAvg) * 100);
}
