import { toFa } from "@/context/carLabels";
import { formatPrice } from "@/context/data";
import { useUserInfo } from "@/context/UserInfoProvider";
import { useSeller } from "@/hooks/useSellers";
import {
  fetchSellerStats,
  type SellerStats,
} from "@/lib/supabase/completedSales";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ListChecks,
  MessageSquare,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

interface StatCard {
  id: string;
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: ReactNode;
}

export default function StatsGrid() {
  const { profile } = useUserInfo();
  const { seller, loading } = useSeller(profile?.id ?? "");
  const [soldStats, setSoldStats] = useState<SellerStats>({
    total_cars_sold: 0,
    total_volume: 0,
  });

  useEffect(() => {
    const id = profile?.id;
    if (!id) return;
    let cancelled = false;
    fetchSellerStats(id)
      .then((s) => {
        if (!cancelled) setSoldStats(s);
      })
      .catch(() => {
        /* keep zeros */
      });
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  if (loading || !seller) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-elevated p-5 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-muted" />
              <div className="h-4 w-12 bg-muted rounded" />
            </div>
            <div className="h-7 w-20 bg-muted rounded mb-1" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  const summary = seller.summary;

  const stats: StatCard[] = [
    {
      id: "st-active",
      label: "آگهی فعال",
      value: toFa(summary.activeListings),
      change: `${toFa(summary.totalListings)} کل`,
      up: true,
      icon: <ListChecks size={18} className="text-primary" />,
    },
    {
      id: "st-sold",
      label: "فروخته شده",
      value: toFa(soldStats.total_cars_sold),
      change: formatPrice(soldStats.total_volume),
      up: soldStats.total_cars_sold > 0,
      icon: <CheckCircle size={18} className="text-success" />,
    },
    {
      id: "st-response",
      label: "نرخ پاسخگویی",
      value: `${toFa(summary.responseRate)}٪`,
      change: `امتیاز ${toFa(summary.sellerScore)}`,
      up: summary.sellerScore >= 50,
      icon: <MessageSquare size={18} className="text-accent" />,
    },
    {
      id: "st-brands",
      label: "برندهای تخصصی",
      value: toFa(summary.brands.length),
      change: summary.verified ? "تأییدشده" : "در انتظار",
      up: summary.verified,
      icon: <Star size={18} className="text-warning" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.id} className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              {stat.icon}
            </div>
            <span
              className={`flex items-center gap-0.5 text-xs font-700 ${stat.up ? "text-success" : "text-danger"}`}
            >
              {stat.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
              {stat.change}
            </span>
          </div>
          <div className="stat-value text-2xl">{stat.value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
