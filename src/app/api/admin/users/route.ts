import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseAnonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

    // ── 1. Create a Supabase client that reads the session cookie from the request ──
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {
          // No need to set cookies in a GET handler
        },
      },
    });

    // ── 2. Verify JWT + get user ──
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 3. Load profile ──
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // ── 4. Check role (only ADMIN or OWNER) ──
    if (profile.role !== "ADMIN" && profile.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── 5. Pagination params ──
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.max(1, Number(url.searchParams.get("limit") ?? 20));
    const offset = (page - 1) * limit;

    // ── 6. Query profiles with service role (bypasses RLS to get all users) ──
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: users,
      error,
      count,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, email, full_name, phone, city, bio, avatar_path, role, status, verified, seller_application_status, seller_slug, banner_preset_id, banner_image_path, response_rate, total_views, total_sales_volume, created_at, updated_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── 7. Return JSON ──
    return NextResponse.json({
      users,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
