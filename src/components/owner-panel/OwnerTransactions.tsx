"use client";

import {
  fetchPlatformSummary,
  fetchRecentSales,
  type CompletedSaleRow,
  type PlatformSummary,
} from "@/lib/supabase/completedSales";
import { formatPrice } from "@/context/data";
import { toFa } from "@/context/carLabels";
import { HandCoins, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

const typeBadge = (type: CompletedSaleRow["listing_type"]) =>
  type === "BUY" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-accent/10 text-accent text-2xs font-700">
      <HandCoins size={11} />
      خرید
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-2xs font-700">
      <ShoppingCart size={11} />
      فروش
    </span>
  );

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

const dateFa = (iso: string) =>
  new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));

export default function OwnerTransactions() {
  const [summary, setSummary] = useState<PlatformSummary | null>(null);
  const [sales, setSales] = useState<CompletedSaleRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [s, r] = await Promise.all([
          fetchPlatformSummary(),
          fetchRecentSales(50),
        ]);
        if (!cancelled) {
          setSummary(s);
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
  }, []);

  const cards = [
    {
      label: "حجم کل معاملات بازار",
      value: formatPrice(summary?.grand_total_volume ?? 0),
      unit: "تومان",
      icon: <TrendingUp size={16} />,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "تعداد کل معاملات",
      value: toFa(summary?.grand_total_cars_sold ?? 0),
      unit: "دستگاه خودرو",
      icon: <ShoppingCart size={16} />,
      tone: "text-success bg-success/10",
    },
    {
      label: "فروشندگان فعال",
      value: toFa(summary?.total_active_sellers ?? 0),
      unit: "فروشنده",
      icon: <Users size={16} />,
      tone: "text-negotiable bg-negotiable/10",
    },
  ];

  return (
    <div dir="rtl" className="vazir-matn flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="card-elevated rounded-2xl p-5 flex items-start gap-3"
          >
            <span
              className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${c.tone}`}
            >
              {c.icon}
            </span>
            <div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="stat-value text-foreground">{c.value}</span>
                <span className="text-2xs text-muted-foreground">{c.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent transactions log */}
      <div className="card-elevated rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-800 text-foreground">
            آخرین معاملات ثبت‌شده
          </h3>
          <span className="text-2xs text-muted-foreground">
            {loading ? "در حال بارگذاری…" : `${toFa(sales.length)} معامله`}
          </span>
        </div>

        {!loading && sales.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted-foreground">
            هنوز معامله‌ای ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground">
                  <th className="px-5 py-2.5 text-right font-600">تاریخ</th>
                  <th className="px-5 py-2.5 text-right font-600">فروشنده</th>
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
                    <td className="px-5 py-3 text-foreground font-600">
                      {s.seller_name}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {[s.listing_brand, s.listing_model]
                        .filter(Boolean)
                        .join(" ")}
                    </td>
                    <td className="px-5 py-3">{typeBadge(s.listing_type)}</td>
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
