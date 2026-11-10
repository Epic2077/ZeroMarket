import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { authorizeTelegramBot } from "@/lib/telegram/botAuth";
import { NextResponse } from "next/server";

function escapePostgrestValue(value: string) {
  return value.replace(/[\\,%()]/g, "\\$&");
}

export async function GET(request: Request) {
  try {
    const unauthorized = authorizeTelegramBot(request);
    if (unauthorized) return unauthorized;

    const params = new URL(request.url).searchParams;
    const fullname = params.get("fullname")?.trim();
    const chatId = params.get("chatId")?.trim() || params.get("id")?.trim();

    let query = supabaseAdmin
      .from("bot_users")
      .select("*")
      .order("last_active", { ascending: false });

    if (chatId) {
      if (!/^-?\d+$/.test(chatId)) {
        return NextResponse.json(
          { error: "id or chatId must be a valid Telegram chat ID." },
          { status: 400 },
        );
      }

      query = query.eq("chat_id", Number(chatId));
    }

    if (fullname) {
      for (const term of fullname.split(/\s+/).filter(Boolean)) {
        const search = escapePostgrestValue(term);
        query = query.or(
          `first_name.ilike.%${search}%,last_name.ilike.%${search}%`,
        );
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ users: data ?? [] });
  } catch (error) {
    console.error("Error loading Telegram users:", error);
    return NextResponse.json(
      { error: "Could not load Telegram users." },
      { status: 500 },
    );
  }
}
