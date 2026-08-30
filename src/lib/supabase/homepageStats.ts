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

/** Fetch the singleton homepage stats row. */
export async function fetchHomepageStats(): Promise<HomepageStatsRow> {
  const { data, error } = await supabase
    .from("homepage_stats")
    .select("*")
    .single();

  if (error) throw error;
  return data as HomepageStatsRow;
}
