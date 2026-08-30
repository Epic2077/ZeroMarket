import { supabase } from "./client";

// ── Types ────────────────────────────────────────────────────────────

export type BuyRequestStatus =
  | "WAITING"
  | "ACCEPTED"
  | "NEGOTIABLE"
  | "REJECTED"
  | "COMPLETED"
  | "CLOSED";

/** Row shape for display. */
export interface BuyRequestRow {
  id: string;
  listing_id: string;
  buyer_id: string;
  offered_price: number;
  message: string | null;
  status: BuyRequestStatus;
  created_at: string;
  buyer_name: string;
  buyer_phone: string | null; // only shown when ACCEPTED/NEGOTIABLE
  /** Joined listing fields for display. */
  listing_brand?: string;
  listing_model?: string;
  /** The listing type (SELL or BUY) for contextual display. */
  listing_type?: string;
}

// ── Fetchers ─────────────────────────────────────────────────────────

/** Fetch all incoming buy requests for a seller, with listing info. */
export async function fetchSellerRequests(
  sellerId: string,
): Promise<BuyRequestRow[]> {
  const { data, error } = await supabase
    .from("buy_requests")
    .select(
      "id, listing_id, buyer_id, offered_price, message, status, created_at, buyer:buyer_id(full_name, phone), listing:listing_id(brand, model, listing_type)",
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    (data ?? []) as Array<{
      id: string;
      listing_id: string;
      buyer_id: string;
      offered_price: number;
      message: string | null;
      status: BuyRequestStatus;
      created_at: string;
      buyer: { full_name: string; phone: string | null }[] | null;
      listing: { brand: string; model: string; listing_type: string }[] | null;
    }>
  ).map((row) => ({
    id: row.id,
    listing_id: row.listing_id,
    buyer_id: row.buyer_id,
    offered_price: row.offered_price,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
    buyer_name: row.buyer?.[0]?.full_name ?? "خریدار",
    // Only reveal phone for accepted/negotiable (mirrors the DB view's logic)
    buyer_phone:
      row.status === "ACCEPTED" || row.status === "NEGOTIABLE"
        ? (row.buyer?.[0]?.phone ?? null)
        : null,
    listing_brand: row.listing?.[0]?.brand,
    listing_model: row.listing?.[0]?.model,
    listing_type: row.listing?.[0]?.listing_type ?? "SELL",
  }));
}

/** Mark all REQUEST notifications as read for a user. */
export async function markRequestNotificationsRead(
  userId: string,
): Promise<void> {
  await supabase
    .from("user_notifications")
    .update({ is_unread: false })
    .eq("user_id", userId)
    .eq("kind", "REQUEST")
    .eq("is_unread", true);
}

/** Update the status of a buy request (seller action). */
export async function updateRequestStatus(
  requestId: string,
  newStatus: BuyRequestStatus,
): Promise<void> {
  const { error } = await supabase
    .from("buy_requests")
    .update({ status: newStatus })
    .eq("id", requestId);

  if (error) throw error;
}

/** Buyer finalizes an accepted request (terminal → COMPLETED). */
export async function completeBuyRequest(requestId: string): Promise<void> {
  const { error } = await supabase
    .from("buy_requests")
    .update({ status: "COMPLETED" as BuyRequestStatus })
    .eq("id", requestId);

  if (error) throw error;
}

/** Submit a new buy request (buyer action). */
export async function sendBuyRequest(params: {
  listingId: string;
  sellerId: string;
  buyerId: string;
  offeredPrice: number;
  message?: string;
}): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("buy_requests")
    .insert({
      listing_id: params.listingId,
      seller_id: params.sellerId,
      buyer_id: params.buyerId,
      offered_price: params.offeredPrice,
      message: params.message ?? null,
      status: "WAITING" as BuyRequestStatus,
    })
    .select("id")
    .single();

  if (error) {
    // Detect duplicate (unique_buyer_listing_request constraint)
    if (error.code === "23505") {
      throw new Error("شما قبلاً برای این آگهی درخواست ثبت کرده‌اید");
    }
    throw error;
  }
  return data;
}

// ── Buyer-side fetchers ──────────────────────────────────────────────

/** Row shape for a buyer's outgoing request. */
export interface BuyerRequestRow {
  id: string;
  listing_id: string;
  offered_price: number;
  status: BuyRequestStatus;
  created_at: string;
  listing_title: string;
  seller_name: string;
  /** Only revealed when ACCEPTED or NEGOTIABLE. */
  seller_phone: string | null;
  /** The listing type (SELL or BUY) for contextual display. */
  listing_type: string;
}

/** Fetch all buy requests submitted by a buyer. */
export async function fetchBuyerRequests(
  buyerId: string,
): Promise<BuyerRequestRow[]> {
  const { data, error } = await supabase
    .from("buy_requests")
    .select(
      "id, listing_id, offered_price, status, created_at, seller:seller_id(full_name, phone), listing:listing_id(brand, model, listing_type)",
    )
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    (data ?? []) as Array<{
      id: string;
      listing_id: string;
      offered_price: number;
      status: BuyRequestStatus;
      created_at: string;
      seller: { full_name: string; phone: string | null }[] | null;
      listing: { brand: string; model: string; listing_type: string }[] | null;
    }>
  ).map((row) => ({
    id: row.id,
    listing_id: row.listing_id,
    offered_price: row.offered_price,
    status: row.status,
    created_at: row.created_at,
    seller_name: row.seller?.[0]?.full_name ?? "فروشنده",
    // Only reveal seller phone for accepted/negotiable
    seller_phone:
      row.status === "ACCEPTED" || row.status === "NEGOTIABLE"
        ? (row.seller?.[0]?.phone ?? null)
        : null,
    listing_title: row.listing?.[0]
      ? `${row.listing[0].brand} ${row.listing[0].model}`
      : "آگهی",
    listing_type: row.listing?.[0]?.listing_type ?? "SELL",
  }));
}

