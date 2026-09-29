// lib/telegram.ts

import { createClient } from "@supabase/supabase-js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_IDS = (
  process.env.TELEGRAM_ADMIN_IDS ||
  process.env.TELEGRAM_ADMIN_ID ||
  ""
)
  .split(",")
  .map((id) => parseInt(id.trim()))
  .filter((id) => !isNaN(id));

// Supabase client (server-side with service role)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ==========================================
// 🗂️ Types
// ==========================================
export interface FileItem {
  id: string;
  title: string;
  filename: string;
  downloads: number;
  telegram_file_id?: string;
  category_key: string;
}

export interface Category {
  key: string;
  title: string;
  files: FileItem[];
}

export interface BotUser {
  chat_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_admin: boolean;
  last_active: string;
}

interface AdminSession {
  chat_id: number;
  step:
    | "main"
    | "add_file_category"
    | "add_file_upload"
    | "add_category_name"
    | "stats"
    | "users";
  data: Record<string, any>;
  updated_at: string;
}

// ==========================================
// 🔧 Database Helpers
// ==========================================

// In-memory cache (survives within same serverless invocation)
const categoriesCache = new Map<
  string,
  { data: Category[]; timestamp: number }
>();
const CACHE_TTL = 30_000; // 30 seconds

// Categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("key, title")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map((c) => ({ ...c, files: [] }));
}

export async function getCategory(key: string): Promise<Category | null> {
  const cached = categoriesCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    const cat = cached.data.find((c) => c.key === key);
    return cat || null;
  }

  // Single query with join
  const { data: files, error } = await supabase
    .from("files")
    .select(
      `
      *,
      categories!inner(key, title)
    `,
    )
    .eq("category_key", key)
    .order("created_at", { ascending: true });

  if (error || !files?.length) return null;

  const cat = files[0].categories as any;
  return {
    key: cat.key,
    title: cat.title,
    files: files.map((f: any) => {
      const { categories, ...file } = f;
      return file;
    }),
  };
}

export async function getAllCategoriesWithFiles(): Promise<Category[]> {
  const cached = categoriesCache.get("all");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Single query with join - fetch all categories and their files at once
  const { data: files, error } = await supabase
    .from("files")
    .select(
      `
      *,
      categories!inner(key, title)
    `,
    )
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Group by category
  const categoryMap = new Map<string, Category>();
  for (const f of files || []) {
    const cat = f.categories as any;
    const key = cat.key;
    if (!categoryMap.has(key)) {
      categoryMap.set(key, { key, title: cat.title, files: [] });
    }
    const { categories, ...file } = f;
    categoryMap.get(key)!.files.push(file);
  }

  const result = Array.from(categoryMap.values());
  categoriesCache.set("all", { data: result, timestamp: Date.now() });
  return result;
}

export function invalidateCategoriesCache() {
  categoriesCache.clear();
}

export async function createCategory(
  key: string,
  title: string,
): Promise<void> {
  const { error } = await supabase.from("categories").insert({ key, title });
  if (error) throw error;
  invalidateCategoriesCache();
}

export async function categoryExists(key: string): Promise<boolean> {
  const { data } = await supabase
    .from("categories")
    .select("key")
    .eq("key", key)
    .single();
  return !!data;
}

// Files
export async function getFile(fileId: string): Promise<FileItem | null> {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .single();
  if (error || !data) return null;
  return data;
}

export async function createFile(
  file: Omit<FileItem, "downloads"> & { downloads?: number },
): Promise<void> {
  const { error } = await supabase.from("files").insert({
    ...file,
    downloads: file.downloads || 0,
  });
  if (error) throw error;
  invalidateCategoriesCache();
}

export async function fileExists(fileId: string): Promise<boolean> {
  const { data } = await supabase
    .from("files")
    .select("id")
    .eq("id", fileId)
    .single();
  return !!data;
}

export async function incrementDownload(fileId: string): Promise<void> {
  await supabase.rpc("increment_download", { file_id: fileId });
  invalidateCategoriesCache();
}

// Fast download count from cache, falls back to DB
export async function getDownloadCount(fileId: string): Promise<number> {
  const categories = await getAllCategoriesWithFiles();
  for (const cat of categories) {
    const file = cat.files.find((f) => f.id === fileId);
    if (file) return file.downloads || 0;
  }
  // Fallback to DB if not in cache
  const { data } = await supabase
    .from("files")
    .select("downloads")
    .eq("id", fileId)
    .single();
  return data?.downloads || 0;
}

