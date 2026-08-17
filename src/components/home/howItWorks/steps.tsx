import { Search, Send, CheckCircle } from "lucide-react";
import { fetchHowItWorksSteps } from "@/lib/supabase/howItWorks";

const iconMap: Record<string, React.ReactNode> = {
  Search: <Search size={24} className="text-primary" />,
  Send: <Send size={24} className="text-accent" />,
  CheckCircle: <CheckCircle size={24} className="text-success" />,
};

function formatPersianNumber(n: number): string {
  const fa = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n)
    .split("")
    .map((d) => fa[Number(d)] ?? d)
    .join("");
}

export async function getSteps() {
  try {
    const steps = await fetchHowItWorksSteps();
    return steps.map((s, i) => ({
      id: s.id,
      number: formatPersianNumber(s.step_order).padStart(2, "۰"),
      icon: iconMap[s.icon_name] ?? iconMap.Search,
      title: s.title,
      description: s.description,
    }));
  } catch {
    // Return fallback steps if DB is unavailable
    return [
      {
        id: "step-browse",
        number: "۰۱",
        icon: iconMap.Search,
        title: "مرور و فیلتر آگهی‌ها",
        description: "بیش از ۸٬۵۰۰ آگهی صفرکیلومتر را بر اساس برند، مدل، تریم، رنگ، شهر و محدوده قیمت جستجو کنید.",
      },
      {
        id: "step-request",
        number: "۰۲",
        icon: iconMap.Send,
        title: "ارسال درخواست خرید",
        description: "خودروی مناسب پیدا کردید؟ درخواست خرید را مستقیماً به فروشنده تأییدشده ارسال کنید.",
      },
      {
        id: "step-confirm",
        number: "۰۳",
        icon: iconMap.CheckCircle,
        title: "پاسخ فروشنده",
        description: "فروشنده تأیید، رد یا قابل مذاکره اعلام می‌کند — فوری اطلاع‌رسانی می‌شوید.",
      },
    ];
  }
}