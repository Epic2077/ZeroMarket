import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll() {},
        },
      },
    );

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "ADMIN" && profile.role !== "OWNER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Query params
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = Math.min(
      100,
      Math.max(5, Number(url.searchParams.get("pageSize")) || 20),
    );
    const search = url.searchParams.get("search") || "";
    const dateFrom = url.searchParams.get("dateFrom") || "";
    const dateTo = url.searchParams.get("dateTo") || "";

    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabase.from("buy_requests").select(
      `
        id, offered_price, message, status, created_at,
        buyer:buyer_id(full_name),
        seller:seller_id(full_name),
        listing:listing_id(brand, model, year, trim)
      `,
      { count: "exact" },
    );

    // Server-side search
    if (search.trim()) {
      const q = `%${search.trim()}%`;
      query = query.or(
        `buyer_id.full_name.ilike.${q},seller_id.full_name.ilike.${q},listing_id.brand.ilike.${q},listing_id.model.ilike.${q}`,
      );
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", `${dateTo}T23:59:59`);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return NextResponse.json({
      requests: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}
