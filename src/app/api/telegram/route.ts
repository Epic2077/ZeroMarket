// app/api/telegram/route.ts

import {
  sendMessage,
  sendSupportInfo,
  sendWelcomeMessage,
} from "@/lib/telegram/telegram";
import { NextResponse } from "next/server";
// Import your new functions (adjust the path if you use the 'src' directory)
export async function POST(req: Request) {
  try {
    const update = await req.json();

    // 1. Handle Button Clicks (Callback Queries)
    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;
      const buttonData = update.callback_query.data;

      if (buttonData === "contact_support") {
        await sendSupportInfo(chatId);
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    // 2. Handle Text Commands
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      if (text === "/start") {
        await sendWelcomeMessage(chatId);
      } else {
        await sendMessage(
          chatId,
          "متوجه نشدم. لطفاً برای مشاهده منوی اصلی روی /start کلیک کنید.",
        );
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
