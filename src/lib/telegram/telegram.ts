// lib/telegram.ts

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_IDS = (
  process.env.TELEGRAM_ADMIN_IDS ||
  process.env.TELEGRAM_ADMIN_ID ||
  ""
)
  .split(",")
  .map((id) => parseInt(id.trim()))
  .filter((id) => !isNaN(id));

// Lazy-initialized Supabase client (avoids build-time errors)
let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

// ==========================================
// 🤖 Bot Commands (for Telegram suggestions menu)
// ==========================================
export async function setBotCommands(): Promise<void> {
  const commands = [
    { command: "start", description: "🏠 منوی اصلی" },
    { command: "categories", description: "📂 دسته‌بندی‌ها" },
    { command: "support", description: "🎧 پشتیبانی" },
  ];

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commands }),
    });
  } catch (error) {
    console.error("Failed to set bot commands:", error);
  }
}

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
  description?: string;
}

export interface Category {
  key: string;
  title: string;
  parent_key?: string | null;
  files: FileItem[];
  subcategories?: Category[];
}

export interface BotUser {
  chat_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  is_admin: boolean;
  last_active: string;
}

interface AdminSession {
  chat_id: number;
  step: 'main' 
    | 'add_file_category' 
    | 'add_file_description' 
    | 'add_file_upload' 
    | 'add_category_name' 
    | 'add_subcategory_parent' 
    | 'add_subcategory_name'
    | 'stats' 
    | 'users'
    | 'waiting_for_phone'
    | 'edit_category_name'
    | 'edit_file_description';
  data: Record<string, any>;
  updated_at: string;
}

// ==========================================
// 🔧 Database Helpers
// ==========================================

// In-memory cache (survives within same serverless invocation)
const categoriesCache = new Map<string, { data: Category[]; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds

// Categories
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await getSupabase()
    .from("categories")
    .select("key, title, parent_key")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map((c) => ({ ...c, files: [], subcategories: [] }));
}