/** Cancel (delete) a buy request. Only allowed for WAITING or NEGOTIABLE. */
export async function cancelBuyRequest(requestId: string): Promise<void> {
  const { error } = await supabase
    .from("buy_requests")
    .delete()
    .eq("id", requestId);

  if (error) throw error;
}

// ── Notifications ────────────────────────────────────────────────────

export interface NotificationRow {
  id: string;
  title: string;
  description: string;
  kind: string;
  is_unread: boolean;
  created_at: string;
  href: string | null;
}

/** Translate DB notification fields to Persian. */
export function translateNotification(n: NotificationRow): NotificationRow {
  // Title translations
  const titleMap: Record<string, string> = {
    "New Buy Offer Received": "پیشنهاد خرید جدید",
    "Offer Status Updated": "وضعیت پیشنهاد به‌روزرسانی شد",
    "Taxonomy Request Rejected": "درخواست دسته‌بندی رد شد",
    "Taxonomy Request Approved": "درخواست دسته‌بندی تأیید شد",
    "New Taxonomy Request": "درخواست دسته‌بندی جدید",
    "Account Suspended": "حساب کاربری معلق شد",
    "Account Activated": "حساب کاربری فعال شد",
  };

  // Apply title translation
  let desc = n.description;

  // Status values in quotes → Persian
  desc = desc.replace(/"WAITING"/g, "«در انتظار»");
  desc = desc.replace(/"ACCEPTED"/g, "«تأیید شده»");
  desc = desc.replace(/"NEGOTIABLE"/g, "«قابل مذاکره»");
  desc = desc.replace(/"REJECTED"/g, "«رد شده»");
  desc = desc.replace(/"APPROVED"/g, "«تأیید شده»");
  desc = desc.replace(/"PENDING"/g, "«در انتظار»");

  // Standalone status/keywords → Persian
  desc = desc.replace(/\bWAITING\b/g, "در انتظار");
  desc = desc.replace(/\bACCEPTED\b/g, "تأیید شده");
  desc = desc.replace(/\bNEGOTIABLE\b/g, "قابل مذاکره");
  desc = desc.replace(/\bREJECTED\b/g, "رد شده");
  desc = desc.replace(/\bAPPROVED\b/g, "تأیید شده");
  desc = desc.replace(/\bPENDING\b/g, "در انتظار");
  desc = desc.replace(/\bADD\b/g, "افزودن");
  desc = desc.replace(/\bDELETE\b/g, "حذف");
  desc = desc.replace(/\bMODEL\b/g, "مدل");
  desc = desc.replace(/\bBRAND\b/g, "برند");
  desc = desc.replace(/\bCOLOR\b/g, "رنگ");
  desc = desc.replace(/\bCITY\b/g, "شهر");

  // Phrase-level translations
  desc = desc.replace("A buyer submitted an offer of ", "یک خریدار پیشنهاد ");
  desc = desc.replace(" for your listing.", " برای آگهی شما ثبت کرد.");
  desc = desc.replace(
    "The seller set your request status to ",
    "فروشنده وضعیت درخواست شما را به ",
  );
  desc = desc.replace("Your request to ", "درخواست شما برای ");
  desc = desc.replace(" was rejected by the owner.", " توسط مالک رد شد.");
  desc = desc.replace(" was approved by the owner.", " توسط مالک تأیید شد.");
  desc = desc.replace(" was approved and is now live.", " تأیید و اعمال شد.");
  desc = desc.replace("by the owner", "توسط مالک");

  // Clean up leftover English articles (must run after phrase replacements)
  desc = desc
    .replace(/\bthe\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Fix broken DB trigger hrefs → real dashboard paths
  const hrefMap: Record<string, string> = {
    "/seller/dashboard/requests": "/dashboard/seller",
    "/buyer/dashboard/requests": "/dashboard/user",
  };
  const href = n.href ? (hrefMap[n.href] ?? n.href) : null;

  return {
    ...n,
    title: titleMap[n.title] ?? n.title,
    description: desc,
    href,
  };
}

/** Fetch all notifications for a user. */
export async function fetchUserNotifications(
  userId: string,
): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from("user_notifications")
    .select("id, title, description, kind, is_unread, created_at, href")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as NotificationRow[];
}

/** Mark a single notification as read. */
export async function markNotificationRead(id: string): Promise<void> {
  await supabase
    .from("user_notifications")
    .update({ is_unread: false })
    .eq("id", id);
}

/** Mark all notifications as read for a user. */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  await supabase
    .from("user_notifications")
    .update({ is_unread: false })
    .eq("user_id", userId)
    .eq("is_unread", true);
}
