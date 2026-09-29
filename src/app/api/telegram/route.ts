// app/api/telegram/route.ts

import {
  sendCategoryMenu,
  sendDocument,
  sendMessage,
  sendSupportInfo,
  sendWelcomeMessage,
  isAdmin,
  trackUser,
  getAdminState,
  getAdminSessionData,
  clearAdminState,
  incrementDownload,
  handleAdminCallback,
  handleAdminFileUpload,
  handleAddCategory,
  sendAdminWelcomeMessage,
  getFile,
  seedInitialData,
} from "@/lib/telegram/telegram";
import { NextResponse } from "next/server";

// Seed initial data on module load (runs once per serverless function cold start)
let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedInitialData();
    seeded = true;
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const update = await req.json();
    const BASE_URL = "https://khodroju.ir";

    // Track user info (fire-and-forget)
    if (update.message?.from) {
      const user = update.message.from;
      trackUser({
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    } else if (update.callback_query?.from) {
      const user = update.callback_query.from;
      trackUser({
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    }

    // ==========================================
    // ۱. مدیریت کلیک روی دکمه‌ها شیشه‌ای
    // ==========================================
    if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;
      const buttonData = update.callback_query.data;

      // Check if admin
      const adminCheck = isAdmin(chatId);

      // Handle buttons that work for BOTH admins and users FIRST
      if (buttonData === "contact_support") {
        await sendSupportInfo(chatId);
        return NextResponse.json({ success: true });
      }
      if (buttonData === "main_menu") {
        if (adminCheck) {
          await clearAdminState(chatId);
          await sendAdminWelcomeMessage(chatId);
        } else {
          await sendWelcomeMessage(chatId);
        }
        return NextResponse.json({ success: true });
      }

      if (adminCheck) {
        // Admin callback handling
        await handleAdminCallback(chatId, buttonData);
        return NextResponse.json({ success: true });
      }

      // User callback handling

      // اگر روی یکی از "دسته‌بندی‌ها" کلیک شد (مثلاً cat_contracts)
      else if (buttonData.startsWith("cat_")) {
        const categoryKey = buttonData.replace("cat_", "");
        await sendCategoryMenu(chatId, categoryKey);
      }

      // اگر روی یکی از "فایل‌ها" کلیک شد (مثلاً file_gholnameh)
      else if (buttonData.startsWith("file_")) {
        const fileId = buttonData.replace("file_", "");

        const targetFile = await getFile(fileId);

        if (targetFile) {
          await incrementDownload(fileId);
          const fileUrl = `${BASE_URL}/files/${targetFile.filename}`;
          await sendMessage(chatId, `در حال ارسال ${targetFile.title}... ⏳`);
          await sendDocument(chatId, fileUrl, targetFile.title);
        } else {
          await sendMessage(chatId, "❌ فایل مورد نظر یافت نشد.");
        }
      }

      return NextResponse.json({ success: true });
    }

    // ==========================================
    // ۲. مدیریت تایپ دستورات متنی و آپلود فایل
    // ==========================================
    if (update.message) {
      const chatId = update.message.chat.id;
      const adminCheck = isAdmin(chatId);
      const step = await getAdminState(chatId);
      const sessionData = await getAdminSessionData(chatId);

      // Handle admin document upload
      if (adminCheck && update.message.document && step === "add_file_upload" && sessionData.selectedCategory) {
        await handleAdminFileUpload(chatId, update.message.document, sessionData.selectedCategory);
        return NextResponse.json({ success: true });
      }

      // Handle admin text input for category name
      if (adminCheck && update.message.text && step === "add_category_name") {
        await handleAddCategory(chatId, update.message.text);
        return NextResponse.json({ success: true });
      }

      // Handle text commands
      if (update.message.text) {
        const text = update.message.text;

        if (text === "/start") {
          if (adminCheck) {
            await clearAdminState(chatId);
            await sendAdminWelcomeMessage(chatId);
          } else {
            await sendWelcomeMessage(chatId);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