// Users
// Fire-and-forget - don't await in route handlers
export function trackUser(user: {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}): void {
  supabase
    .from("bot_users")
    .upsert(
      {
        chat_id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        is_admin: ADMIN_IDS.includes(user.id),
        last_active: new Date().toISOString(),
      },
      { onConflict: "chat_id" },
    )
    .then(({ error }) => {
      if (error) console.error("trackUser error:", error);
    });
}

export async function getAllUsers(): Promise<BotUser[]> {
  const { data, error } = await supabase
    .from("bot_users")
    .select("*")
    .order("last_active", { ascending: false });
  if (error) throw error;
  return data || [];
}

// Admin Sessions
export async function getAdminState(
  chatId: number,
): Promise<AdminSession["step"] | undefined> {
  const { data } = await supabase
    .from("admin_sessions")
    .select("step, data")
    .eq("chat_id", chatId)
    .single();
  return data?.step;
}

export async function getAdminSessionData(
  chatId: number,
): Promise<Record<string, any>> {
  const { data } = await supabase
    .from("admin_sessions")
    .select("data")
    .eq("chat_id", chatId)
    .single();
  return data?.data || {};
}

export async function setAdminState(
  chatId: number,
  step: AdminSession["step"],
  data: Record<string, any> = {},
): Promise<void> {
  const { error } = await supabase.from("admin_sessions").upsert({
    chat_id: chatId,
    step,
    data,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function clearAdminState(chatId: number): Promise<void> {
  await supabase.from("admin_sessions").delete().eq("chat_id", chatId);
}

export async function updateAdminSessionData(
  chatId: number,
  data: Record<string, any>,
): Promise<void> {
  const { error } = await supabase
    .from("admin_sessions")
    .update({ data, updated_at: new Date().toISOString() })
    .eq("chat_id", chatId);
  if (error) throw error;
}

export function isAdmin(chatId: number): boolean {
  return ADMIN_IDS.includes(chatId);
}

// ==========================================
// 🌱 Seed Initial Data
// ==========================================

const INITIAL_CATEGORIES = [
  {
    key: "contracts",
    title: "📝 قراردادها و قولنامه‌ها",
    files: [
      {
        id: "gholnameh",
        title: "قولنامه دستی خودرو",
        filename: "gholnameh.pdf",
      },
      {
        id: "vekalat",
        title: "وکالت‌نامه تعویض پلاک",
        filename: "vekalat.pdf",
      },
    ],
  },
  {
    key: "forms",
    title: "📋 فرم‌های اداری و مالیاتی",
    files: [
      {
        id: "maliat",
        title: "فرم مالیات نقل و انتقال",
        filename: "maliat.pdf",
      },
      { id: "asnad", title: "فرم درخواست استعلام", filename: "asnad.pdf" },
    ],
  },
  {
    key: "guides",
    title: "📚 راهنمای مراحل قانونی",
    files: [
      {
        id: "guide_pelak",
        title: "مراحل فک پلاک",
        filename: "guide_pelak.pdf",
      },
    ],
  },
];

export async function seedInitialData(): Promise<void> {
  for (const cat of INITIAL_CATEGORIES) {
    const exists = await categoryExists(cat.key);
    if (!exists) {
      await createCategory(cat.key, cat.title);
      for (const file of cat.files) {
        await createFile({ ...file, category_key: cat.key, downloads: 0 });
      }
    }
  }
}

// ==========================================
// 🛠️ توابع ارتباط با تلگرام
// ==========================================

export async function sendMessage(
  chatId: string | number,
  text: string,
  replyMarkup?: any,
) {
  const payload: any = { chat_id: chatId, text: text, parse_mode: "HTML" };
  if (replyMarkup) payload.reply_markup = replyMarkup;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

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
      document: documentUrl,
      caption: caption,
      parse_mode: "HTML",
    }),
  });
}

