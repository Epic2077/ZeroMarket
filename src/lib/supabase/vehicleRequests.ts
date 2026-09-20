import { supabase } from "./client";

export type VehicleRequestStatus =
  | "PENDING"
  | "CONTACTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface VehicleRequestRow {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  purchase_method: string;
  first_name: string;
  last_name: string;
  city: string;
  phone: string;
  status: VehicleRequestStatus;
  created_at: string;
  updated_at: string;
  user_email?: string | null;
}

export async function fetchVehicleRequests(
  userId?: string,
): Promise<VehicleRequestRow[]> {
  let query = supabase
    .from("vehicle_requests")
    .select(
      "id, user_id, brand, model, purchase_method, first_name, last_name, city, phone, status, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) throw error;

  const requests = (data ?? []) as VehicleRequestRow[];
  if (userId || requests.length === 0) return requests;

  const userIds = [...new Set(requests.map((request) => request.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  const emailByUserId = new Map(
    ((profiles ?? []) as { id: string; email: string | null }[]).map(
      (profile) => [profile.id, profile.email],
    ),
  );

  return requests.map((request) => ({
    ...request,
    user_email: emailByUserId.get(request.user_id) ?? null,
  }));
}

export async function deleteVehicleRequest(requestId: string): Promise<void> {
  const { error } = await supabase
    .from("vehicle_requests")
    .delete()
    .eq("id", requestId);

  if (error) throw error;
}
