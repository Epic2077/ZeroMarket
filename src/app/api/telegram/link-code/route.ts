import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { randomBytes, createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Use your existing server-side Supabase admin client.
// Use your existing authentication helper too.

export async function generateTelegramLinkCode(userId: string) {
  // Generate an 8-character hexadecimal code.
  const code = randomBytes(4).toString("hex").toUpperCase();

  // Hash the code before storing it.
  const codeHash = createHash("sha256").update(code).digest("hex");

  const { data: expiresAt, error } = await supabaseAdmin.rpc(
    "create_telegram_link_code",
    {
      p_user_id: userId,
      p_code_hash: codeHash,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    code,
    expiresAt,
  };
}

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "برای دریافت کد باید وارد حساب کاربری شوید." },
        { status: 401 },
      );
    }

    const linkCode = await generateTelegramLinkCode(user.id);
    return NextResponse.json(linkCode);
  } catch (error) {
    console.error("Error generating Telegram link code:", error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "خطا در ایجاد کد اتصال تلگرام.",
      },
      { status: 500 },
    );
  }
}
