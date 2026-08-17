"use client";

import { Badge } from "@/components/ui/badge";
import {
  brandLogoStyle,
  formatCost,
  LatestTableColumns,
  statusMap,
} from "@/context/latestTable";
import { brandModelLabel, colorLabel, toFa } from "@/context/carLabels";
import { useListings } from "@/hooks/useListings";
import { useSellers } from "@/hooks/useSellers";
import { listingRowToListing } from "@/lib/supabase/listings";
import {
  fetchMarketPriceMap,
  computePriceVsMarket,
} from "@/lib/supabase/marketInsights";
import {
  ArrowLeft,
  BadgeCheck,
  ExternalLink,
  HandCoins,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import LatestTable from "./Table";
import type { LatestRow } from "@/context/latestTable";

export default function TableRender() {
  const { listings: rawListings, loading, error } = useListings();
  const { sellers } = useSellers();
  const [marketMap, setMarketMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!rawListings.length) return;
    fetchMarketPriceMap(rawListings)
      .then(setMarketMap)
      .catch(() => {});
  }, [rawListings]);

  const rows = useMemo<LatestRow[]>(() => {
    const sellersMap = new Map(sellers.map((s) => [s.id, s]));
    const sliced = rawListings.slice(0, 8);
    return sliced
      .map((row) => listingRowToListing(row))
      .map((l) => {
        const key = `${l.brand}|${l.model}|${l.year}`;
        const marketAvg = marketMap.get(key);
        const vs = marketAvg ? computePriceVsMarket(l.price, marketAvg) : 0;
        return {
          id: l.id,
          brand: brandModelLabel(l),
          trim: l.trim,
          year: l.year,
          color: colorLabel(l.color),
          seller: sellersMap.get(l.seller_id ?? "")?.name ?? l.sellerName,
          verified:
            sellersMap.get(l.seller_id ?? "")?.verified ?? l.sellerVerified,
          cost: l.price,
          status: l.status,
          listingType: l.listingType,
          priceVsMarket: vs,
        };
      });
  }, [rawListings, sellers, marketMap]);

  return (
    <div
      className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-14 vazir-matn"
      dir="rtl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label mb-1">بازار زنده</p>
          <h2 className="text-2xl font-700 text-foreground">
            آخرین آگهی‌های صفر کیلومتر
          </h2>
        </div>
        <Link href="/market" className="btn-secondary text-sm">
          مشاهده همه
          <ArrowLeft size={14} />
        </Link>
      </div>

      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 bg-muted rounded-lg w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-lg w-full" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center text-sm text-destructive">
          خطا در دریافت آگهی‌ها: {error}
        </div>
      )}

      {!loading && !error && (
        <LatestTable
          columns={LatestTableColumns}
          data={rows}
          getRowClassName={(row) =>
            row.listingType === "BUY"
              ? "bg-accent/5 border-r-2 border-r-accent/30"
              : ""
          }
          renderMobileRow={(row) => {
            const status = statusMap[row.status];
            const isBuy = row.listingType === "BUY";
            return (
              <div
                key={row.id}
                className={`group rounded-2xl border border-border/70 p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md ${
                  isBuy
                    ? "bg-accent/5 border-accent/20"
                    : "bg-linear-to-br from-background via-background to-muted/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                      style={brandLogoStyle(row.brand)}
                    >
                      {row.brand.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground">
                        {row.brand}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {row.trim}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground">قیمت</div>
                    <div className="text-sm font-semibold tabular-nums">
                      {formatCost(row.cost)}
                    </div>
                    {row.priceVsMarket !== 0 && (
                      <div
                        className={`text-2xs font-600 ${row.priceVsMarket >= 0 ? "text-danger" : "text-success"}`}
                      >
                        {row.priceVsMarket > 0 ? "+" : ""}
                        {row.priceVsMarket}٪{" "}
                        {row.priceVsMarket >= 0 ? "بالاتر" : "پایین‌تر"} از
                        میانگین
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs font-medium inline-flex items-center gap-1 ${
                      isBuy
                        ? "bg-accent/10 text-accent border-accent/25"
                        : "bg-primary/10 text-primary border-primary/25"
                    }`}
                  >
                    {isBuy ? (
                      <HandCoins size={11} />
                    ) : (
                      <ShoppingCart size={11} />
                    )}
                    {isBuy ? "آگهی خرید" : "آگهی فروش"}
                  </Badge>
                  {status && (
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </Badge>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {row.seller}
                    {row.verified && (
                      <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground">سال ساخت</span>
                    <span className="font-medium font-mono">
                      {row.year} / {toFa(row.year - 621)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground">رنگ</span>
                    <span className="font-medium">{row.color}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    شناسه {toFa(row.id)}
                  </span>
                  <Link
                    href={`/market/listings/${row.id}`}
                    className="btn-secondary text-xs px-2.5 py-1.5 inline-flex items-center gap-1.5"
                  >
                    مشاهده
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          }}
        />
      )}
    </div>
  );
}
