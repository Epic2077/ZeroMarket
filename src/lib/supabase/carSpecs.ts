import { supabase } from "./client";

// ── Row shapes ──────────────────────────────────────────────────────────

export interface CarSpecRow {
  id: string;
  brand: string;
  model: string;
  year: string | null; // null = global default for all years
  engine: string;
  transmission: string;
  fuel_type: string;
  body_type: string;
  created_at: string;
  updated_at: string;
}

export type CarSpecChangeAction = "ADD" | "UPDATE" | "DELETE";

export interface CarSpecChangeRequest {
  id: string;
  action: CarSpecChangeAction;
  brand: string;
  model: string;
  year: string | null;
  engine: string | null;
  transmission: string | null;
  fuel_type: string | null;
  body_type: string | null;
  old_brand?: string | null;
  old_model?: string | null;
  old_year?: string | null;
  requested_by: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  reviewed_at: string | null;
}

export interface CarSpecInput {
  brand: string;
  model: string;
  year: string | null;
  engine: string;
  transmission: string;
  fuel_type: string;
  body_type: string;
}

// ── Fetchers ────────────────────────────────────────────────────────────

/** Fetch all car specs rows. */
export async function fetchAllCarSpecs(): Promise<CarSpecRow[]> {
  const { data, error } = await supabase
    .from("car_specs")
    .select("*")
    .order("brand", { ascending: true })
    .order("model", { ascending: true })
    .order("year", { ascending: true, nullsFirst: true });

  if (error) throw error;
  return (data ?? []) as CarSpecRow[];
}

/** Fetch specs for a specific brand+model combo (used by ProductEditor auto-fill). */
export async function fetchCarSpecsByBrandModel(
  brand: string,
  model: string,
  year?: string | null,
): Promise<CarSpecRow | null> {
  let query = supabase
    .from("car_specs")
    .select("*")
    .eq("brand", brand)
    .eq("model", model)
    .order("year", { ascending: false, nullsFirst: false });

  if (year) {
    // Try exact year match first
    const { data: exact } = await query.eq("year", year).maybeSingle();
    if (exact) return exact as CarSpecRow;

    // Fallback: null-year (global default) for this model
    const { data: fallback } = await supabase
      .from("car_specs")
      .select("*")
      .eq("brand", brand)
      .eq("model", model)
      .is("year", null)
      .maybeSingle();
    if (fallback) return fallback as CarSpecRow;

    // Last resort: any year for this model (newest first)
    const { data: anyYear } = await supabase
      .from("car_specs")
      .select("*")
      .eq("brand", brand)
      .eq("model", model)
      .order("year", { ascending: false })
      .limit(1)
      .maybeSingle();
    return (anyYear as CarSpecRow) ?? null;
  }

  // No year provided: prefer global default, then newest
  const { data: fallback } = await query.is("year", null).maybeSingle();
  if (fallback) return fallback as CarSpecRow;

  const { data } = await query.limit(1).maybeSingle();
  return (data as CarSpecRow) ?? null;
}

// ── Owner direct mutations ──────────────────────────────────────────────

/** Owner: upsert a car spec (insert or update). */
export async function ownerUpsertCarSpec(
  input: CarSpecInput,
  existingId?: string,
): Promise<void> {
  if (existingId) {
    const { error } = await supabase
      .from("car_specs")
      .update({
        brand: input.brand,
        model: input.model,
        year: input.year,
        engine: input.engine,
        transmission: input.transmission,
        fuel_type: input.fuel_type,
        body_type: input.body_type,
      })
      .eq("id", existingId);

    if (error) throw error;
  } else {
    const { error } = await supabase.from("car_specs").insert({
      brand: input.brand,
      model: input.model,
      year: input.year,
      engine: input.engine,
      transmission: input.transmission,
      fuel_type: input.fuel_type,
      body_type: input.body_type,
    });

    if (error) {
      // 23505 = duplicate (brand, model, year) unique violation
      if (error.code === "23505") {
        throw new Error("این ترکیب برند، مدل و سال قبلاً ثبت شده است");
      }
      throw error;
    }
  }
}

/** Owner: delete a car spec by id. */
export async function ownerDeleteCarSpec(id: string): Promise<void> {
  const { error } = await supabase.from("car_specs").delete().eq("id", id);

  if (error) throw error;
}

// ── Admin change requests ───────────────────────────────────────────────

export interface CarSpecChangeInput {
  action: CarSpecChangeAction;
  brand: string;
  model: string;
  year: string | null;
  engine?: string | null;
  transmission?: string | null;
  fuel_type?: string | null;
  body_type?: string | null;
  oldBrand?: string;
  oldModel?: string;
  oldYear?: string | null;
  requestedBy: string;
}

/** Admin: submit a car spec change request for owner approval. */
export async function requestCarSpecChange(
  input: CarSpecChangeInput,
): Promise<void> {
  const { error } = await supabase.from("car_specs_change_requests").insert({
    action: input.action,
    brand: input.brand,
    model: input.model,
    year: input.year,
    engine: input.engine ?? null,
    transmission: input.transmission ?? null,
    fuel_type: input.fuel_type ?? null,
    body_type: input.body_type ?? null,
    old_brand: input.oldBrand ?? null,
    old_model: input.oldModel ?? null,
    old_year: input.oldYear ?? null,
    requested_by: input.requestedBy,
    status: "PENDING",
  });

  if (error) throw error;
}

/** Fetch pending car spec change requests. */
export async function fetchCarSpecChangeRequests(): Promise<
  CarSpecChangeRequest[]
> {
  const { data, error } = await supabase
    .from("car_specs_change_requests")
    .select("*")
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CarSpecChangeRequest[];
}

/** Owner: approve a car spec change request (trigger handles the actual mutation). */
export async function approveCarSpecChangeRequest(
  requestId: string,
): Promise<void> {
  const { error } = await supabase
    .from("car_specs_change_requests")
    .update({ status: "APPROVED", reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw error;

  // Resolve owner notification
  await supabase
    .from("owner_notifications")
    .update({ is_resolved: true })
    .eq("reference_id", requestId)
    .eq("type", "CAR_SPECS_REQUEST");
}

/** Owner: reject a car spec change request. */
export async function rejectCarSpecChangeRequest(
  requestId: string,
): Promise<void> {
  const { error } = await supabase
    .from("car_specs_change_requests")
    .update({ status: "REJECTED", reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw error;

  // Resolve owner notification
  await supabase
    .from("owner_notifications")
    .update({ is_resolved: true })
    .eq("reference_id", requestId)
    .eq("type", "CAR_SPECS_REQUEST");
}

/** Describe a change request in Persian. */
export function describeCarSpecChange(req: CarSpecChangeRequest): string {
  const yearLabel = req.year ?? "همه سال‌ها";
  const car = `${req.brand} ${req.model} (${yearLabel})`;

  switch (req.action) {
    case "ADD":
      return `افزودن مشخصات فنی برای ${car}`;
    case "UPDATE":
      return `ویرایش مشخصات فنی ${car}`;
    case "DELETE":
      return `حذف مشخصات فنی ${car}`;
    default:
      return "تغییر نامشخص";
  }
}
