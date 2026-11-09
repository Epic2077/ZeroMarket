import { NextResponse } from "next/server";

const BOT_SERVICE_TOKEN = process.env.BOT_SERVICE_TOKEN;

export function authorizeTelegramBot(request: Request): NextResponse | null {
  if (!BOT_SERVICE_TOKEN) {
    console.error("BOT_SERVICE_TOKEN is not configured.");
    return NextResponse.json(
      { error: "Telegram bot integration is not configured." },
      { status: 500 },
    );
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${BOT_SERVICE_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}
