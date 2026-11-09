import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { authorizeTelegramBot } from "@/lib/telegram/botAuth";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export async function verifyTelegramLink(
  code: string,
  telegramId: string,
  telegramUsername: string | null,
) {
  const codeHash = createHash("sha256")
    .update(code.toUpperCase())
    .digest("hex");

  const { data, error } = await supabaseAdmin.rpc("complete_telegram_link", {
    p_code_hash: codeHash,
    p_telegram_id: telegramId,
    p_telegram_username: telegramUsername,
  });

  if (error) {
    throw new Error("Could not verify Telegram account.");
  }

  return data?.[0];
}

export async function POST(request: Request) {
  try {
    const unauthorized = authorizeTelegramBot(request);
    if (unauthorized) return unauthorized;

    const body = (await request.json()) as {
      code?: string;
      telegramId?: string;
      telegramUsername?: string | null;
    };

    if (!body.code?.trim() || !body.telegramId?.trim()) {
      return NextResponse.json(
        { error: "Code and Telegram ID are required." },
        { status: 400 },
      );
    }

    const result = await verifyTelegramLink(
      body.code.trim(),
      body.telegramId.trim(),
      body.telegramUsername ?? null,
    );

    return NextResponse.json(
      result
        ? {
            result: "linked",
            linked_user_id: result.user_id,
          }
        : {
            result: "invalid_or_expired",
            linked_user_id: null,
          },
    );
  } catch (error) {
    console.error("Error verifying Telegram link:", error);
    return NextResponse.json(
      { error: "Could not verify Telegram account." },
      { status: 500 },
    );
  }
}
