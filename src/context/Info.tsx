import {
  Car,
  CheckCircle,
  ListChecks,
  Search,
  Send,
  TrendingUp,
  Users,
} from "lucide-react";

export const stats = [
  {
    id: "stat-listings",
    icon: <ListChecks size={22} className="text-primary" />,
    value: "۸,۵۴۷",
    label: "آگهی فعال",
    sub: "+۱۴۳ امروز",
    positive: true,
  },
  {
    id: "stat-sellers",
    icon: <Users size={22} className="text-accent" />,
    value: "۱,۲۴۱",
    label: "فروشنده تأییدشده",
    sub: "۹۴.۲% نرخ پاسخ",
    positive: true,
  },
  {
    id: "stat-brands",
    icon: <Car size={22} className="text-success" />,
    value: "۳۸",
    label: "برند پوشش‌داده‌شده",
    sub: "داخلی و وارداتی",
    positive: true,
  },
  {
    id: "stat-avg",
    icon: <TrendingUp size={22} className="text-warning" />,
    value: "۲.۵ میلیارد",
    label: "میانگین قیمت آگهی",
    sub: "+۱.۸% نسبت به هفته قبل",
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

export const steps = [
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
