"use client";

import { toFa } from "@/context/carLabels";
import { useUserInfo } from "@/context/UserInfoProvider";
import { useSeller } from "@/hooks/useSellers";
import {
  fetchSellerSales,
  fetchSellerStats,
  type CompletedSaleRow,
  type SellerStats,
} from "@/lib/supabase/completedSales";
import {
  HandCoins,
  ListChecks,
  MessageSquare,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

const dateFa = (iso: string) =>
  new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));

const statusBadge = (status: CompletedSaleRow["status"]) => {
  const map = {
    PENDING_BUYER: {
      label: "در انتظار تأیید",
      cls: "bg-warning/10 text-warning",
    },
    CONFIRMED: { label: "تأیید شده", cls: "bg-success/10 text-success" },
    REJECTED: { label: "رد شده", cls: "bg-danger/10 text-danger" },
  } as const;
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-2xs font-700 ${s.cls}`}
    >
      {s.label}
    </span>
  );
};

export default function AnalyticsTab() {
  const { profile } = useUserInfo();
  const sellerId = profile?.id ?? "";
  const { seller } = useSeller(sellerId);

  const [sales, setSales] = useState<CompletedSaleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SellerStats>({
    total_cars_sold: 0,
    total_volume: 0,
  });

  useEffect(() => {
    if (!sellerId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [s, r] = await Promise.all([
          fetchSellerStats(sellerId),
          fetchSellerSales(sellerId),
        ]);
        if (!cancelled) {
          setStats(s);
          setSales(r);
        }
      } catch {
        /* keep empty state */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  const summary = seller?.summary;

  const cards = [
    {
      title: "کل معاملات ثبت‌شده",
      value: toFa(stats.total_cars_sold),
      sub: "مجموع معاملات شما",
      icon: <ShoppingCart size={20} className="text-primary" />,
    },
    {
      title: "حجم معاملات",
      value: `${stats.total_volume.toLocaleString()} تومان`,
      sub: "مجموع ارزش معاملات",
      icon: <TrendingUp size={20} className="text-success" />,
    },
    {
      title: "آگهی فعال",
      value: toFa(summary?.activeListings ?? 0),
      sub: `${toFa(summary?.totalListings ?? 0)} آگهی کل`,
      icon: <ListChecks size={20} className="text-accent" />,
    },
    {
      title: "نرخ پاسخگویی",
      value: `${toFa(summary?.responseRate ?? 0)}٪`,
      sub: "پاسخ به درخواست‌ها",
      icon: <MessageSquare size={20} className="text-warning" />,
    },
  ];

  return (
    <div dir="rtl" className="vazir-matn flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <div key={card.title} className="card-elevated p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                {card.icon}
              </div>
            </div>
            <div className="stat-value text-3xl mb-1">{card.value}</div>
            <div className="text-sm font-600 text-foreground">{card.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="card-elevated rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-800 text-foreground">
            آخرین معاملات شما
          </h3>
          <span className="text-2xs text-muted-foreground">
            {loading ? "در حال بارگذاری…" : `${toFa(sales.length)} معامله`}
          </span>
        </div>

        {!loading && sales.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted-foreground">
            هنوز معامله‌ای برای شما ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground">
                  <th className="px-5 py-2.5 text-right font-600">تاریخ</th>
                  <th className="px-5 py-2.5 text-right font-600">خودرو</th>
                  <th className="px-5 py-2.5 text-right font-600">نوع</th>
                  <th className="px-5 py-2.5 text-right font-600">وضعیت</th>
                  <th className="px-5 py-2.5 text-left font-600">مبلغ نهایی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sales.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                      {dateFa(s.created_at)}
                    </td>
                    <td className="px-5 py-3 text-foreground">
                      {[s.listing_brand, s.listing_model]
                        .filter(Boolean)
                        .join(" ")}
                    </td>
                    <td className="px-5 py-3">
                      {s.listing_type === "BUY" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent/10 text-accent text-2xs font-700">
                          <HandCoins size={11} />
                          خرید
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-2xs font-700">
                          <ShoppingCart size={11} />
                          فروش
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">{statusBadge(s.status)}</td>
                    <td className="px-5 py-3 text-left font-mono text-foreground whitespace-nowrap">
                      {s.final_sold_price.toLocaleString("fa-IR")} تومان
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
