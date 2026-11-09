import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { authorizeTelegramBot } from "@/lib/telegram/botAuth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ telegramId: string }> },
) {
  try {
    const unauthorized = authorizeTelegramBot(request);
    if (unauthorized) return unauthorized;

    const { telegramId } = await params;
    if (!telegramId.trim()) {
      return NextResponse.json({ error: "Telegram ID is required." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, role, status, full_name, telegram_id, telegram_username")
      .eq("telegram_id", telegramId)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      connected: Boolean(data),
      profile: data
        ? {
            id: data.id,
            role: data.role,
            status: data.status,
            fullName: data.full_name,
            telegramId: data.telegram_id,
            telegramUsername: data.telegram_username,
          }
        : null,
    });
  } catch (error) {
    console.error("Error loading Telegram session:", error);
    return NextResponse.json(
      { error: "Could not load Telegram session." },
      { status: 500 },
    );
  }
}
