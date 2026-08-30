import { supabase } from "./client";

// ── Row shape from taxonomy_options table ───────────────────────────────
export interface TaxonomyRow {
  id: string;
  category: TaxonomyCategory;
  value: string;
  metadata: Record<string, unknown> | null;
}

/** Supabase taxonomy category enum values. */
export type TaxonomyCategory =
  | "BRAND"
  | "MODEL"
  | "YEAR"
  | "COLOR"
  | "CITY"
  | "BODY_TYPE"
  | "FUEL_TYPE"
  | "TRANSMISSION";

// ── Category → Persian label ────────────────────────────────────────────
export const taxonomyCategoryMeta: {
  id: TaxonomyCategory;
  label: string;
  noun: string;
}[] = [
  { id: "BRAND", label: "برندها", noun: "برند" },
  { id: "YEAR", label: "سال تولید", noun: "سال" },
  { id: "COLOR", label: "رنگ‌ها", noun: "رنگ" },
  { id: "CITY", label: "شهرها", noun: "شهر" },
  { id: "BODY_TYPE", label: "نوع بدنه", noun: "نوع بدنه" },
  { id: "FUEL_TYPE", label: "نوع سوخت", noun: "سوخت" },
  { id: "TRANSMISSION", label: "گیربکس", noun: "گیربکس" },
];

// ── Fetchers per category ───────────────────────────────────────────────

