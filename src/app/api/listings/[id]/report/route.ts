import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

/** POST /api/listings/[id]/report
 *  Reports a listing to the owner/staff inbox. Any logged-in user may report. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: listingId } = await params;

    const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseAnonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

    // ── Authenticate the reporter ─────────────────────────────────
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {
          // read-only
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      listingLabel?: string;
      reason?: string | null;
    };
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    const listingLabel =
      typeof body.listingLabel === "string" ? body.listingLabel.trim() : "";

    // ── Insert with service role (bypasses RLS) ──────────────────
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const reporter = (profile as { full_name?: string } | null)?.full_name ?? "کاربر";
    const description = listingLabel
      ? `آگهی «${listingLabel}» توسط ${reporter} گزارش شد.${reason ? `\nدلیل: ${reason}` : ""}`
      : `کاربر ${reporter} یک آگهی را گزارش کرد.${reason ? `\nدلیل: ${reason}` : ""}`;

    const { error: insertError } = await supabaseAdmin
      .from("owner_notifications")
      .insert({
        type: "REPORT",
        heading: "گزارش آگهی",
        body: description,
        metadata: {
          listing_id: listingId,
          reason: reason || null,
          reporter_id: user.id,
        },
        reference_id: listingId,
        is_resolved: false,
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
