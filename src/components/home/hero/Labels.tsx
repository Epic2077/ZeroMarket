import { Shield, TrendingUp, Zap } from "lucide-react";

export default function HeroLabels() {
  return (
    <div className="flex flex-wrap gap-6 mt-5">
      {[
        { icon: <Shield size={18} />, label: "۱٬۲۴۰+ فروشنده تأییدشده" },
        { icon: <TrendingUp size={18} />, label: "تحلیل قیمت لحظه‌ای" },
        { icon: <Zap size={18} />, label: "۸٬۵۰۰+ آگهی فعال" },
      ]?.map((tag) => (
        <div
          key={`hero-tag-${tag?.label}`}
          className="flex items-center gap-1.5 text-sm text-white/70"
        >
          <span className="text-accent">{tag?.icon}</span>
          {tag?.label}
        </div>
      ))}
    </div>
  );
}
