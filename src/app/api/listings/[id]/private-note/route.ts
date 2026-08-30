import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

/** GET /api/listings/[id]/private-note
 *  Returns the seller's private note for a listing.
 *  Only accessible to: the listing's seller, admins, and the app owner. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: listingId } = await params;

    const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseAnonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

    // ── Authenticate ──────────────────────────────────────────────
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

    // ── Fetch listing to determine seller ─────────────────────────
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("seller_id")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // ── Authorize: only seller, admin, or owner ───────────────────
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const isOwnerOrAdmin = profile.role === "OWNER" || profile.role === "ADMIN";
    const isSeller = user.id === listing.seller_id;

    if (!isOwnerOrAdmin && !isSeller) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Fetch the private note ────────────────────────────────────
    const { data: noteData, error: noteError } = await supabase
      .from("listing_private_notes")
      .select("note")
      .eq("listing_id", listingId)
      .maybeSingle();

    if (noteError) {
      return NextResponse.json({ error: noteError.message }, { status: 500 });
    }

    return NextResponse.json({
      note: (noteData as { note: string } | null)?.note ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
