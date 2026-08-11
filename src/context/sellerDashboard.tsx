// MOCK

import {
  BarChart2,
  Bell,
  Clock,
  Eye,
  PlusCircle,
  Send,
  TrendingUp,
  Upload,
} from "lucide-react";
import type { ReactNode } from "react";

export type RequestStatus = "pending" | "approved" | "declined" | "negotiable";

export const requestStatusMap: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  pending: { label: "در انتظار", className: "status-pending" },
  approved: { label: "تأیید شده", className: "status-active" },
  declined: { label: "رد شده", className: "status-sold" },
  negotiable: { label: "قابل مذاکره", className: "status-negotiable" },
};

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
    title: "درخواست های تایید شده",
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
