import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { authorizeTelegramBot } from "@/lib/telegram/botAuth";
import { NextResponse } from "next/server";

type TaxonomyCategory = "BRAND" | "FAMILY" | "MODEL";

function isCategory(value: unknown): value is TaxonomyCategory {
  return value === "BRAND" || value === "FAMILY" || value === "MODEL";
}

async function requireOwner(telegramId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("role, status")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (error) throw error;
  return data?.role === "OWNER" && data.status === "ACTIVE";
}

export async function GET(request: Request) {
  try {
    const unauthorized = authorizeTelegramBot(request);
    if (unauthorized) return unauthorized;

    const params = new URL(request.url).searchParams;
    const telegramId = params.get("telegramId");
    const category = params.get("category");

    if (!telegramId || !isCategory(category)) {
      return NextResponse.json(
        { error: "telegramId and a valid category are required." },
        { status: 400 },
      );
    }

    if (!(await requireOwner(telegramId))) {
      return NextResponse.json({ error: "Owner access required." }, { status: 403 });
    }

    let query = supabaseAdmin
      .from("taxonomy_options")
      .select("id, category, value, metadata")
      .eq("category", category)
      .order("value", { ascending: true });

    const brand = params.get("brand");
    const family = params.get("family");
    if (brand) query = query.eq("metadata->>brand", brand);
    if (family) query = query.eq("metadata->>family", family);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ options: data ?? [] });
  } catch (error) {
    console.error("Error loading Telegram taxonomy:", error);
    return NextResponse.json(
      { error: "Could not load taxonomy." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const unauthorized = authorizeTelegramBot(request);
    if (unauthorized) return unauthorized;

    const body = (await request.json()) as {
      telegramId?: string;
      category?: TaxonomyCategory;
      values?: string[];
      metadata?: Record<string, unknown> | null;
    };

    if (!body.telegramId || !isCategory(body.category) || !body.values?.length) {
      return NextResponse.json(
        { error: "telegramId, category, and values are required." },
        { status: 400 },
      );
    }
    if (!(await requireOwner(body.telegramId))) {
      return NextResponse.json({ error: "Owner access required." }, { status: 403 });
    }

    const values = [...new Set(body.values.map((value) => value.trim()).filter(Boolean))];
    if (!values.length) {
      return NextResponse.json({ error: "At least one value is required." }, { status: 400 });
    }

    const rows = values.map((value) => ({
      category: body.category,
      value,
      metadata: body.metadata ?? null,
    }));
    const { data, error } = await supabaseAdmin
      .from("taxonomy_options")
      .upsert(rows, { onConflict: "category,value" })
      .select("id, category, value, metadata");

    if (error) throw error;
    return NextResponse.json({ options: data ?? [] }, { status: 201 });
  } catch (error) {
    console.error("Error adding Telegram taxonomy:", error);
    return NextResponse.json(
      { error: "Could not add taxonomy values." },
      { status: 500 },
    );
  }
}
