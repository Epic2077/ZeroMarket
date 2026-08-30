import { Shield, TrendingUp, Zap } from "lucide-react";
import { fetchVerifiedSellersCount } from "@/lib/supabase/sellers";
import { fetchActiveListingsCount } from "@/lib/supabase/listings";
import { toFa } from "@/context/carLabels";

export default async function HeroLabels() {
  let verifiedSellers = 0;
  let activeListings = 0;

  try {
    [verifiedSellers, activeListings] = await Promise.all([
      fetchVerifiedSellersCount(),
      fetchActiveListingsCount(),
    ]);
  } catch {
    // Use fallback values if DB is unavailable
  }

  const stats = [
    { icon: <Shield size={14} />, label: `${toFa(verifiedSellers)}+ فروشنده تأییدشده` },
    { icon: <TrendingUp size={14} />, label: "تحلیل قیمت لحظه‌ای" },
    { icon: <Zap size={14} />, label: `${toFa(activeListings)}+ آگهی فعال` },
  ];

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