/** Fetch all taxonomy rows for a given category. */
export async function fetchTaxonomy(
  category: TaxonomyCategory,
): Promise<TaxonomyRow[]> {
  const { data, error } = await supabase
    .from("taxonomy_options")
    .select("id, value, metadata, category")
    .eq("category", category)
    .order("value", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Fetch all taxonomy rows across all categories. */
export async function fetchAllTaxonomy(): Promise<
  Record<TaxonomyCategory, TaxonomyRow[]>
> {
  const { data, error } = await supabase
    .from("taxonomy_options")
    .select("id, value, metadata, category")
    .order("value", { ascending: true });

  if (error) throw error;

  const grouped: Record<string, TaxonomyRow[]> = {};
  for (const row of data ?? []) {
    (grouped[row.category] ??= []).push(row);
  }
  return grouped as Record<TaxonomyCategory, TaxonomyRow[]>;
}

/** Return only the value strings for a given category. */
export async function fetchTaxonomyValues(
  category: TaxonomyCategory,
): Promise<string[]> {
  const rows = await fetchTaxonomy(category);
  return rows.map((r) => r.value);
}

/**
 * Fetch models scoped to a specific brand (stored in metadata.brand).
 * Pass no brand to get all models with their brand metadata.
 */
export async function fetchModelsByBrand(
  brand?: string,
): Promise<TaxonomyRow[]> {
  let query = supabase
    .from("taxonomy_options")
    .select("id, value, metadata, category")
    .eq("category", "MODEL");

  if (brand) {
    query = query.eq("metadata->>brand", brand);
  }

  const { data, error } = await query.order("value", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Fetch all models grouped by their brand (from metadata.brand). */
export async function fetchModelsGroupedByBrand(): Promise<
  Record<string, string[]>
> {
  const rows = await fetchModelsByBrand();
  const grouped: Record<string, string[]> = {};
  for (const r of rows) {
    const brand = (r.metadata as { brand?: string } | null)?.brand ?? "نامشخص";
    (grouped[brand] ??= []).push(r.value);
  }
  return grouped;
}

/** Convenience: fetch colors with their hex codes from metadata. */
export async function getColorsWithHex(): Promise<
  { value: string; hex: string }[]
> {
  const rows = await fetchTaxonomy("COLOR");
  return rows.map((r) => ({
    value: r.value,
    hex: (r.metadata as { hex?: string } | null)?.hex ?? "#1b4fd8",
  }));
}

// ── Owner mutations ─────────────────────────────────────────────────────

export interface AddTaxonomyInput {
  category: TaxonomyCategory;
  value: string;
  metadata?: Record<string, unknown> | null;
}

/** Owner: add a new option to any category. */
export async function ownerAddOption(input: AddTaxonomyInput): Promise<void> {
  const { error } = await supabase.from("taxonomy_options").insert({
    category: input.category,
    value: input.value,
    metadata: input.metadata ?? null,
  });

  if (error) throw error;
}

/** Owner: rename an option within a given category. */
export async function ownerRenameOption(
  category: TaxonomyCategory,
  oldValue: string,
  newValue: string,
): Promise<void> {
  const { error } = await supabase
    .from("taxonomy_options")
    .update({ value: newValue })
    .eq("category", category)
    .eq("value", oldValue);

  if (error) throw error;
}

/** Owner: delete an option from a given category. */
export async function ownerDeleteOption(
  category: TaxonomyCategory,
  value: string,
): Promise<void> {
  const { error } = await supabase
    .from("taxonomy_options")
    .delete()
    .eq("category", category)
    .eq("value", value);

  if (error) throw error;
}

/** Owner: update metadata (e.g., hex color) for an option. */
export async function ownerUpdateOptionMetadata(
  category: TaxonomyCategory,
  value: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase
    .from("taxonomy_options")
    .update({ metadata })
    .eq("category", category)
    .eq("value", value);

  if (error) throw error;
}

// ── Admin change requests (→ PENDING review by owner) ──────────────────

export type ChangeAction = "ADD" | "UPDATE" | "DELETE";

export interface AdminChangeRequest {
  category: TaxonomyCategory;
  action: ChangeAction;
  value: string;
  newValue?: string;
  metadata?: Record<string, unknown> | null;
  requestedBy: string; // Supabase auth user ID
}

export interface TaxonomyChangeRequest {
  id: string;
  category: TaxonomyCategory;
  action: ChangeAction;
  value: string;
  new_value: string | null;
  metadata: Record<string, unknown> | null;
  requested_by: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  reviewed_at: string | null;
}

/** Admin: submit a change request for owner approval. */
export async function requestTaxonomyChange(
  input: AdminChangeRequest,
): Promise<void> {
  const { error } = await supabase.from("taxonomy_change_requests").insert({
    category: input.category,
    action: input.action,
    value: input.value,
    new_value: input.newValue ?? null,
    metadata: input.metadata ?? null,
    requested_by: input.requestedBy,
    status: "PENDING",
  });

  if (error) throw error;
}

/** Fetch pending taxonomy change requests for owner review. */
export async function fetchTaxonomyChangeRequests(): Promise<
  TaxonomyChangeRequest[]
> {
  const { data, error } = await supabase
    .from("taxonomy_change_requests")
    .select("*")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TaxonomyChangeRequest[];
}

/** Fetch the current admin's own submitted taxonomy change requests (all statuses). */
export async function fetchMyTaxonomyChangeRequests(
  requestedBy: string,
): Promise<TaxonomyChangeRequest[]> {
  const { data, error } = await supabase
    .from("taxonomy_change_requests")
    .select("*")
    .eq("requested_by", requestedBy)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TaxonomyChangeRequest[];
}

/** Get Persian label for category. */
export function getCategoryLabel(category: TaxonomyCategory): string {
  const meta = taxonomyCategoryMeta.find((c) => c.id === category);
  return meta?.label ?? category;
}

/** Get Persian noun for category. */
export function getCategoryNoun(category: TaxonomyCategory): string {
  const meta = taxonomyCategoryMeta.find((c) => c.id === category);
  return meta?.noun ?? category;
}

/** Generate a human-readable description of the change request. */
export function describeChangeRequest(req: TaxonomyChangeRequest): string {
  const categoryLabel = getCategoryLabel(req.category);
  const noun = getCategoryNoun(req.category);

  switch (req.action) {
    case "ADD":
      return `افزودن ${noun} «${req.value}» در دسته‌بندی ${categoryLabel}`;
    case "UPDATE":
      return `تغییر ${noun} از «${req.value}» به «${req.new_value}» در دسته‌بندی ${categoryLabel}`;
    case "DELETE":
      return `حذف ${noun} «${req.value}» از دسته‌بندی ${categoryLabel}`;
    default:
      return "تغییر نامشخص";
  }
}

/** Owner: approve a taxonomy change request and apply it. */
export async function approveTaxonomyChangeRequest(
  requestId: string,
): Promise<void> {
  // 1. Fetch the request details
  const { data: request, error: fetchError } = await supabase
    .from("taxonomy_change_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    throw fetchError ?? new Error("درخواست یافت نشد");
  }

  // 2. Apply the change to taxonomy_options
  let applied = false;
  switch (request.action) {
    case "ADD": {
      const { error: addError } = await supabase
        .from("taxonomy_options")
        .insert({
          category: request.category,
          value: request.value,
          metadata: request.metadata ?? null,
        });
      if (addError) {
        // If duplicate (23505), the value already exists - treat as success
        if (addError.code === "23505") {
          applied = true;
          break;
        }
        throw addError;
      }
      applied = true;
      break;
    }
    case "UPDATE": {
      const { error: updateError } = await supabase
        .from("taxonomy_options")
        .update({ value: request.new_value! })
        .eq("category", request.category)
        .eq("value", request.value);
      if (updateError) {
        // If new_value already exists (23505), treat as success (already renamed)
        if (updateError.code === "23505") {
          applied = true;
          break;
        }
        // If no rows updated (value not found), treat as success
        if (updateError.code === "PGRST116") {
          applied = true;
          break;
        }
        throw updateError;
      }
      applied = true;
      break;
    }
    case "DELETE": {
      const { error: deleteError } = await supabase
        .from("taxonomy_options")
        .delete()
        .eq("category", request.category)
        .eq("value", request.value);
      if (deleteError) {
        // If no rows deleted (value not found), treat as success
        if (deleteError.code === "PGRST116") {
          applied = true;
          break;
        }
        throw deleteError;
      }
      applied = true;
      break;
    }
  }

  // 3. Update request status to APPROVED (trigger will notify the admin)
  const { error: updateError } = await supabase
    .from("taxonomy_change_requests")
    .update({ status: "APPROVED", reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  if (updateError) throw updateError;

  // 4. Resolve the owner notification
  await supabase
    .from("owner_notifications")
    .update({ is_resolved: true })
    .eq("reference_id", requestId)
    .eq("type", "TAXONOMY_REQUEST");
}

/** Owner: reject a taxonomy change request. */
export async function rejectTaxonomyChangeRequest(
  requestId: string,
): Promise<void> {
  const { error } = await supabase
    .from("taxonomy_change_requests")
    .update({ status: "REJECTED", reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw error;

  // Resolve the owner notification
  await supabase
    .from("owner_notifications")
    .update({ is_resolved: true })
    .eq("reference_id", requestId)
    .eq("type", "TAXONOMY_REQUEST");
}

// ── Owner notifications ─────────────────────────────────────────────────

export type OwnerNotificationType =
  | "TAXONOMY_REQUEST"
  | "SELLER_APPLICATION"
  | "SYSTEM_ALERT"
  | "REPORT";

export interface OwnerNotification {
  id: string;
  type: OwnerNotificationType;
  heading: string;
  body: string;
  metadata: Record<string, unknown> | null;
  reference_id: string | null;
  is_resolved: boolean;
  created_at: string;
}

export const notificationLabels: Record<OwnerNotificationType, string> = {
  TAXONOMY_REQUEST: "درخواست تغییر گزینه‌ها",
  SELLER_APPLICATION: "درخواست فروشندگی",
  SYSTEM_ALERT: "هشدار سیستم",
  REPORT: "گزارش",
};

/** Fetch unresolved notifications for the owner. */
export async function fetchOwnerNotifications(): Promise<OwnerNotification[]> {
  const { data, error } = await supabase
    .from("owner_notifications")
    .select("*")
    .eq("is_resolved", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as OwnerNotification[];
}

/** Fetch all notifications for the owner (resolved + unresolved). */
export async function fetchAllOwnerNotifications(
  limit = 50,
): Promise<OwnerNotification[]> {
  const { data, error } = await supabase
    .from("owner_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as OwnerNotification[];
}

/** Mark a notification as resolved. */
export async function resolveNotification(
  notificationId: string,
): Promise<void> {
  const { error } = await supabase
    .from("owner_notifications")
    .update({ is_resolved: true })
    .eq("id", notificationId);

  if (error) throw error;
}

/** Report a listing to the owner/staff inbox.
 *  Uses a service-role API route so any logged-in user can report
 *  (owner_notifications RLS only allows staff to insert directly). */
export async function reportListing(input: {
  listingId: string;
  listingLabel: string;
  reason?: string;
}): Promise<void> {
  const res = await fetch(`/api/listings/${input.listingId}/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      listingLabel: input.listingLabel,
      reason: input.reason ?? null,
    }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "خطا در ثبت گزارش");
  }
}
