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
  updateAdminSessionData,
  setAdminState,
  clearAdminState,
  incrementDownload,
  handleAdminCallback,
  handleAdminFileUpload,
  handleAddCategory,
  handleAddSubcategory,
  handleEditCategory,
  handleEditFileDescription,
  sendAdminWelcomeMessage,
  getFile,
  seedInitialData,
  sendAddFileDescriptionPrompt,
  sendAddFileUploadPrompt,
  sendFileSaveLocationPrompt,
  setBotCommands,
  hasPhoneNumber,
  sendPhoneRequest,
  updateUserPhone,
  getTelegramFileUrl,
} from "@/lib/telegram/telegram";
import { NextResponse } from "next/server";

// Seed initial data on module load (runs once per serverless function cold start)
let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedInitialData();
    await setBotCommands();
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
      console.log("Tracking user from message:", user.id);
      trackUser({
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    } else if (update.callback_query?.from) {
      const user = update.callback_query.from;
      console.log("Tracking user from callback:", user.id);
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
      console.log("Callback query received:", { chatId, buttonData, adminCheck: isAdmin(chatId) });

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

      // Handle category and file clicks for BOTH admins and users
      if (buttonData.startsWith("cat_")) {
        console.log("Category click:", { chatId, buttonData, adminCheck });
        if (!adminCheck) {
          const hasPhone = await hasPhoneNumber(chatId);
          console.log("Phone check for category:", { chatId, hasPhone });
          if (!hasPhone) {
            await sendPhoneRequest(chatId);
            return NextResponse.json({ success: true });
          }
        }
        const categoryKey = buttonData.replace("cat_", "");
        await sendCategoryMenu(chatId, categoryKey);
        return NextResponse.json({ success: true });
      }
      if (buttonData.startsWith("file_")) {
        console.log("File click:", { chatId, buttonData, adminCheck });
        if (!adminCheck) {
          const hasPhone = await hasPhoneNumber(chatId);
          console.log("Phone check for file:", { chatId, hasPhone });
          if (!hasPhone) {
            await sendPhoneRequest(chatId);
            return NextResponse.json({ success: true });
          }
        }
        const fileId = buttonData.replace("file_", "");
        console.log("Getting file:", fileId);
        const targetFile = await getFile(fileId);
        console.log("File found:", targetFile);
        if (targetFile) {
          await incrementDownload(fileId, chatId);
          
          // Generate download link
          let downloadUrl: string;
          if (targetFile.telegram_file_id) {
            const telegramUrl = await getTelegramFileUrl(targetFile.telegram_file_id);
            downloadUrl = telegramUrl || `${BASE_URL}/files/${targetFile.filename}`;
          } else {
            downloadUrl = `${BASE_URL}/files/${targetFile.filename}`;
          }
          
          await sendMessage(
            chatId,
            `📄 ${targetFile.title}\n\n🔗 لینک دانلود:\n${downloadUrl}\n\nبرای دانلود روی لینک بالا کلیک کنید.`
          );
        } else {
          await sendMessage(chatId, "❌ فایل مورد نظر یافت نشد.");
        }
        return NextResponse.json({ success: true });
      }

      if (adminCheck) {
        // Admin callback handling
        await handleAdminCallback(chatId, buttonData);
        return NextResponse.json({ success: true });
      }

      // Fallback for unknown callback queries from regular users
      console.log("Unknown callback for non-admin:", { chatId, buttonData });
      await sendMessage(chatId, "❓ گزینه نامعتبر. به منوی اصلی برگردید:", {
        inline_keyboard: [
          [{ text: "🏠 منوی اصلی", callback_data: "main_menu" }],
        ],
      });
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
      if (adminCheck && update.message.document) {
        console.log("Admin document upload check:", { adminCheck, step, sessionData, hasDoc: !!update.message.document });
        if (step === "add_file_upload" && sessionData.selectedCategory) {
          console.log("Processing file upload for category:", sessionData.selectedCategory);
          await handleAdminFileUpload(chatId, update.message.document, sessionData.selectedCategory, undefined, sessionData.description);
          return NextResponse.json({ success: true });
        } else {
          console.log("File upload conditions not met");
        }
      }

      // Handle admin text input for description
      if (adminCheck && update.message.text && step === "add_file_description" && sessionData.selectedCategory) {
        const description = update.message.text.trim();
        await updateAdminSessionData(chatId, { ...sessionData, description });
        await setAdminState(chatId, "add_file_upload", { ...sessionData, description });
        await sendAddFileUploadPrompt(chatId, sessionData.selectedCategory, description);
        return NextResponse.json({ success: true });
      }

      // Handle admin text input for subcategory name
      if (adminCheck && update.message.text && step === "add_subcategory_name" && sessionData.selectedParentCategory) {
        await handleAddSubcategory(chatId, sessionData.selectedParentCategory, update.message.text.trim());
        return NextResponse.json({ success: true });
      }

      // Handle admin text input for category name
      if (adminCheck && update.message.text && step === "add_category_name") {
        await handleAddCategory(chatId, update.message.text);
        return NextResponse.json({ success: true });
      }

      // Handle admin text input for edit category name
      if (adminCheck && update.message.text && step === "edit_category_name" && sessionData.selectedCategory) {
        await handleEditCategory(chatId, sessionData.selectedCategory, update.message.text.trim());
        return NextResponse.json({ success: true });
      }

      // Handle admin text input for edit file description
      if (adminCheck && update.message.text && step === "edit_file_description" && sessionData.selectedFileId) {
        await handleEditFileDescription(chatId, sessionData.selectedFileId, update.message.text.trim());
        return NextResponse.json({ success: true });
      }

      // Handle phone number input (text)
      if (!adminCheck && update.message.text && step === "waiting_for_phone") {
        const phoneNumber = update.message.text.trim();
        console.log("Phone number input:", { chatId, phoneNumber });
        
        // Basic validation for Iranian phone numbers
        const phoneRegex = /^(\+98|0)?9\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
          await sendMessage(chatId, "❌ فرمت شماره تلفن نامعتبر است. لطفاً شماره موبایل ایرانی معتبر وارد کنید (مثال: 09123456789)");
          return NextResponse.json({ success: true });
        }
        
        // Normalize phone number to +98 format
        let normalizedPhone = phoneNumber;
        if (phoneNumber.startsWith("0")) {
          normalizedPhone = "+98" + phoneNumber.substring(1);
        } else if (!phoneNumber.startsWith("+98")) {
          normalizedPhone = "+98" + phoneNumber;
        }
        
        await updateUserPhone(chatId, normalizedPhone);
        await clearAdminState(chatId);
        await sendMessage(chatId, "✅ شماره تلفن تایید شد. خوش آمدید!");
        await sendWelcomeMessage(chatId);
        return NextResponse.json({ success: true });
      }

      // Handle text commands
      if (update.message.text) {
        const text = update.message.text;
        console.log("Text command:", { chatId, text, adminCheck });

        if (text === "/start") {
          if (adminCheck) {
            await clearAdminState(chatId);
            await sendAdminWelcomeMessage(chatId);
          } else {
            const hasPhone = await hasPhoneNumber(chatId);
            console.log("Phone check for /start:", { chatId, hasPhone });
            if (!hasPhone) {
              console.log("Calling sendPhoneRequest for:", chatId);
              await setAdminState(chatId, "waiting_for_phone");
              await sendPhoneRequest(chatId);
              console.log("sendPhoneRequest completed for:", chatId);
            } else {
              await sendWelcomeMessage(chatId);
            }
          }
        } else if (text === "/categories") {
          if (adminCheck) {
            await sendAdminWelcomeMessage(chatId);
          } else {
            const hasPhone = await hasPhoneNumber(chatId);
            if (!hasPhone) {
              await setAdminState(chatId, "waiting_for_phone");
              await sendPhoneRequest(chatId);
            } else {
              await sendWelcomeMessage(chatId);
            }
          }
        } else if (text === "/support") {
          await sendSupportInfo(chatId);
        } else if (!adminCheck) {
          // Fallback for unknown commands from regular users
          const hasPhone = await hasPhoneNumber(chatId);
          if (!hasPhone) {
            await setAdminState(chatId, "waiting_for_phone");
            await sendPhoneRequest(chatId);
          } else {
            await sendMessage(chatId, "❓ دستور نامعتبر. از منوی زیر استفاده کنید:", {
              inline_keyboard: [
                [{ text: "📂 دسته‌بندی‌ها", callback_data: "main_menu" }],
                [{ text: "🎧 پشتیبانی", callback_data: "contact_support" }],
              ],
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
