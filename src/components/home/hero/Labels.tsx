import { Shield, TrendingUp, Zap } from "lucide-react";

const stats = [
  { icon: <Shield size={14} />, label: "۱٬۲۴۰+ فروشنده تأییدشده" },
  { icon: <TrendingUp size={14} />, label: "تحلیل قیمت لحظه‌ای" },
  { icon: <Zap size={14} />, label: "۸٬۵۰۰+ آگهی فعال" },
];

export default function HeroLabels() {
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {stats.map((tag) => (
        <div
          key={tag.label}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 border border-white/15 text-xs font-500 text-white/70"
        >
          <span className="text-accent">{tag.icon}</span>
          {tag.label}
        </div>
      ))}
    </div>
  );
}
