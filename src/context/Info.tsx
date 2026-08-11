"use client";

import { useHomepageStats } from "@/hooks/useHomepageStats";
import {
  Car,
  CheckCircle,
  ListChecks,
  Search,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";
import { toFa } from "./carLabels";
import { Spinner } from "@/components/ui/spinner";

function formatAvgPrice(value: number): string {
  if (value >= 1_000_000_000) {
    return `${toFa((value / 1_000_000_000).toFixed(1))} میلیارد`;
  }
  if (value >= 1_000_000) {
    return `${toFa(Math.round(value / 1_000_000))} میلیون`;
  }
  return toFa(value);
}

function formatPercent(value: number): string {
  return toFa(value.toFixed(1)) + "%";
}

export function Stats() {
  const { stats, loading } = useHomepageStats();

  const s = stats ?? {
    active_posts_count: 0,
    today_new_posts: 0,
    total_sellers: 0,
    avg_response_rate: 0,
    supported_brands: 0,
    avg_post_price: 0,
    price_change_since_last_week: 0,
  };

  // price_change_since_last_week is an absolute value (Rials), not a %.
  // Compute the real percentage change relative to the previous week's average.
  const prevWeekPrice = s.avg_post_price - s.price_change_since_last_week;
  const priceChangePercent =
    prevWeekPrice !== 0
      ? (s.price_change_since_last_week / prevWeekPrice) * 100
      : 0;
  const priceChangeLabel = `${priceChangePercent >= 0 ? "+" : ""}${formatPercent(priceChangePercent)}`;

  const items = [
    {
      id: "stat-listings",
      icon: <ListChecks size={22} className="text-primary" />,
      value: loading ? (
        <Spinner className="w-5 h-5" />
      ) : (
        toFa(s.active_posts_count)
      ),
      label: "آگهی فعال",
      sub: `+${loading ? <Spinner className="w-5 h-5" /> : toFa(s.today_new_posts)} امروز`,
      positive: true,
    },
    {
      id: "stat-sellers",
      icon: <Users size={22} className="text-accent" />,
      value: loading ? <Spinner className="w-5 h-5" /> : toFa(s.total_sellers),
      label: "فروشنده تأییدشده",
      sub: `${loading ? <Spinner className="w-5 h-5" /> : formatPercent(s.avg_response_rate)} نرخ پاسخ`,
      positive: true,
    },
    {
      id: "stat-brands",
      icon: <Car size={22} className="text-success" />,
      value: loading ? (
        <Spinner className="w-5 h-5" />
      ) : (
        toFa(s.supported_brands)
      ),
      label: "برند پوشش‌داده‌شده",
      sub: "داخلی و وارداتی",
      positive: true,
    },
    {
      id: "stat-avg",
      icon: <TrendingUp size={22} className="text-warning" />,
      value: loading ? (
        <Spinner className="w-5 h-5" />
      ) : (
        formatAvgPrice(s.avg_post_price)
      ),
      label: "میانگین قیمت آگهی",
      sub: `${loading ? <Spinner className="w-5 h-5" /> : priceChangeLabel} نسبت به هفته قبل`,
      positive: s.price_change_since_last_week >= 0,
    },
  ];

  return items;
}

// export const brands = [
//   "همه برندها",
//   "تویوتا",
//   "هیوندای",
//   "کیا",
//   "بی‌ام‌و",
//   "جیلی",
//   "هاوال",
//   "جتور",
//   "چری",
//   "ایران‌خودرو",
//   "ام‌وی‌ام",
//   "هوندا",
//   "فولکس‌واگن",
// ];
// export const cities = [
//   "همه شهرها",
//   "تهران",
//   "اصفهان",
//   "مشهد",
//   "شیراز",
//   "تبریز",
//   "کرج",
// ];

export function Steps() {
  const steps = [
    {
      id: "step-browse",
      number: "۰۱",
      icon: <Search size={24} className="text-primary" />,
      title: "مرور و فیلتر آگهی‌ها",
      description:
        "بیش از ۸٬۵۰ آگهی صفرکیلومتر را بر اساس برند، مدل، تریم، رنگ، شهر و محدوده قیمت جستجو کنید. با جدول بورس‌مانند ما مرتب‌سازی کنید.",
    },
    {
      id: "step-request",
      number: "۰۲",
      icon: <Send size={24} className="text-accent" />,
      title: "ارسال درخواست خرید",
      description:
        "خودروی مناسب پیدا کردید؟ درخواست خرید را مستقیماً به فروشنده تأییدشده ارسال کنید. بدون تماس تلفنی — درخواست شامل شرایط و قیمت پیشنهادی شماست.",
    },
    {
      id: "step-confirm",
      number: "۰۳",
      icon: <CheckCircle size={24} className="text-success" />,
      title: "پاسخ فروشنده",
      description:
        "فروشنده تأیید، رد یا قابل مذاکره اعلام می‌کند — فوری اطلاع‌رسانی می‌شوید. در صورت قابل مذاکره، اطلاعات تماس برای گفتگوی مستقیم به اشتراک گذاشته می‌شود.",
    },
  ];

  return steps;
}
