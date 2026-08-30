import { supabase } from "./client";

// ── Types ────────────────────────────────────────────────────────────

export type CompletedSaleStatus = "PENDING_BUYER" | "CONFIRMED" | "REJECTED";

export interface CompletedSaleRow {
  id: string;
  seller_id: string;
  buyer_id: string | null;
  listing_id: string | null;
  listing_type: "SELL" | "BUY";
  final_sold_price: number;
  status: CompletedSaleStatus;
  created_at: string;
  /** Joined display fields. */
  seller_name?: string;
  listing_brand?: string;
  listing_model?: string;
}

export interface PlatformSummary {
  grand_total_volume: number;
  grand_total_cars_sold: number;
  total_active_sellers: number;
}

export interface SellerStats {
  total_cars_sold: number;
  total_volume: number;
}

// ── Row mapper ───────────────────────────────────────────────────────

function mapRow(row: any): CompletedSaleRow {
  return {
    id: row.id,
    seller_id: row.seller_id,
    buyer_id: row.buyer_id ?? null,
    listing_id: row.listing_id ?? null,
    listing_type: (row.listing_type === "BUY" ? "BUY" : "SELL") as
      | "SELL"
      | "BUY",
    final_sold_price: Number(row.final_sold_price),
    status: (row.status as CompletedSaleStatus) ?? "PENDING_BUYER",
    created_at: row.created_at,
    seller_name: row.profiles?.full_name ?? "فروشنده",
    listing_brand: row.listings?.brand,
    listing_model: row.listings?.model,
  };
}

// ── Mutations ────────────────────────────────────────────────────────

/** Seller/owner records a completed sale directly (no separate buyer
 *  confirmation step — that now lives in the buy-request flow). */
export async function recordSale(params: {
  sellerId: string;
  buyerId: string;
  listingId: string;
  listingType: "SELL" | "BUY";
  listingLabel: string;
  finalPrice: number;
  archiveListing: boolean;
}): Promise<void> {
  // 1. Insert the completed sale (counts toward seller + market totals).
  const { error: saleError } = await supabase.from("completed_sales").insert({
    seller_id: params.sellerId,
    buyer_id: params.buyerId,
    listing_id: params.listingId,
    listing_type: params.listingType,
    final_sold_price: params.finalPrice,
    status: "CONFIRMED" as CompletedSaleStatus,
  });

  if (saleError) throw saleError;

  // 2. Optionally archive the listing.
  if (params.archiveListing) {
    const { error: archiveError } = await supabase
      .from("listings")
      .update({ status: "INACTIVE" })
      .eq("id", params.listingId);

    if (archiveError) throw archiveError;
  }

  // 3. Notify the buyer that the sale was recorded.
  const { error: notifError } = await supabase
    .from("user_notifications")
    .insert({
      user_id: params.buyerId,
      title: "معامله ثبت شد",
      description: `فروشنده معامله «${params.listingLabel}» را به مبلغ ${params.finalPrice.toLocaleString(
        "fa-IR",
      )} تومان ثبت کرد.`,
      kind: "REQUEST",
      href: "/dashboard/user",
    });

  if (notifError) throw notifError;
}

/** Buyer confirms or rejects a pending sale. */
export async function updateSaleStatus(
  saleId: string,
  status: CompletedSaleStatus,
): Promise<void> {
  const { error } = await supabase
    .from("completed_sales")
    .update({ status })
    .eq("id", saleId);

  if (error) throw error;
}

// ── Fetchers ─────────────────────────────────────────────────────────

/** Fetch recent completed sales joined with seller + listing info. */
export async function fetchRecentSales(
  limit = 50,
): Promise<CompletedSaleRow[]> {
  const { data, error } = await supabase
    .from("completed_sales")
    .select(
      "*, profiles:seller_id(full_name), listings:listing_id(brand, model)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/** Fetch the platform summary (from owner_platform_summary view). */
export async function fetchPlatformSummary(): Promise<PlatformSummary | null> {
  const { data, error } = await supabase
    .from("owner_platform_summary")
    .select("*")
    .maybeSingle();

  if (error || !data) return null;

  return {
    grand_total_volume: Number((data as any).grand_total_volume ?? 0),
    grand_total_cars_sold: Number((data as any).grand_total_cars_sold ?? 0),
    total_active_sellers: Number((data as any).total_active_sellers ?? 0),
  };
}

/** Fetch a seller's sold count + volume from both completed-sale sources:
 *  - `completed_sales` (staff-recorded deals, CONFIRMED)
 *  - `buy_requests` (buy-request flow, COMPLETED)
 *  Rows are deduped by listing + buyer so a request that the DB trigger already
 *  synced into `completed_sales` is not counted twice. */
export async function fetchSellerStats(sellerId: string): Promise<SellerStats> {
  const [salesRes, requestsRes] = await Promise.all([
    supabase
      .from("completed_sales")
      .select("listing_id, buyer_id, final_sold_price")
      .eq("seller_id", sellerId)
      .eq("status", "CONFIRMED"),
    supabase
      .from("buy_requests")
      .select("listing_id, buyer_id, offered_price")
      .eq("seller_id", sellerId)
      .eq("status", "COMPLETED"),
  ]);

  const sales = (salesRes.data ?? []) as Array<{
    listing_id: string | null;
    buyer_id: string | null;
    final_sold_price: number;
  }>;
  const requests = (requestsRes.data ?? []) as Array<{
    listing_id: string;
    buyer_id: string;
    offered_price: number;
  }>;

  const seen = new Set<string>();
  let total_cars_sold = 0;
  let total_volume = 0;

  for (const row of sales) {
    seen.add(`${row.listing_id ?? ""}|${row.buyer_id ?? ""}`);
    total_cars_sold += 1;
    total_volume += Number(row.final_sold_price ?? 0);
  }

  for (const row of requests) {
    const key = `${row.listing_id}|${row.buyer_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    total_cars_sold += 1;
    total_volume += Number(row.offered_price ?? 0);
  }

  return { total_cars_sold, total_volume };
}

/** Fetch a single seller's completed sales (newest first). */
export async function fetchSellerSales(
  sellerId: string,
  limit = 20,
): Promise<CompletedSaleRow[]> {
  const { data, error } = await supabase
    .from("completed_sales")
    .select(
      "*, profiles:seller_id(full_name), listings:listing_id(brand, model)",
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/** Fetch a buyer's completed sales, optionally filtered by status. */
export async function fetchBuyerSales(
  buyerId: string,
  status?: CompletedSaleStatus,
  limit = 20,
): Promise<CompletedSaleRow[]> {
  let query = supabase
    .from("completed_sales")
    .select(
      "*, profiles:seller_id(full_name), listings:listing_id(brand, model)",
    )
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRow);
}
