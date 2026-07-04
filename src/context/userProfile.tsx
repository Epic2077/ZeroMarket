import type {
  MyRequest,
  NotificationPref,
  PriceAlert,
  UserNotification,
  SavedListing,
  UserProfile,
} from "@/types/user";
import {
  BadgeCheck,
  Bell,
  Bookmark,
  Eye,
  Megaphone,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  TriangleAlert,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

// The signed-in user (mock). Switch `role` to "seller" to hide the upgrade flow.
export const currentUser: UserProfile = {
  id: "user-001",
  fullName: "نیما اسدی",
  email: "nima.asadi@example.com",
  phone: "۰۹۱۲ ۳۴۵ ۶۷۸۹",
  city: "Tehran",
  bio: "به‌دنبال خودروی صفر کیلومتر مناسب خانواده.",
  avatar: "نا",
  memberSince: "۱۴۰۲",
  role: "user",
  verified: false,
  sellerApplicationStatus: "none",
};

/* ------------------------------ Dashboard -------------------------------- */

export interface UserStat {
  id: string;
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: ReactNode;
}

export const userStats: UserStat[] = [
  {
    id: "us-saved",
    label: "آگهی‌های ذخیره‌شده",
    value: "۸",
    change: "+۲",
    up: true,
    icon: <Bookmark size={18} className="text-primary" />,
  },
  {
    id: "us-requests",
    label: "درخواست‌های فعال",
    value: "۳",
    change: "+۱",
    up: true,
    icon: <Send size={18} className="text-accent" />,
  },
  {
    id: "us-alerts",
    label: "هشدارهای قیمت",
    value: "۴",
    change: "+۱",
    up: true,
    icon: <Bell size={18} className="text-warning" />,
  },
  {
    id: "us-views",
    label: "بازدید این ماه",
    value: "۱۲۶",
    change: "+۲۴٪",
    up: true,
    icon: <Eye size={18} className="text-success" />,
  },
];

export const userDashboardTabs = [
  { id: "saved", label: "آگهی‌های ذخیره‌شده" },
  { id: "requests", label: "درخواست‌های من" },
  { id: "notifications", label: "اعلان‌ها" },
  { id: "alerts", label: "هشدارهای قیمت" },
] as const;

export type UserDashboardTabId = (typeof userDashboardTabs)[number]["id"];

// Bookmarked listings (mock). `listingId` points at a real entry in `listings`.
export const savedListings: SavedListing[] = [
  {
    id: "sv-001",
    listingId: "listing-001",
    title: "تویوتا کمری",
    trim: "XLE 2.5L",
    city: "تهران",
    price: 2850000000,
    avatar: "TOY",
    status: "active",
    savedAt: "۲ روز پیش",
  },
  {
    id: "sv-002",
    listingId: "listing-002",
    title: "هیوندای توسان",
    trim: "N-Line AWD",
    city: "اصفهان",
    price: 3200000000,
    avatar: "HYU",
    status: "negotiable",
    savedAt: "۴ روز پیش",
  },
  {
    id: "sv-003",
    listingId: "listing-003",
    title: "کیا اسپورتیج",
    trim: "GT-Line",
    city: "تهران",
    price: 2950000000,
    avatar: "KIA",
    status: "active",
    savedAt: "۱ هفته پیش",
  },
  {
    id: "sv-004",
    listingId: "listing-005",
    title: "جیلی کول‌ری",
    trim: "GT",
    city: "مشهد",
    price: 1850000000,
    avatar: "GEE",
    status: "reserved",
    savedAt: "۱ هفته پیش",
  },
];

// Requests the buyer has submitted to sellers (outgoing offers).
export const myRequests: MyRequest[] = [
  {
    id: "myr-001",
    title: "تویوتا کمری XLE",
    seller: "آریا موتورز",
    offer: 2750000000,
    status: "pending",
    time: "۲ ساعت پیش",
  },
  {
    id: "myr-002",
    title: "کیا اسپورتیج GT-Line",
    seller: "مهر خودرو",
    offer: 2900000000,
    status: "negotiable",
    time: "دیروز",
  },
  {
    id: "myr-003",
    title: "جیلی کول‌ری GT",
    seller: "سینا موتورز",
    offer: 1800000000,
    status: "approved",
    time: "۳ روز پیش",
  },
  {
    id: "myr-004",
    title: "هاوال H6",
    seller: "مرکز هاوال",
    offer: 2400000000,
    status: "declined",
    time: "۵ روز پیش",
  },
];

// Standing price alerts (mock).
export const priceAlerts: PriceAlert[] = [
  {
    id: "al-001",
    title: "تویوتا کمری XLE",
    targetPrice: 2700000000,
    currentPrice: 2850000000,
    active: true,
  },
  {
    id: "al-002",
    title: "هیوندای توسان N-Line",
    targetPrice: 3000000000,
    currentPrice: 3200000000,
    active: true,
  },
  {
    id: "al-003",
    title: "کیا اسپورتیج GT-Line",
    targetPrice: 2800000000,
    currentPrice: 2950000000,
    active: false,
  },
  {
    id: "al-004",
    title: "جیلی کول‌ری GT",
    targetPrice: 1750000000,
    currentPrice: 1850000000,
    active: true,
  },
];

export const userNotifications: UserNotification[] = [
  {
    id: "un-001",
    title: "پاسخ جدید برای درخواست خرید شما",
    body: "فروشنده آریا موتورز پیشنهاد شما برای تویوتا کمری XLE را دریافت کرده و خواسته درباره قیمت نهایی مذاکره کنید.",
    time: "۱۲ دقیقه پیش",
    unread: true,
    kind: "request",
    href: "/dashboard/user",
    actionLabel: "مشاهده درخواست",
    icon: <MessageSquareText size={18} className="text-primary" />,
  },
  {
    id: "un-002",
    title: "هشدار قیمت فعال شد",
    body: "قیمت هیوندای توسان N-Line به سطح هدف شما نزدیک شده است. این آگهی را بررسی کنید تا از تغییرات بعدی جا نمانید.",
    time: "۴۵ دقیقه پیش",
    unread: true,
    kind: "price",
    href: "/market/listings/listing-002",
    actionLabel: "بررسی آگهی",
    icon: <TriangleAlert size={18} className="text-warning" />,
  },
  {
    id: "un-003",
    title: "آگهی ذخیره‌شده به‌روزرسانی شد",
    body: "کیا اسپورتیج GT-Line از حالت فعال به قابل مذاکره تغییر کرده و ممکن است زمان مناسبی برای ارسال پیشنهاد باشد.",
    time: "۲ ساعت پیش",
    unread: false,
    kind: "saved",
    href: "/market/listings/listing-003",
    actionLabel: "مشاهده آگهی",
    icon: <BadgeCheck size={18} className="text-success" />,
  },
  {
    id: "un-004",
    title: "پیشنهاد ویژه برای شما",
    body: "سیستم بازار یک افت قیمت تازه برای جیلی کول‌ری GT تشخیص داده و آن را در فهرست پیگیری شما برجسته کرده است.",
    time: "دیروز",
    unread: false,
    kind: "system",
    actionLabel: "باز کردن بازار",
    href: "/market",
    icon: <Megaphone size={18} className="text-accent" />,
  },
];

/* ------------------------------- Profile --------------------------------- */

export const profileTabs = [
  { id: "personal", label: "اطلاعات شخصی" },
  { id: "security", label: "امنیت" },
  { id: "notifications", label: "اعلان‌ها" },
  { id: "seller", label: "ارتقا به فروشنده تایید شده" },
] as const;

export type ProfileTabId = (typeof profileTabs)[number]["id"];

export const cityOptions = [
  { value: "Tehran", label: "تهران" },
  { value: "Isfahan", label: "اصفهان" },
  { value: "Mashhad", label: "مشهد" },
  { value: "Shiraz", label: "شیراز" },
  { value: "Tabriz", label: "تبریز" },
  { value: "Karaj", label: "کرج" },
];

export const notificationPrefs: NotificationPref[] = [
  {
    id: "np-requests",
    label: "پاسخ به درخواست‌ها",
    desc: "وقتی فروشنده به درخواست خرید شما پاسخ می‌دهد.",
    enabled: true,
  },
  {
    id: "np-price",
    label: "هشدارهای قیمت",
    desc: "وقتی قیمت خودروی موردعلاقه به هدف شما می‌رسد.",
    enabled: true,
  },
  {
    id: "np-saved",
    label: "تغییر وضعیت آگهی‌های ذخیره‌شده",
    desc: "وقتی آگهی ذخیره‌شده فروخته یا رزرو می‌شود.",
    enabled: false,
  },
  {
    id: "np-newsletter",
    label: "خبرنامه و تحلیل بازار",
    desc: "گزارش هفتگی روند قیمت خودرو در ایران.",
    enabled: true,
  },
];

// Reasons shown in the "become a seller" call-to-action.
export const sellerBenefits: {
  icon: LucideIcon;
  title: string;
  desc: string;
}[] = [
  {
    icon: Store,
    title: "ثبت نامحدود آگهی",
    desc: "خودروهای صفر کیلومتر خود را بدون محدودیت منتشر کنید.",
  },
  {
    icon: TrendingDown,
    title: "تحلیل قیمت بازار",
    desc: "قیمت پیشنهادی هوشمند بر اساس داده‌های زنده بازار.",
  },
  {
    icon: ShieldCheck,
    title: "نشان فروشنده تأییدشده",
    desc: "پس از احراز هویت، نشان اعتماد دریافت می‌کنید.",
  },
  {
    icon: Sparkles,
    title: "داشبورد فروش حرفه‌ای",
    desc: "مدیریت آگهی‌ها، درخواست‌ها و تحلیل‌ها در یک‌جا.",
  },
];

export const businessTypeOptions = [
  { value: "dealership", label: "نمایندگی مجاز" },
  { value: "showroom", label: "نمایشگاه خودرو" },
  { value: "individual", label: "فروشنده حقیقی" },
];