async function getTelegramFileUrl(fileId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`,
    );
    const data = await response.json();
    if (data.ok && data.result?.file_path) {
      return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
    }
  } catch (error) {
    console.error("Error getting file URL:", error);
  }
  return null;
}

// ==========================================
// 📌 User-facing Functions
// ==========================================

export async function sendWelcomeMessage(chatId: string | number) {
  const categories = await getAllCategoriesWithFiles();

  const text =
    "سلام! به ربات خودروجو خوش آمدید 📄\n\nلطفاً دسته‌بندی مورد نظر خود را انتخاب کنید:";

  const inline_keyboard = categories.map((cat) => [
    { text: cat.title, callback_data: `cat_${cat.key}` },
  ]);

  inline_keyboard.push([
    { text: "🌐 ورود به وب‌سایت", url: "https://khodroju.ir" } as any,
    { text: "🎧 پشتیبانی", callback_data: "contact_support" },
  ]);

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendCategoryMenu(
  chatId: string | number,
  categoryKey: string,
) {
  const category = await getCategory(categoryKey);
  if (!category) return;

  const text = `📂 بخش: ${category.title}\n\nفایل مورد نظر خود را برای دانلود انتخاب کنید:`;
  const inline_keyboard = category.files.map((file) => [
    { text: `📄 ${file.title}`, callback_data: `file_${file.id}` },
  ]);

  inline_keyboard.push([
    { text: "🔙 بازگشت به منوی اصلی", callback_data: "main_menu" },
  ]);

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendSupportInfo(chatId: string | number) {
  const text = `📞 اطلاعات پشتیبانی:\n\n📱 شماره تماس: \n +98 917 944 9399\n👤 یوزرنیم تلگرام: \n @Khodroju_ir\n\nبا ما در تماس باشید.`;

  const inline_keyboard = [
    [{ text: "🔙 بازگشت به منوی اصلی", callback_data: "main_menu" }],
  ];

  await sendMessage(chatId, text, { inline_keyboard });
}

// ==========================================
// 👑 Admin Functions
// ==========================================

export async function sendAdminWelcomeMessage(chatId: string | number) {
  const categories = await getAllCategoriesWithFiles();

  const text =
    "سلام ادمین عزیز! به پنل مدیریت ربات خودروجو خوش آمدید 👑\n\nلطفاً گزینه مورد نظر را انتخاب کنید:";

  const inline_keyboard = categories.map((cat) => [
    { text: cat.title, callback_data: `cat_${cat.key}` },
  ]);

  inline_keyboard.push([
    { text: "⚙️ مدیریت", callback_data: "admin_management" },
  ]);

  inline_keyboard.push([
    { text: "🌐 ورود به وب‌سایت", url: "https://khodroju.ir" } as any,
    { text: "🎧 پشتیبانی", callback_data: "contact_support" },
  ]);

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendAdminManagementMenu(chatId: string | number) {
  const text = "📋 منوی مدیریت:\n\nلطفاً یکی از گزینه‌های زیر را انتخاب کنید:";

  const inline_keyboard = [
    [{ text: "➕ افزودن فایل", callback_data: "admin_add_file" }],
    [{ text: "📁 افزودن دسته‌بندی", callback_data: "admin_add_category" }],
    [{ text: "📊 آمار دانلودها", callback_data: "admin_stats" }],
    [{ text: "👥 لیست کاربران", callback_data: "admin_users" }],
    [{ text: "🔙 بازگشت", callback_data: "admin_back_main" }],
  ];

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendAddFileCategorySelection(chatId: string | number) {
  const categories = await getAllCategoriesWithFiles();

  const text = "📁 لطفاً دسته‌بندی مورد نظر برای افزودن فایل را انتخاب کنید:";

  const inline_keyboard = categories.map((cat) => [
    { text: cat.title, callback_data: `admin_select_cat_${cat.key}` },
  ]);

  inline_keyboard.push([
    { text: "🔙 بازگشت به مدیریت", callback_data: "admin_management" },
  ]);

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendAddFileUploadPrompt(
  chatId: string | number,
  categoryKey: string,
) {
  const category = await getCategory(categoryKey);
  if (!category) return;

  const text = `📤 دسته‌بندی انتخاب شده: ${category.title}\n\nلطفاً فایل مورد نظر خود را ارسال کنید (به عنوان Document).\n\nبرای انصراف، دکمه بازگشت را بزنید.`;

  const inline_keyboard = [
    [{ text: "🔙 بازگشت به انتخاب دسته", callback_data: "admin_add_file" }],
  ];

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendAddCategoryPrompt(chatId: string | number) {
  const text =
    "📝 لطفاً نام دسته‌بندی جدید را ارسال کنید:\n\nمثال: اسناد رسمی\n\nبرای انصراف، دکمه بازگشت را بزنید.";

  const inline_keyboard = [
    [{ text: "🔙 بازگشت به مدیریت", callback_data: "admin_management" }],
  ];

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendStatsView(chatId: string | number) {
  const categories = await getAllCategoriesWithFiles();

  let text = "📊 آمار دانلود فایل‌ها:\n\n";
  let hasData = false;

  for (const category of categories) {
    let categoryText = "";
    for (const file of category.files) {
      const count = await getDownloadCount(file.id);
      if (count > 0) {
        hasData = true;
        categoryText += `  📄 ${file.title}: ${count} دانلود\n`;
      }
    }
    if (categoryText) {
      text += `📂 ${category.title}:\n${categoryText}\n`;
    }
  }

  if (!hasData) {
    text += "هنوز هیچ دانلودی ثبت نشده است.";
  }

  const inline_keyboard = [
    [{ text: "🔙 بازگشت به مدیریت", callback_data: "admin_management" }],
  ];

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendUsersView(chatId: string | number) {
  const users = await getAllUsers();

  let text = `👥 لیست کاربران (${users.length} کاربر):\n\n`;

  if (users.length === 0) {
    text += "هنوز کاربری ثبت نشده است.";
  } else {
    users.slice(0, 50).forEach((user, index) => {
      const name =
        [user.first_name, user.last_name].filter(Boolean).join(" ") || "نامشخص";
      const username = user.username ? `@${user.username}` : "بدون یوزرنیم";
      const adminBadge = user.is_admin ? " 👑" : "";
      text += `${index + 1}. ${name}${adminBadge} (${username}) - ID: ${user.chat_id}\n`;
    });

    if (users.length > 50) {
      text += `\n... و ${users.length - 50} کاربر دیگر`;
    }
  }

  const inline_keyboard = [
    [{ text: "🔙 بازگشت به مدیریت", callback_data: "admin_management" }],
  ];

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function handleAdminFileUpload(
  chatId: number,
  document: { file_id: string; file_name: string; file_size: number },
  categoryKey: string,
) {
  const category = await getCategory(categoryKey);
  if (!category) {
    await sendMessage(chatId, "❌ دسته‌بندی یافت نشد.");
    return;
  }

  const fileId = document.file_name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");

  if (await fileExists(fileId)) {
    await sendMessage(
      chatId,
      "❌ فایلی با این نام از قبل وجود دارد. لطفاً فایل را با نام دیگر آپلود کنید.",
    );
    return;
  }

  await createFile({
    id: fileId,
    title: document.file_name.replace(/\.[^/.]+$/, ""),
    filename: document.file_name,
    category_key: categoryKey,
    telegram_file_id: document.file_id,
    downloads: 0,
  });

  const fileUrl = await getTelegramFileUrl(document.file_id);
  if (fileUrl) {
    await sendMessage(
      chatId,
      `✅ فایل "${document.file_name.replace(/\.[^/.]+$/, "")}" با موفقیت به دسته "${category.title}" اضافه شد!\n\n📎 شناسه فایل: ${fileId}\n📥 لینک مستقیم: ${fileUrl}`,
    );
  } else {
    await sendMessage(
      chatId,
      `✅ فایل "${document.file_name.replace(/\.[^/.]+$/, "")}" به دسته "${category.title}" اضافه شد (لینک مستقیم در دسترس نیست).`,
    );
  }

  await clearAdminState(chatId);
  await sendAdminManagementMenu(chatId);
}

export async function handleAddCategory(chatId: number, categoryName: string) {
  const categoryKey = categoryName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .substring(0, 30);

  if (await categoryExists(categoryKey)) {
    await sendMessage(chatId, "❌ دسته‌بندی با این نام از قبل وجود دارد.");
    return;
  }

  await createCategory(categoryKey, categoryName);
  await sendMessage(
    chatId,
    `✅ دسته‌بندی "${categoryName}" با موفقیت ایجاد شد!`,
  );
  await clearAdminState(chatId);
  await sendAdminManagementMenu(chatId);
}

export async function handleAdminCallback(chatId: number, buttonData: string) {
  const step = await getAdminState(chatId);

  if (buttonData === "admin_management") {
    await clearAdminState(chatId);
    await sendAdminManagementMenu(chatId);
  } else if (buttonData === "admin_add_file") {
    await setAdminState(chatId, "add_file_category");
    await sendAddFileCategorySelection(chatId);
  } else if (buttonData === "admin_add_category") {
    await setAdminState(chatId, "add_category_name");
    await sendAddCategoryPrompt(chatId);
  } else if (buttonData === "admin_stats") {
    await setAdminState(chatId, "stats");
    await sendStatsView(chatId);
  } else if (buttonData === "admin_users") {
    await setAdminState(chatId, "users");
    await sendUsersView(chatId);
  } else if (buttonData === "admin_back_main") {
    await clearAdminState(chatId);
    await sendAdminWelcomeMessage(chatId);
  } else if (buttonData.startsWith("admin_select_cat_")) {
    const categoryKey = buttonData.replace("admin_select_cat_", "");
    await setAdminState(chatId, "add_file_upload", {
      selectedCategory: categoryKey,
    });
    await sendAddFileUploadPrompt(chatId, categoryKey);
  }
}
