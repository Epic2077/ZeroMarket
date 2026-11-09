import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ connected: false }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("telegram_id, telegram_username, telegram_connected_at")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      connected: Boolean(data?.telegram_id),
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
