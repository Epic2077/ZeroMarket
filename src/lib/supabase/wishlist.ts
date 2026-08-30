import { supabase } from "./client";
import type { ListingRow } from "./listings";

// ── Helpers for the wishlist_items table ─────────────────────────────

/** Check whether a listing is already in the user's wishlist. */
export async function isListingSaved(
  userId: string,
  listingId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (error) return false;
  return Boolean(data);
}

/** Add a listing to the wishlist. */
export async function saveListing(
  userId: string,
  listingId: string,
): Promise<void> {
  const { error } = await supabase
    .from("wishlist_items")
    .insert({ user_id: userId, listing_id: listingId });

  // Ignore duplicate-key errors (unique constraint on user_id + listing_id).
  if (error && error.code !== "23505") throw error;
}

/** Remove a listing from the wishlist. */
export async function unsaveListing(
  userId: string,
  listingId: string,
): Promise<void> {
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("listing_id", listingId);

  if (error) throw error;
}

/** Fetch the user's wishlist joined with listing rows. */
export async function fetchWishlistListings(
  userId: string,
): Promise<ListingRow[]> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("listing_id, listings:listing_id(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    (data ?? []) as Array<{ listing_id: string; listings: ListingRow[] | null }>
  )
    .map((row) => row.listings?.[0])
    .filter((l): l is ListingRow => Boolean(l));
}
