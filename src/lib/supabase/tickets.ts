import { supabase } from "./client";

// ── Types ────────────────────────────────────────────────────────────

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface TicketRow {
  id: string;
  user_id: string;
  subject: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  /** Joined profile fields */
  user_name?: string;
  user_email?: string;
}

export interface TicketMessageRow {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  attachment_url: string | null;
  created_at: string;
  /** Joined profile fields */
  sender_name?: string;
  sender_role?: string;
}

// ── Fetchers ─────────────────────────────────────────────────────────

/** Fetch tickets — all for admins, own for users. */
export async function fetchTickets(
  userId: string,
  isAdmin: boolean,
): Promise<TicketRow[]> {
  let query = supabase
    .from("tickets")
    .select("*")
    .order("updated_at", { ascending: false });

  if (!isAdmin) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as any[];

  // Fetch profile names separately (avoids RLS issues with join).
  // Only admins get email — regular users only see names.
  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select(isAdmin ? "id, full_name, email" : "id, full_name")
    .in("id", userIds);
  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    subject: row.subject,
    status: row.status as TicketStatus,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user_name: profileMap.get(row.user_id)?.full_name ?? "کاربر",
    user_email: isAdmin ? (profileMap.get(row.user_id)?.email ?? "") : "",
  }));
}

/** Fetch a single ticket by id. Set isAdmin=true to include email. */
export async function fetchTicket(
  id: string,
  isAdmin = false,
): Promise<TicketRow | null> {
  const { data, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  const row = data as any;

  const { data: profile } = await supabase
    .from("profiles")
    .select(isAdmin ? "full_name, email" : "full_name")
    .eq("id", row.user_id)
    .maybeSingle();

  return {
    id: row.id,
    user_id: row.user_id,
    subject: row.subject,
    status: row.status as TicketStatus,
    created_at: row.created_at,
    updated_at: row.updated_at,
    user_name: (profile as any)?.full_name ?? "کاربر",
    user_email: isAdmin ? ((profile as any)?.email ?? "") : "",
  };
}

/** Fetch all messages for a ticket, ordered chronologically. */
export async function fetchTicketMessages(
  ticketId: string,
): Promise<TicketMessageRow[]> {
  const { data, error } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as any[];
  const senderIds = [...new Set(rows.map((r) => r.sender_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("id", senderIds);
  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  return rows.map((row) => ({
    id: row.id,
    ticket_id: row.ticket_id,
    sender_id: row.sender_id,
    message: row.message,
    attachment_url: row.attachment_url ?? null,
    created_at: row.created_at,
    sender_name: profileMap.get(row.sender_id)?.full_name ?? "کاربر",
    sender_role: profileMap.get(row.sender_id)?.role ?? "USER",
  }));
}

// ── Mutations ────────────────────────────────────────────────────────

/** Create a ticket + its first message. Returns the new ticket id. */
export async function createTicket(
  userId: string,
  subject: string,
  message: string,
  attachmentUrl?: string,
): Promise<string> {
  // 1. Create ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .insert({ user_id: userId, subject, status: "OPEN" })
    .select("id")
    .single();

  if (ticketError || !ticket)
    throw ticketError ?? new Error("خطا در ایجاد تیکت");

  // 2. Create first message
  const { error: msgError } = await supabase.from("ticket_messages").insert({
    ticket_id: ticket.id,
    sender_id: userId,
    message,
    attachment_url: attachmentUrl ?? null,
  });

  if (msgError) throw msgError;

  return ticket.id;
}

/** Add a reply message to a ticket. */
export async function addTicketMessage(
  ticketId: string,
  senderId: string,
  message: string,
  attachmentUrl?: string,
): Promise<void> {
  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: ticketId,
    sender_id: senderId,
    message,
    attachment_url: attachmentUrl ?? null,
  });

  if (error) throw error;

  // Touch the ticket's updated_at
  await supabase
    .from("tickets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", ticketId);
}

/** Update ticket status (admin/owner). */
export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
): Promise<void> {
  const { error } = await supabase
    .from("tickets")
    .update({ status })
    .eq("id", ticketId);

  if (error) throw error;
}

// ── Storage ──────────────────────────────────────────────────────────

/** Upload a file to the ticket_attachments bucket. Returns public URL. */
export async function uploadTicketAttachment(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("ticket_attachments")
    .upload(path, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("ticket_attachments")
    .getPublicUrl(path);
  return data.publicUrl;
}

// ── Realtime ─────────────────────────────────────────────────────────

/** Subscribe to new messages on a ticket. Calls onMessage for each insert. */
export function subscribeToTicketMessages(
  ticketId: string,
  onMessage: (msg: TicketMessageRow) => void,
) {
  return supabase
    .channel(`ticket-${ticketId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "ticket_messages",
        filter: `ticket_id=eq.${ticketId}`,
      },
      async (payload) => {
        const raw = payload.new as any;
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", raw.sender_id)
          .maybeSingle();

        onMessage({
          id: raw.id,
          ticket_id: raw.ticket_id,
          sender_id: raw.sender_id,
          message: raw.message,
          attachment_url: raw.attachment_url ?? null,
          created_at: raw.created_at,
          sender_name: (profile as any)?.full_name ?? "کاربر",
          sender_role: (profile as any)?.role ?? "USER",
        });
      },
    )
    .subscribe();
}
