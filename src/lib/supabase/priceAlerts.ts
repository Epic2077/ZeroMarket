import { supabase } from "./client";
import type { ListingRow } from "./listings";

// ── Types ────────────────────────────────────────────────────────────

export interface PriceAlertRow {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: number | null;
  target_price: number;
  is_active: boolean;
  created_at: string;
  /** Filled client-side from car_market_insights (current avg price). */
  current_price?: number;
}

// ── Fetchers ─────────────────────────────────────────────────────────

/** Fetch all price alerts for a user, with current market price joined. */
export async function fetchPriceAlerts(
  userId: string,
): Promise<PriceAlertRow[]> {
  const { data, error } = await supabase
    .from("price_alerts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as PriceAlertRow[];

  // Join current market price per alert (best-effort).
  return await Promise.all(
    rows.map(async (row) => {
      try {
        const { data: market } = await supabase
          .from("car_market_insights")
          .select("avg_listed_price")
          .eq("brand", row.brand)
          .eq("model", row.model)
          .maybeSingle();
        const current = Number(market?.avg_listed_price || 0);
        return { ...row, current_price: current || undefined };
      } catch {
        return row;
      }
    }),
  );
}

// ── Mutations ────────────────────────────────────────────────────────

/** Create a new price alert. */
export async function createPriceAlert(params: {
  userId: string;
  brand: string;
  model: string;
  year: number | null;
  targetPrice: number;
}): Promise<void> {
  const { error } = await supabase.from("price_alerts").insert({
    user_id: params.userId,
    brand: params.brand,
    model: params.model,
    year: params.year,
    target_price: params.targetPrice,
    is_active: true,
  });

  if (error) throw error;
}

/** Toggle a price alert's active state. */
export async function togglePriceAlert(
  id: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("price_alerts")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw error;
}

/** Delete a price alert. */
export async function deletePriceAlert(id: string): Promise<void> {
  const { error } = await supabase.from("price_alerts").delete().eq("id", id);

  if (error) throw error;
}

// ── Matching listings ────────────────────────────────────────────────

/** Fetch active listings matching an alert, sorted closest to target price. */
export async function fetchMatchingListings(
  brand: string,
  model: string,
  year: number | null,
  targetPrice: number,
): Promise<ListingRow[]> {
  let query = supabase
    .from("listings")
    .select("*")
    .eq("brand", brand)
    .eq("model", model)
    .in("status", ["AVAILABLE", "NEGOTIABLE"])
    .order("price", { ascending: true })
    .limit(20);

  if (year) query = query.eq("year", year);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as ListingRow[];

  // Sort by how close each listing's price is to the target.
  return rows.sort(
    (a, b) => Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice),
  );
}