export async function getCategory(key: string): Promise<Category | null> {
  // First check the full cache which includes subcategories
  const cachedAll = categoriesCache.get("all");
  if (cachedAll && Date.now() - cachedAll.timestamp < CACHE_TTL) {
    const findInTree = (cats: Category[]): Category | null => {
      for (const c of cats) {
        if (c.key === key) return c;
        if (c.subcategories) {
          const found = findInTree(c.subcategories);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(cachedAll.data);
  }

  // Fallback: fetch from DB with subcategories
  const allCats = await getAllCategoriesWithFiles();
  const findInTree = (cats: Category[]): Category | null => {
    for (const c of cats) {
      if (c.key === key) return c;
      if (c.subcategories) {
        const found = findInTree(c.subcategories);
        if (found) return found;
      }
    }
    return null;
  };
  return findInTree(allCats);
}

export async function getSubcategories(parentKey: string): Promise<Category[]> {
  const { data, error } = await getSupabase()
    .from("categories")
    .select("key, title, parent_key")
    .eq("parent_key", parentKey)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map((c) => ({ ...c, files: [], subcategories: [] }));
}

export async function getAllCategoriesWithFiles(): Promise<Category[]> {
  const cached = categoriesCache.get("all");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Get all categories with parent_key
  const { data: categories, error: catError } = await getSupabase()
    .from("categories")
    .select("key, title, parent_key")
    .order("created_at", { ascending: true });

  if (catError) throw catError;

  // Get all files
  const { data: files, error: filesError } = await getSupabase()
    .from("files")
    .select("*")
    .order("created_at", { ascending: true });

  if (filesError) throw filesError;

  // Build category map
  const categoryMap = new Map<string, Category>();
  for (const c of categories || []) {
    categoryMap.set(c.key, { 
      key: c.key, 
      title: c.title, 
      parent_key: c.parent_key, 
      files: [], 
      subcategories: [] 
    });
  }

  // Group files by category
  for (const f of files || []) {
    const cat = categoryMap.get(f.category_key);
    if (cat) {
      cat.files.push(f);
    }
  }

  // Build hierarchy - attach subcategories to parents
  const rootCategories: Category[] = [];
  for (const cat of categoryMap.values()) {
    if (cat.parent_key) {
      const parent = categoryMap.get(cat.parent_key);
      if (parent) {
        parent.subcategories!.push(cat);
      } else {
        // Orphaned subcategory, treat as root
        rootCategories.push(cat);
      }
    } else {
      rootCategories.push(cat);
    }
  }

  categoriesCache.set("all", { data: rootCategories, timestamp: Date.now() });
  return rootCategories;
}

export function invalidateCategoriesCache() {
  categoriesCache.clear();
}

export async function createCategory(
  key: string,
  title: string,
  parentKey?: string | null,
): Promise<void> {
  const { error } = await getSupabase().from("categories").insert({ key, title, parent_key: parentKey || null });
  if (error) throw error;
  invalidateCategoriesCache();
}

export async function categoryExists(key: string): Promise<boolean> {
  const { data } = await getSupabase()
    .from("categories")
    .select("key")
    .eq("key", key)
    .single();
  return !!data;
}

// Files
export async function getFile(fileId: string): Promise<FileItem | null> {
  const { data, error } = await getSupabase()
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
  const { error } = await getSupabase().from("files").insert({
    ...file,
    downloads: file.downloads || 0,
  });
  if (error) throw error;
  invalidateCategoriesCache();
}

export async function fileExists(fileId: string): Promise<boolean> {
  const { data } = await getSupabase()
    .from("files")
    .select("id")
    .eq("id", fileId)
    .single();
  return !!data;
}

export async function incrementDownload(fileId: string, userId?: number): Promise<void> {
  // Try RPC first, fall back to read-then-write (avoids dependency on custom function)
  try {
    const { error } = await getSupabase().rpc("increment_download", { file_id: fileId });
    if (error) throw error;
  } catch (err) {
    console.log("RPC increment failed, using fallback:", err);
    const { data: current } = await getSupabase()
      .from("files")
      .select("downloads")
      .eq("id", fileId)
      .single();
    await getSupabase()
      .from("files")
      .update({ downloads: (current?.downloads || 0) + 1 })
      .eq("id", fileId);
  }

  // Log download for detailed analytics (warns if table missing)
  if (userId) {
    const { error: logError } = await getSupabase()
      .from("downloads")
      .insert({ file_id: fileId, user_id: userId });
    if (logError) console.log("downloads log skipped:", logError.message);
  }

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
  const { data } = await getSupabase()
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
  getSupabase()
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
  const { data, error } = await getSupabase()
    .from("bot_users")
    .select("*")
    .order("last_active", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getUser(chatId: number): Promise<BotUser | null> {
  const { data, error } = await getSupabase()
    .from("bot_users")
    .select("*")
    .eq("chat_id", chatId)
    .single();
  if (error || !data) return null;
  return data;
}

export async function hasPhoneNumber(chatId: number): Promise<boolean> {
  const user = await getUser(chatId);
  return !!user?.phone_number;
}

export async function updateUserPhone(chatId: number, phoneNumber: string): Promise<void> {
  const { error } = await getSupabase()
    .from("bot_users")
    .upsert(
      { chat_id: chatId, phone_number: phoneNumber },
      { onConflict: "chat_id" }
    );
  if (error) throw error;
}

// Phone number request flow (text input)
export async function sendPhoneRequest(chatId: string | number) {
  const text = `📱 برای استفاده از ربات، لطفاً شماره تلفن خود را وارد کنید:\n\nمثال: 09123456789`;

  await sendMessage(chatId, text);
}

// Admin Sessions
export async function getAdminState(
  chatId: number,
): Promise<AdminSession["step"] | undefined> {
  const { data } = await getSupabase()
    .from("admin_sessions")
    .select("step, data")
    .eq("chat_id", chatId)
    .single();
  return data?.step;
}

export async function getAdminSessionData(chatId: number): Promise<Record<string, any>> {
  const { data } = await getSupabase()
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
  const { error } = await getSupabase().from("admin_sessions").upsert({
    chat_id: chatId,
    step,
    data,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function clearAdminState(chatId: number): Promise<void> {
  await getSupabase().from("admin_sessions").delete().eq("chat_id", chatId);
}

export async function updateAdminSessionData(
  chatId: number,
  data: Record<string, any>,
): Promise<void> {
  const { error } = await getSupabase()
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

export async function seedInitialData(): Promise<void> {
  // No hardcoded categories - admin creates them
  return;
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

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result.ok) {
      console.error("sendMessage failed:", result);
    }
    return result;
  } catch (error) {
    console.error("sendMessage error:", error);
    throw error;
  }
}

export async function sendDocument(
  chatId: string | number,
  documentUrl: string,
  caption: string,
) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        document: documentUrl,
        caption: caption,
        parse_mode: "HTML",
      }),
    });
    const result = await response.json();
    if (!result.ok) {
      console.error("sendDocument failed:", result);
    }
    return result;
  } catch (error) {
    console.error("sendDocument error:", error);
    throw error;
  }
}

export async function getTelegramFileUrl(fileId: string): Promise<string | null> {
  try {
    console.log("getTelegramFileUrl called with:", fileId);
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`,
    );
    const data = await response.json();
    console.log("getFile API response:", data);
    if (data.ok && data.result?.file_path) {
      const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
      console.log("File URL constructed:", url);
      return url;
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

  const text = "سلام! به ربات خودروجو خوش آمدید 📄\n\nلطفاً دسته‌بندی مورد نظر خود را انتخاب کنید:";

  const inline_keyboard = categories.map((cat) => [
    { text: cat.title, callback_data: `cat_${cat.key}` },
  ]);

  inline_keyboard.push([
    { text: "🌐 ورود به وب‌سایت", url: "https://khodroju.ir" } as any,
    { text: "🎧 پشتیبانی", callback_data: "contact_support" },
  ]);

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendCategoryMenu(chatId: string | number, categoryKey: string) {
  const category = await getCategory(categoryKey);
  if (!category) return;

  const subcategories = category.subcategories || [];
  const files = category.files || [];

  let text = `📂 بخش: ${category.title}\n\n`;
  const inline_keyboard = [];

  if (subcategories.length > 0) {
    text += `📂 زیرمجموعه‌ها:\n`;
    for (const sub of subcategories) {
      inline_keyboard.push([
        { text: `📁 ${sub.title}`, callback_data: `cat_${sub.key}` },
      ]);
    }
    text += `\n`;
  }

  if (files.length > 0) {
    text += `📄 فایل‌ها:\n`;
    for (const file of files) {
      inline_keyboard.push([
        { text: `📄 ${file.title}`, callback_data: `file_${file.id}` },
      ]);
    }
  }

  if (subcategories.length === 0 && files.length === 0) {
    text += `این دسته خالی است.`;
  }

  inline_keyboard.push([
    { text: "🔙 بازگشت به منوی اصلی", callback_data: "main_menu" },
  ]);

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendSupportInfo(chatId: string | number) {
  const text = `📞 اطلاعات پشتیبانی:\n\n📱 شماره تماس: +98 917 944 9399\n👤 یوزرنیم تلگرام: @Khodroju_ir\n\nبا ما در تماس باشید.`;

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

  inline_keyboard.push([{ text: "⚙️ مدیریت", callback_data: "a_mgmt" }]);

  inline_keyboard.push([
    { text: "🌐 ورود به وب‌سایت", url: "https://khodroju.ir" } as any,
    { text: "🎧 پشتیبانی", callback_data: "contact_support" },
  ]);

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendAdminManagementMenu(chatId: string | number) {
  const text = "📋 منوی مدیریت:\n\nلطفاً یکی از گزینه‌های زیر را انتخاب کنید:";

  const inline_keyboard = [
    [{ text: "➕ افزودن فایل", callback_data: "a_add_file" }],
    [{ text: "🗂️ مدیریت فایل‌ها (حذف)", callback_data: "a_manage_files" }],
    [{ text: "✏️ ویرایش توضیحات فایل", callback_data: "a_edit_file_desc" }],
    [{ text: "📁 افزودن دسته‌بندی", callback_data: "a_add_cat" }],
    [{ text: "📂 افزودن زیرمجموعه", callback_data: "a_add_sub" }],
    [{ text: "🗑️ حذف دسته/زیرمجموعه", callback_data: "a_del_cat" }],
    [{ text: "✏️ ویرایش دسته/زیرمجموعه", callback_data: "a_edit_cat" }],
    [{ text: "📊 آمار دانلودها", callback_data: "a_stats" }],
    [{ text: "👥 لیست کاربران", callback_data: "a_users" }],
    [{ text: "🔙 بازگشت", callback_data: "a_back" }],
  ];

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendDeleteCategorySelection(chatId: string | number, parentKey?: string) {
  let categories: Category[];
  let text: string;
  let backCallback: string;

  if (parentKey) {
    // Show subcategories of a specific category
    const parent = await getCategory(parentKey);
    if (!parent) return;
    categories = parent.subcategories || [];
    text = `🗑️ حذف زیرمجموعه در: ${parent.title}\n\nانتخاب کنید:`;
    backCallback = `dc_${parentKey}`;
  } else {
    // Show root categories
    categories = await getAllCategoriesWithFiles();
    text = "🗑️ حذف دسته‌بندی:\n\nانتخاب کنید:";
    backCallback = "a_back";
  }

  const inline_keyboard = [];

  if (!parentKey) {
    // At root level, show categories with "manage" button
    for (const cat of categories) {
      inline_keyboard.push([
        { text: `📂 ${cat.title}`, callback_data: `dc_view_${cat.key}` },
      ]);
    }
  } else {
    // At subcategory level, show "delete this category" + subcategories
    const parent = await getCategory(parentKey);
    if (parent) {
      inline_keyboard.push([
        { text: `🗑️ حذف "${parent.title}" و تمام زیرمجموعه‌ها`, callback_data: `dd_${parentKey}` },
      ]);
    }
    for (const sub of categories) {
      inline_keyboard.push([
        { text: `  ➤ ${sub.title}`, callback_data: `dc_view_${sub.key}` },
      ]);
    }
  }

  if (inline_keyboard.length === 0) {
    inline_keyboard.push([{ text: "هیچ زیرمجموعه‌ای وجود ندارد", callback_data: "noop" }]);
  }

  inline_keyboard.push([{ text: "🔙 بازگشت", callback_data: backCallback }]);

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendConfirmDeleteCategory(chatId: string | number, categoryKey: string) {
  const category = await getCategory(categoryKey);
  if (!category) return;

  const subcategories = category.subcategories || [];
  const files = category.files || [];
  const subCount = subcategories.length;
  const fileCount = files.length;

  let warningText = `⚠️ آیا از حذف "${category.title}" مطمئن هستید؟\n\n`;

  if (fileCount > 0) {
    warningText += `📄 فایل‌ها (${fileCount}):\n`;
    for (const f of files) {
      warningText += `  • ${f.title}\n`;
    }
    warningText += `\n`;
  }

  if (subCount > 0) {
    warningText += `📂 زیرمجموعه‌ها (${subCount}):\n`;
    for (const sub of subcategories) {
      const subFileCount = sub.files?.length || 0;
      const subSubCount = sub.subcategories?.length || 0;
      warningText += `  ➤ ${sub.title}`;
      if (subFileCount > 0 || subSubCount > 0) {
        warningText += ` (${subFileCount} فایل`;
        if (subSubCount > 0) warningText += `, ${subSubCount} زیرمجموعه`;
        warningText += `)`;
      }
      warningText += `\n`;
    }
    warningText += `\n`;
  }

  if (fileCount === 0 && subCount === 0) {
    warningText += `این دسته خالی است.\n\n`;
  }

  warningText += `❗ تمام موارد بالا حذف خواهند شد. این کار غیرقابل بازگشت است.`;

  const inline_keyboard = [
    [{ text: "✅ بله، حذف شود", callback_data: `dd_${categoryKey}` }],
    [{ text: "🔙 انصراف", callback_data: "a_del_cat" }],
  ];

  await sendMessage(chatId, warningText, { inline_keyboard });
}

export async function sendEditCategorySelection(chatId: string | number, parentKey?: string) {
  let categories: Category[];
  let text: string;
  let backCallback: string;

  if (parentKey) {
    // Show subcategories of a specific category
    const parent = await getCategory(parentKey);
    if (!parent) return;
    categories = parent.subcategories || [];
    text = `✏️ ویرایش زیرمجموعه در: ${parent.title}\n\nانتخاب کنید:`;
    backCallback = `ec_view_${parentKey}`;
  } else {
    // Show root categories
    categories = await getAllCategoriesWithFiles();
    text = "✏️ ویرایش دسته‌بندی:\n\nانتخاب کنید:";
    backCallback = "a_back";
  }

  const inline_keyboard = [];

  if (!parentKey) {
    // At root level, show categories with "manage" button
    for (const cat of categories) {
      inline_keyboard.push([
        { text: `📂 ${cat.title}`, callback_data: `ec_view_${cat.key}` },
      ]);
    }
  } else {
    // At subcategory level, show "edit this category" + subcategories
    const parent = await getCategory(parentKey);
    if (parent) {
      inline_keyboard.push([
        { text: `✏️ ویرایش "${parent.title}"`, callback_data: `ec_edit_${parentKey}` },
      ]);
    }
    for (const sub of categories) {
      inline_keyboard.push([
        { text: `  ➤ ${sub.title}`, callback_data: `ec_view_${sub.key}` },
      ]);
    }
  }

  if (inline_keyboard.length === 0) {
    inline_keyboard.push([{ text: "هیچ زیرمجموعه‌ای وجود ندارد", callback_data: "noop" }]);
  }

  inline_keyboard.push([{ text: "🔙 بازگشت", callback_data: backCallback }]);

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendEditCategoryPrompt(chatId: string | number, categoryKey: string) {
  const category = await getCategory(categoryKey);
  if (!category) return;

  const isSub = !!category.parent_key;
  const typeText = isSub ? "زیرمجموعه" : "دسته‌بندی";

  const text = `✏️ ویرایش ${typeText}: ${category.title}\n\n📝 نام جدید را وارد کنید:\n\nبرای انصراف، دکمه بازگشت را بزنید.`;

  const inline_keyboard = [[{ text: "🔙 بازگشت", callback_data: "a_edit_cat" }]];

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function handleEditCategory(chatId: number, categoryKey: string, newName: string) {
  console.log("handleEditCategory called:", { chatId, categoryKey, newName });
  const category = await getCategory(categoryKey);
  if (!category) {
    await sendMessage(chatId, "❌ دسته‌بندی یافت نشد.");
    return;
  }

  const newKey = newName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .substring(0, 30);

  if (newKey !== categoryKey && await categoryExists(newKey)) {
    await sendMessage(chatId, "❌ دسته‌بندی با این نام از قبل وجود دارد.");
    return;
  }

  try {
    // If key is changing, we need to handle foreign keys carefully
    if (newKey !== categoryKey) {
      // First update files to reference new key
      const { error: filesError } = await getSupabase()
        .from("files")
        .update({ category_key: newKey })
        .eq("category_key", categoryKey);
      
      if (filesError) {
        console.error("Error updating files:", filesError);
        await sendMessage(chatId, `❌ خطا در به‌روزرسانی فایل‌ها: ${filesError.message}`);
        return;
      }

      // Then update subcategories' parent_key
      const { error: subError } = await getSupabase()
        .from("categories")
        .update({ parent_key: newKey })
        .eq("parent_key", categoryKey);
      
      if (subError) {
        console.error("Error updating subcategories:", subError);
        await sendMessage(chatId, `❌ خطا در به‌روزرسانی زیرمجموعه‌ها: ${subError.message}`);
        return;
      }

      // Finally update the category itself (key and title)
      const { error: catError } = await getSupabase()
        .from("categories")
        .update({ key: newKey, title: newName })
        .eq("key", categoryKey);
      
      if (catError) {
        console.error("Error updating category:", catError);
        await sendMessage(chatId, `❌ خطا در ویرایش دسته‌بندی: ${catError.message}`);
        return;
      }
    } else {
      // Only title changed
      const { error: catError } = await getSupabase()
        .from("categories")
        .update({ title: newName })
        .eq("key", categoryKey);
      
      if (catError) {
        console.error("Error updating category title:", catError);
        await sendMessage(chatId, `❌ خطا در ویرایش عنوان: ${catError.message}`);
        return;
      }
    }

    invalidateCategoriesCache();
    await sendMessage(chatId, `✅ ${category.parent_key ? "زیرمجموعه" : "دسته‌بندی"} "${newName}" با موفقیت ویرایش شد!`);
    await clearAdminState(chatId);
    await sendEditCategorySelection(chatId);
  } catch (err) {
    console.error("Unexpected error in handleEditCategory:", err);
    await sendMessage(chatId, `❌ خطای غیرمنتظره: ${err instanceof Error ? err.message : "نامشخص"}`);
  }
}

export async function handleDeleteCategory(chatId: number, categoryKey: string) {
  console.log("handleDeleteCategory called:", { chatId, categoryKey });
  const category = await getCategory(categoryKey);
  if (!category) {
    await sendMessage(chatId, "❌ دسته‌بندی یافت نشد.");
    return;
  }

  // Delete all subcategories recursively
  if (category.subcategories && category.subcategories.length > 0) {
    for (const sub of category.subcategories) {
      await handleDeleteCategory(chatId, sub.key);
    }
  }

  // Delete all files in this category
  const { error: filesError } = await getSupabase().from("files").delete().eq("category_key", categoryKey);
  if (filesError) {
    await sendMessage(chatId, "❌ خطا در حذف فایل‌ها.");
    return;
  }

  // Delete the category
  const { error: catError } = await getSupabase().from("categories").delete().eq("key", categoryKey);
  if (catError) {
    await sendMessage(chatId, "❌ خطا در حذف دسته‌بندی.");
    return;
  }

  invalidateCategoriesCache();
  await sendMessage(chatId, `✅ دسته‌بندی "${category.title}" و تمام محتوای آن حذف شد.`);
  await sendDeleteCategorySelection(chatId);
}

export async function sendAddSubcategoryParentSelection(chatId: string | number) {
  const categories = await getAllCategoriesWithFiles();

  const text = "📂 لطفاً دسته‌بندی والد را برای افزودن زیرمجموعه انتخاب کنید:";

  const inline_keyboard = categories.map((cat) => [
    { text: cat.title, callback_data: `a_select_parent_cat_${cat.key}` },
  ]);

  inline_keyboard.push([{ text: "🔙 بازگشت به مدیریت", callback_data: "a_back" }]);

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendAddSubcategoryNamePrompt(chatId: string | number, parentKey: string) {
  const parent = await getCategory(parentKey);
  if (!parent) return;

  const text = `📂 دسته‌بندی والد: ${parent.title}\n\n📝 لطفاً نام زیرمجموعه جدید را وارد کنید:\n\nبرای انصراف، دکمه بازگشت را بزنید.`;

  const inline_keyboard = [[{ text: "🔙 بازگشت به انتخاب والد", callback_data: "a_add_sub" }]];

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function handleAddSubcategory(chatId: number, parentKey: string, subcategoryName: string) {
  // Generate unique key for subcategory
  const baseName = subcategoryName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .substring(0, 15);
  
  const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  const subcategoryKey = `${parentKey}_${baseName || "sub"}_${uniqueSuffix}`;

  if (await categoryExists(subcategoryKey)) {
    await sendMessage(chatId, "❌ زیرمجموعه با این نام از قبل وجود دارد.");
    return;
  }

  await createCategory(subcategoryKey, subcategoryName, parentKey);
  await sendMessage(chatId, `✅ زیرمجموعه "${subcategoryName}" در دسته "${(await getCategory(parentKey))?.title}" ایجاد شد!`);
  await clearAdminState(chatId);
  await sendAdminManagementMenu(chatId);
}

export async function sendManageFilesView(chatId: string | number) {
  const categories = await getAllCategoriesWithFiles();

  const inline_keyboard = [];

  for (const cat of categories) {
    if (cat.files.length === 0) continue;
    inline_keyboard.push([{ text: `📂 ${cat.title}`, callback_data: `a_files_cat_${cat.key}` }]);
  }

  if (inline_keyboard.length === 0) {
    inline_keyboard.push([{ text: "هیچ فایلی وجود ندارد", callback_data: "noop" }]);
  }

  inline_keyboard.push([{ text: "🔙 بازگشت به مدیریت", callback_data: "a_back" }]);

  await sendMessage(chatId, "🗂️ مدیریت فایل‌ها:\nانتخاب دسته‌بندی برای مشاهده و حذف فایل‌ها:", { inline_keyboard });
}

export async function sendFilesInCategoryForDeletion(chatId: string | number, categoryKey: string) {
  const category = await getCategory(categoryKey);
  if (!category) return;

  const inline_keyboard = [];

  for (const file of category.files) {
    inline_keyboard.push([
      { text: `🗑️ ${file.title}`, callback_data: `a_delete_file_${file.id}` },
    ]);
  }

  inline_keyboard.push([{ text: "🔙 بازگشت به لیست دسته‌ها", callback_data: "a_manage_files" }]);

  await sendMessage(chatId, `📂 ${category.title}\n\nروی فایل برای حذف کلیک کنید:`, { inline_keyboard });
}

export async function handleDeleteFile(chatId: number, fileId: string) {
  const file = await getFile(fileId);
  if (!file) {
    await sendMessage(chatId, "❌ فایل یافت نشد.");
    return;
  }

  const { error } = await getSupabase().from("files").delete().eq("id", fileId);
  if (error) {
    await sendMessage(chatId, "❌ خطا در حذف فایل.");
    return;
  }

  invalidateCategoriesCache();
  await sendMessage(chatId, `✅ فایل "${file.title}" حذف شد.`);
  await sendManageFilesView(chatId);
}

// ==========================================
// 📝 Edit File Description
// ==========================================

export async function sendEditFileDescCategorySelection(chatId: string | number) {
  const categories = await getAllCategoriesWithFiles();

  const text = "📝 ویرایش توضیحات فایل:\n\nلطفاً دسته‌بندی مورد نظر را انتخاب کنید:";

  const inline_keyboard = categories.map((cat) => [
    { text: cat.title, callback_data: `efd_cat_${cat.key}` },
  ]);

  inline_keyboard.push([{ text: "🔙 بازگشت به مدیریت", callback_data: "a_back" }]);

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendEditFileDescFileSelection(chatId: string | number, categoryKey: string) {
  const category = await getCategory(categoryKey);
  if (!category) return;

  const text = `📂 ${category.title}\n\nفایل مورد نظر برای ویرایش توضیحات را انتخاب کنید:`;

  const inline_keyboard = category.files.map((file) => [
    { text: `✏️ ${file.title}`, callback_data: `efd_file_${file.id}` },
  ]);

  inline_keyboard.push([{ text: "🔙 بازگشت به دسته‌ها", callback_data: "a_edit_file_desc" }]);

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendEditFileDescPrompt(chatId: string | number, fileId: string) {
  const file = await getFile(fileId);
  if (!file) return;

  const currentDesc = file.description ? `\n\nتوضیحات فعلی:\n${file.description}` : "";
  const text = `✏️ ویرایش توضیحات فایل: ${file.title}${currentDesc}\n\n📝 توضیحات جدید را وارد کنید (برای حذف توضیحات، "حذف" بنویسید):`;

  const inline_keyboard = [[{ text: "🔙 بازگشت به فایل‌ها", callback_data: `efd_cat_${file.category_key}` }]];

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function handleEditFileDescription(chatId: number, fileId: string, newDescription: string) {
  const file = await getFile(fileId);
  if (!file) {
    await sendMessage(chatId, "❌ فایل یافت نشد.");
    return;
  }

  const description = newDescription === "حذف" ? "" : newDescription;

  const { error } = await getSupabase()
    .from("files")
    .update({ description })
    .eq("id", fileId);

  if (error) {
    await sendMessage(chatId, `❌ خطا در به‌روزرسانی: ${error.message}`);
    return;
  }

  invalidateCategoriesCache();
  await sendMessage(chatId, `✅ توضیحات فایل "${file.title}" با موفقیت ${description ? "به‌روزرسانی" : "حذف"} شد!`);
  await clearAdminState(chatId);
  await sendEditFileDescCategorySelection(chatId);
}

export async function sendAddFileCategorySelection(chatId: string | number) {
  const categories = await getAllCategoriesWithFiles();

  const text = "📁 لطفاً دسته‌بندی مورد نظر برای افزودن فایل را انتخاب کنید:";

  const inline_keyboard = categories.map((cat) => [
    { text: cat.title, callback_data: `sc_${cat.key}` },
  ]);

  inline_keyboard.push([{ text: "🔙 بازگشت به مدیریت", callback_data: "a_back" }]);

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendFileSaveLocationPrompt(chatId: string | number, parentKey: string, subcategories: Category[]) {
  const parent = await getCategory(parentKey);
  if (!parent) return;

  const text = `📂 دسته‌بندی: ${parent.title}\n\nاین دسته زیرمجموعه دارد. فایل را کجا ذخیره کنیم؟`;

  const inline_keyboard = [
    [{ text: `📁 در همین دسته (${parent.title})`, callback_data: `sf_c_${parentKey}` }],
    ...subcategories.map((sub) => [
      { text: `📂 در زیرمجموعه: ${sub.title}`, callback_data: `sf_s_${sub.key}` }],
    ),
    [{ text: "🔙 بازگشت به انتخاب دسته", callback_data: "a_add_file" }],
  ];

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendAddFileDescriptionPrompt(chatId: string | number, categoryKey: string) {
  const category = await getCategory(categoryKey);
  if (!category) return;

  const text = `📤 دسته‌بندی: ${category.title}\n\n📄 لطفاً توضیحات فایل را وارد کنید (اختیاری):\n\nبرای رد کردن توضیحات، دکمه "⏭️ بدون توضیحات" را بزنید.`;

  const inline_keyboard = [
    [{ text: "⏭️ بدون توضیحات", callback_data: `a_skip_desc_${categoryKey}` }],
    [{ text: "🔙 بازگشت به انتخاب دسته", callback_data: "a_add_file" }],
  ];

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendAddFileUploadPrompt(chatId: string | number, categoryKey: string, description: string) {
  const category = await getCategory(categoryKey);
  if (!category) return;

  const descText = description ? `\n📄 توضیحات: ${description}` : "";
  const text = `📤 دسته‌بندی: ${category.title}${descText}\n\n📎 لطفاً فایل را ارسال کنید (به عنوان Document).\n\nبرای انصراف، دکمه بازگشت را بزنید.`;

  const inline_keyboard = [[{ text: "🔙 بازگشت به توضیحات", callback_data: `a_enter_desc_${categoryKey}` }]];

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendAddCategoryPrompt(chatId: string | number) {
  const text = "📝 لطفاً نام دسته‌بندی جدید را ارسال کنید:\n\nمثال: اسناد رسمی\n\nبرای انصراف، دکمه بازگشت را بزنید.";

  const inline_keyboard = [[{ text: "🔙 بازگشت به مدیریت", callback_data: "a_back" }]];

  await sendMessage(chatId, text, { inline_keyboard });
}

export async function sendStatsView(chatId: string | number) {
  try {
    const categories = await getAllCategoriesWithFiles();

    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    let text = "📊 آمار دانلود فایل‌ها:\n";
    let grandTotal = 0;
    let fileCount = 0;

    // Recursive walker that includes subcategories
    const walk = (cats: Category[], prefix = "") => {
      for (const category of cats) {
        const files = category.files || [];
        if (files.length > 0) {
          let catTotal = 0;
          let catText = "";
          for (const file of files) {
            const count = file.downloads || 0;
            catTotal += count;
            fileCount++;
            catText += `${prefix}  📄 ${esc(file.title)}: ${count} دانلود\n`;
          }
          text += `\n${prefix}📂 ${esc(category.title)} (${catTotal} دانلود):\n${catText}`;
          grandTotal += catTotal;
        }
        if (category.subcategories && category.subcategories.length > 0) {
          walk(category.subcategories, `${prefix}  `);
        }
      }
    };

    walk(categories);

    if (fileCount === 0) {
      text += `\n\nهنوز هیچ فایلی ثبت نشده است.`;
    } else {
      text += `\n─────────────────────\n📈 مجموع کل: ${grandTotal} دانلود از ${fileCount} فایل`;
    }

    const inline_keyboard = [[{ text: "🔙 بازگشت به مدیریت", callback_data: "a_back" }]];

    await sendMessage(chatId, text, { inline_keyboard });
  } catch (err) {
    console.error("sendStatsView error:", err);
    await sendMessage(chatId, `❌ خطا در دریافت آمار: ${err instanceof Error ? err.message : "نامشخص"}`);
  }
}

export async function sendUsersView(chatId: string | number) {
  try {
    console.log("sendUsersView called for:", chatId);
    const users = await getAllUsers();
    console.log("sendUsersView users count:", users.length);

    // Fetch download logs (silent fallback if table doesn't exist yet)
    let downloadLogs: { file_id: string; user_id: number }[] = [];
    const { data: logs, error: logsError } = await getSupabase()
      .from("downloads")
      .select("file_id, user_id")
      .order("created_at", { ascending: false });
    if (logsError) {
      console.log("downloads table not available:", logsError.message);
    } else {
      downloadLogs = logs || [];
    }

    // Build file id -> title map (includes subcategories)
    const categories = await getAllCategoriesWithFiles();
    const fileMap = new Map<string, string>();
    const walk = (cats: Category[]) => {
      for (const c of cats) {
        for (const f of c.files) fileMap.set(f.id, f.title);
        if (c.subcategories) walk(c.subcategories);
      }
    };
    walk(categories);

    // Group downloads per user
    const userDownloads = new Map<number, { title: string; count: number }[]>();
    for (const log of downloadLogs) {
      if (!userDownloads.has(log.user_id)) userDownloads.set(log.user_id, []);
      const list = userDownloads.get(log.user_id)!;
      const title = fileMap.get(log.file_id) || log.file_id;
      const existing = list.find((x) => x.title === title);
      if (existing) existing.count++;
      else list.push({ title, count: 1 });
    }

    // Escape HTML entities (parse_mode is HTML)
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    let text = `👥 لیست کاربران (${users.length} کاربر):`;

    if (users.length === 0) {
      text += `\n\nهنوز کاربری ثبت نشده است.`;
    } else {
      let shown = 0;
      for (const user of users) {
        if (shown >= 25) break;

        const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || "نامشخص";
        const username = user.username ? `@${user.username}` : "—";
        const phone = user.phone_number || "ثبت نشده";
        const adminBadge = user.is_admin ? " 👑" : "";

        let block = `\n\n${shown + 1}. ${esc(name)}${adminBadge}`;
        block += `\n   📱 ${esc(phone)}`;
        block += `\n   👤 ${esc(username)} | 🆔 ${user.chat_id}`;

        const downloads = userDownloads.get(user.chat_id);
        if (downloads && downloads.length > 0) {
          block += `\n   📥 دانلودها:`;
          for (const d of downloads) {
            block += `\n     • ${esc(d.title)} ×${d.count}`;
          }
        } else {
          block += `\n   📥 دانلودها: ندارد`;
        }

        // Stop before exceeding Telegram's 4096 char limit
        if (text.length + block.length > 3800) {
          text += `\n\n... و ${users.length - shown} کاربر دیگر`;
          break;
        }
        text += block;
        shown++;
      }
    }

    const inline_keyboard = [[{ text: "🔙 بازگشت به مدیریت", callback_data: "a_back" }]];

    await sendMessage(chatId, text, { inline_keyboard });
  } catch (err) {
    console.error("sendUsersView error:", err);
    await sendMessage(chatId, `❌ خطا در دریافت لیست کاربران: ${err instanceof Error ? err.message : "نامشخص"}`);
  }
}

export async function handleAdminFileUpload(
  chatId: number,
  document: { file_id: string; file_name: string; file_size: number },
  categoryKey: string,
  fileName?: string,
  description?: string,
) {
  console.log("handleAdminFileUpload called:", { chatId, categoryKey, document, fileName, description });
  const category = await getCategory(categoryKey);
  console.log("Category found:", category);
  if (!category) {
    await sendMessage(chatId, "❌ دسته‌بندی یافت نشد.");
    return;
  }

  // Generate unique file ID to avoid collisions
  const baseName = (fileName || document.file_name.replace(/\.[^/.]+$/, ""))
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .substring(0, 20);
  
  const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const generatedFileId = baseName ? `${baseName}_${uniqueSuffix}` : `file_${uniqueSuffix}`;

  if (await fileExists(generatedFileId)) {
    await sendMessage(chatId, "❌ فایلی با این شناسه از قبل وجود دارد. لطفاً دوباره تلاش کنید.");
    return;
  }

  await createFile({
    id: generatedFileId,
    title: fileName || document.file_name.replace(/\.[^/.]+$/, ""),
    filename: document.file_name,
    category_key: categoryKey,
    telegram_file_id: document.file_id,
    downloads: 0,
    description: description || "",
  });

  const fileUrl = await getTelegramFileUrl(document.file_id);
  const displayTitle = fileName || document.file_name.replace(/\.[^/.]+$/, "");
  if (fileUrl) {
    await sendMessage(
      chatId,
      `✅ فایل "${displayTitle}" با موفقیت به دسته "${category.title}" اضافه شد!\n\n📎 شناسه فایل: ${generatedFileId}\n📥 لینک مستقیم: ${fileUrl}`,
    );
  } else {
    await sendMessage(
      chatId,
      `✅ فایل "${displayTitle}" به دسته "${category.title}" اضافه شد (لینک مستقیم در دسترس نیست).`,
    );
  }

  await clearAdminState(chatId);
  await sendAdminManagementMenu(chatId);
}

export async function handleAddCategory(chatId: number, categoryName: string) {
  // Generate unique key: use timestamp + random suffix to avoid collisions
  const baseKey = categoryName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .substring(0, 20);
  
  // Add unique suffix to avoid collisions from Persian names
  const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  const categoryKey = baseKey ? `${baseKey}_${uniqueSuffix}` : `cat_${uniqueSuffix}`;

  if (await categoryExists(categoryKey)) {
    // Extremely unlikely, but handle just in case
    await sendMessage(chatId, "❌ دسته‌بندی با این نام از قبل وجود دارد.");
    return;
  }

  await createCategory(categoryKey, categoryName);
  await sendMessage(chatId, `✅ دسته‌بندی "${categoryName}" با موفقیت ایجاد شد!`);
  await clearAdminState(chatId);
  await sendAdminManagementMenu(chatId);
}

export async function handleAdminCallback(chatId: number, buttonData: string) {
  const step = await getAdminState(chatId);

  if (buttonData === "a_add_file") {
    await setAdminState(chatId, "add_file_category");
    await sendAddFileCategorySelection(chatId);
  } else if (buttonData === "a_manage_files") {
    await clearAdminState(chatId);
    await sendManageFilesView(chatId);
  } else if (buttonData === "a_edit_file_desc") {
    await clearAdminState(chatId);
    await sendEditFileDescCategorySelection(chatId);
  } else if (buttonData.startsWith("efd_cat_")) {
    const categoryKey = buttonData.replace("efd_cat_", "");
    await sendEditFileDescFileSelection(chatId, categoryKey);
  } else if (buttonData.startsWith("efd_file_")) {
    const fileId = buttonData.replace("efd_file_", "");
    await setAdminState(chatId, "edit_file_description", { selectedFileId: fileId });
    await sendEditFileDescPrompt(chatId, fileId);
  } else if (buttonData === "a_add_cat") {
    await setAdminState(chatId, "add_category_name");
    await sendAddCategoryPrompt(chatId);
  } else if (buttonData === "a_stats") {
    await setAdminState(chatId, "stats");
    await sendStatsView(chatId);
  } else if (buttonData === "a_users") {
    await setAdminState(chatId, "users");
    await sendUsersView(chatId);
  } else if (buttonData === "a_mgmt") {
    await clearAdminState(chatId);
    await sendAdminManagementMenu(chatId);
  } else if (buttonData === "a_back") {
    await clearAdminState(chatId);
    await sendAdminWelcomeMessage(chatId);
  } else if (buttonData === "a_add_sub") {
    await setAdminState(chatId, "add_subcategory_parent");
    await sendAddSubcategoryParentSelection(chatId);
  } else if (buttonData.startsWith("a_select_parent_cat_")) {
    const parentKey = buttonData.replace("a_select_parent_cat_", "");
    await setAdminState(chatId, "add_subcategory_name", { selectedParentCategory: parentKey });
    await sendAddSubcategoryNamePrompt(chatId, parentKey);
  } else if (buttonData.startsWith("sc_")) {
    console.log("Admin select cat for file upload:", chatId, buttonData);
    const categoryKey = buttonData.replace("sc_", "");
    const subcategories = await getSubcategories(categoryKey);
    console.log("Subcategories for", categoryKey, ":", subcategories);
    if (subcategories.length > 0) {
      // Category has subcategories, show option to save in category or subcategory
      await setAdminState(chatId, "add_file_category", { selectedCategory: categoryKey });
      await sendFileSaveLocationPrompt(chatId, categoryKey, subcategories);
    } else {
      // No subcategories, go directly to description
      await setAdminState(chatId, "add_file_description", { selectedCategory: categoryKey });
      await sendAddFileDescriptionPrompt(chatId, categoryKey);
    }
  } else if (buttonData.startsWith("sf_c_")) {
    const categoryKey = buttonData.replace("sf_c_", "");
    await setAdminState(chatId, "add_file_description", { selectedCategory: categoryKey });
    await sendAddFileDescriptionPrompt(chatId, categoryKey);
  } else if (buttonData.startsWith("sf_s_")) {
    const subcategoryKey = buttonData.replace("sf_s_", "");
    await setAdminState(chatId, "add_file_description", { selectedCategory: subcategoryKey });
    await sendAddFileDescriptionPrompt(chatId, subcategoryKey);
  } else if (buttonData.startsWith("a_skip_desc_")) {
    const categoryKey = buttonData.replace("a_skip_desc_", "");
    await setAdminState(chatId, "add_file_upload", { selectedCategory: categoryKey, description: "" });
    await sendAddFileUploadPrompt(chatId, categoryKey, "");
  } else if (buttonData.startsWith("a_enter_desc_")) {
    const categoryKey = buttonData.replace("a_enter_desc_", "");
    await setAdminState(chatId, "add_file_description", { selectedCategory: categoryKey });
    await sendAddFileDescriptionPrompt(chatId, categoryKey);
  } else if (buttonData === "a_edit_cat") {
    await clearAdminState(chatId);
    await sendEditCategorySelection(chatId);
  } else if (buttonData.startsWith("ec_view_")) {
    const categoryKey = buttonData.replace("ec_view_", "");
    await sendEditCategorySelection(chatId, categoryKey);
  } else if (buttonData.startsWith("ec_edit_")) {
    const categoryKey = buttonData.replace("ec_edit_", "");
    await setAdminState(chatId, "edit_category_name", { selectedCategory: categoryKey });
    await sendEditCategoryPrompt(chatId, categoryKey);
  } else if (buttonData.startsWith("ec_")) {
    // Legacy support
    const categoryKey = buttonData.replace("ec_", "");
    await setAdminState(chatId, "edit_category_name", { selectedCategory: categoryKey });
    await sendEditCategoryPrompt(chatId, categoryKey);
  } else if (buttonData === "a_del_cat") {
    console.log("Admin delete category clicked:", chatId);
    await clearAdminState(chatId);
    await sendDeleteCategorySelection(chatId);
  } else if (buttonData.startsWith("dc_view_")) {
    const categoryKey = buttonData.replace("dc_view_", "");
    await sendDeleteCategorySelection(chatId, categoryKey);
  } else if (buttonData.startsWith("dd_")) {
    console.log("Admin do delete:", chatId, buttonData);
    const categoryKey = buttonData.replace("dd_", "");
    await handleDeleteCategory(chatId, categoryKey);
  }
}