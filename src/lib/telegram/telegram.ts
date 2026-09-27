// lib/telegram.ts

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// تابع ارسال پیام متنی
export async function sendMessage(
  chatId: string | number,
  text: string,
  replyMarkup?: any,
) {
  const payload: any = {
    chat_id: chatId,
    text: text,
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// تابع جدید: ارسال فایل (Document)
export async function sendDocument(
  chatId: string | number,
  documentUrl: string,
  caption: string,
) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      document: documentUrl, // لینک مستقیم فایل
      caption: caption, // متنی که زیر فایل نوشته می‌شود
    }),
  });
}

// تابع منوی اصلی
export async function sendWelcomeMessage(chatId: string | number) {
  const text =
    "سلام! به ربات دریافت فایل‌های قراردادی خوش آمدید 📄\n\nلطفاً فایل مورد نیاز خود را از منوی زیر انتخاب کنید:";

  const replyMarkup = {
    inline_keyboard: [
      // ردیف اول دکمه‌ها (فایل‌های قرارداد)
      [
        { text: "📝 دریافت فایل قولنامه", callback_data: "get_gholnameh" },
        { text: "⚖️ دریافت فایل وکالت‌نامه", callback_data: "get_vekalat" },
      ],
      // ردیف دوم (پشتیبانی و سایت)
      [
        { text: "🌐 ورود به وب‌سایت", url: "https://khodroju.ir" },
        { text: "🎧 پشتیبانی", callback_data: "contact_support" },
      ],
    ],
  };

  await sendMessage(chatId, text, replyMarkup);
}

// تابع پشتیبانی
export async function sendSupportInfo(chatId: string | number) {
  const text =
    "برای ارتباط با تیم پشتیبانی و پیگیری قراردادها به آیدی @YourAdminID پیام دهید.";
  await sendMessage(chatId, text);
}
