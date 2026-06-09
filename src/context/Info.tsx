import { Car, ListChecks, TrendingUp, Users } from "lucide-react";

export const stats = [
  {
    id: "stat-listings",
    icon: <ListChecks size={22} className="text-primary" />,
    value: "8,547",
    label: "آگهی فعال",
    sub: "+143 امروز",
    positive: true,
  },
  {
    id: "stat-sellers",
    icon: <Users size={22} className="text-accent" />,
    value: "1,241",
    label: "فروشنده تأییدشده",
    sub: "94.2% نرخ پاسخ",
    positive: true,
  },
  {
    id: "stat-brands",
    icon: <Car size={22} className="text-success" />,
    value: "38",
    label: "برند پوشش‌داده‌شده",
    sub: "داخلی و وارداتی",
    positive: true,
  },
  {
    id: "stat-avg",
    icon: <TrendingUp size={22} className="text-warning" />,
    value: "2.4 میلیارد",
    label: "میانگین قیمت آگهی",
    sub: "+1.8% نسبت به هفته قبل",
    positive: true,
  },
];

export const brands = [
  "همه برندها",
  "تویوتا",
  "هیوندای",
  "کیا",
  "بی‌ام‌و",
  "جیلی",
  "هاوال",
  "جتور",
  "چری",
  "ایران‌خودرو",
  "ام‌وی‌ام",
  "هوندا",
  "فولکس‌واگن",
];
export const cities = [
  "همه شهرها",
  "تهران",
  "اصفهان",
  "مشهد",
  "شیراز",
  "تبریز",
  "کرج",
];
