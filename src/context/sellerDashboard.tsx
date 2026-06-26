import { listings } from "@/context/data";
import {
  BarChart2,
  Bell,
  CheckCircle,
  Clock,
  Eye,
  PlusCircle,
  Send,
  TrendingUp,
  Upload,
} from "lucide-react";
import type { ReactNode } from "react";

// The seller's own active listings (mock: first five).
export const sellerListings = listings.slice(0, 5);

// Deterministic pseudo "views" per listing so the number is stable across
// renders (avoids a hydration mismatch from Math.random()).
export function listingViews(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 100 + (Math.abs(hash) % 500);
}

export type RequestStatus = "pending" | "approved" | "declined" | "negotiable";

export interface BuyRequest {
  id: string;
  buyer: string;
  listing: string;
  offer: number;
  status: RequestStatus;
  time: string;
}

export const buyRequests: BuyRequest[] = [
  {
    id: "req-001",
    buyer: "علی رضایی",
    listing: "تویوتا کمری XLE",
    offer: 2750000000,
    status: "pending",
    time: "۲ ساعت پیش",
  },
  {
    id: "req-002",
    buyer: "سارا محمدی",
    listing: "هیوندای توسان N-Line",
    offer: 3100000000,
    status: "approved",
    time: "۵ ساعت پیش",
  },
  {
    id: "req-003",
    buyer: "محمد کریمی",
    listing: "کیا اسپورتیج GT-Line",
    offer: 2500000000,
    status: "negotiable",
    time: "دیروز",
  },
  {
    id: "req-004",
    buyer: "نیلوفر احمدی",
    listing: "بی‌ام‌و ۳ سری M Sport",
    offer: 7600000000,
    status: "declined",
    time: "۲ روز پیش",
  },
];

export const requestStatusMap: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  pending: { label: "در انتظار", className: "status-pending" },
  approved: { label: "تأیید شده", className: "status-active" },
  declined: { label: "رد شده", className: "status-sold" },
  negotiable: { label: "قابل مذاکره", className: "status-negotiable" },
};

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: ReactNode;
}

export const sellerStats: DashboardStat[] = [
  {
    id: "st-requests",
    label: "درخواست‌های دریافتی",
    value: "۴۷",
    change: "+۸٪",
    up: true,
    icon: <Send size={18} className="text-accent" />,
  },
  {
    id: "st-approved",
    label: "معاملات تأیید شده",
    value: "۲۳",
    change: "+۱۲٪",
    up: true,
    icon: <CheckCircle size={18} className="text-success" />,
  },
  {
    id: "st-revenue",
    label: "حجم فروش (تومان)",
    value: "۴۸.۲ میلیارد",
    change: "+۵٪",
    up: true,
    icon: <TrendingUp size={18} className="text-warning" />,
  },
  {
    id: "st-views",
    label: "بازدید کل",
    value: "۱۲٬۴۸۰",
    change: "+۱۸٪",
    up: true,
    icon: <Eye size={18} className="text-primary" />,
  },
];

export const dashboardTabs = [
  { id: "listings", label: "آگهی‌های من" },
  { id: "summary", label: "اعلان ها" },
  { id: "requests", label: "درخواست‌ها" },
  { id: "analytics", label: "تحلیل‌ها" },
] as const;

export type DashboardTabId = (typeof dashboardTabs)[number]["id"];

export interface PerformanceMetric {
  label: string;
  value: string;
  bar: number;
  color: string;
}

export const performanceMetrics: PerformanceMetric[] = [
  { label: "نرخ پاسخ", value: "۹۷٪", bar: 97, color: "bg-success" },
  { label: "نرخ تأیید", value: "۴۸٪", bar: 48, color: "bg-primary" },
  { label: "رضایت خریدار", value: "۹۲٪", bar: 92, color: "bg-accent" },
];

export interface QuickAction {
  icon: ReactNode;
  label: string;
  color: string;
  href?: string;
  modal?: "bulkImport";
}

export const quickActions: QuickAction[] = [
  {
    icon: <PlusCircle size={14} />,
    label: "ثبت آگهی جدید",
    color: "text-primary",
    href: "/dashboard/seller/products/new",
  },
  {
    icon: <Upload size={14} />,
    label: "ورود گروهی (اکسل)",
    color: "text-accent",
    modal: "bulkImport",
  },
  {
    icon: <BarChart2 size={14} />,
    label: "گزارش تحلیلی",
    color: "text-success",
  },
  { icon: <Bell size={14} />, label: "اعلان‌ها (۳)", color: "text-warning" },
];

export interface AnalyticsCard {
  title: string;
  value: string;
  sub: string;
  icon: ReactNode;
  change: string;
}

export const analyticsCards: AnalyticsCard[] = [
  {
    title: "بازدید روزانه",
    value: "۴۲۰",
    sub: "بازدید در ۷ روز گذشته",
    icon: <Eye size={20} className="text-primary" />,
    change: "+۱۵٪",
  },
  {
    title: "درخواست‌های هفتگی",
    value: "۱۲",
    sub: "درخواست در ۷ روز گذشته",
    icon: <Send size={20} className="text-accent" />,
    change: "+۸٪",
  },
  {
    title: "نرخ تبدیل",
    value: "۴۸٪",
    sub: "درخواست به معامله",
    icon: <TrendingUp size={20} className="text-success" />,
    change: "+۳٪",
  },
  {
    title: "میانگین زمان پاسخ",
    value: "۳.۲ ساعت",
    sub: "میانگین ۳۰ روز اخیر",
    icon: <Clock size={20} className="text-warning" />,
    change: "-۱۲٪",
  },
];
