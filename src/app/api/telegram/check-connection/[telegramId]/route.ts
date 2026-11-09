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
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, telegram_id, telegram_username, telegram_connected_at")
      .eq("telegram_id", telegramId)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      connected: Boolean(data),
      telegramId: data?.telegram_id ?? null,
      telegramUsername: data?.telegram_username ?? null,
      connectedAt: data?.telegram_connected_at ?? null,
    });
  } catch (error) {
    console.error("Error checking Telegram connection:", error);
    return NextResponse.json(
      { error: "خطا در بررسی اتصال تلگرام." },
      { status: 500 },
    );
  }
}
