"use client";

import { brandModelLabel, colorLabel, toFa } from "@/context/carLabels";
import { formatPrice } from "@/context/data";
import { brandLogoStyle } from "@/context/latestTable";
import { useListings } from "@/hooks/useListings";
import { listingRowToListing } from "@/lib/supabase/listings";
import {
  fetchMarketPriceMap,
  computePriceVsMarket,
} from "@/lib/supabase/marketInsights";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function HeroStatsPanel() {
  const { listings: rawListings } = useListings();
  const [marketMap, setMarketMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (!rawListings.length) return;
    fetchMarketPriceMap(rawListings)
      .then(setMarketMap)
      .catch(() => {});
  }, [rawListings]);

  const recent = useMemo(
    () =>
      rawListings.slice(0, 5).map((row) => {
        const l = listingRowToListing(row);
        const key = `${l.brand}|${l.model}|${l.year}`;
        const marketAvg = marketMap.get(key);
        return {
          ...l,
          priceVsMarket: marketAvg
            ? computePriceVsMarket(l.price, marketAvg)
            : 0,
        };
      }),
    [rawListings, marketMap],
  );

  return (
    <div className="w-full max-w-95 bg-card rounded-2xl shadow-2xl shadow-black/30 ring-1 ring-black/5 overflow-hidden vazir-matn">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-sm font-700 text-foreground">بازار زنده</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono-nums">
          {toFa(rawListings.length)} آگهی فعال
        </span>
      </div>

      {/* Listing rows */}
      <div className="divide-y divide-border">
        {recent.map((l) => (
          <Link
            key={l.id}
            href={`/market/listings/${l.id}`}
            className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors duration-150"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                style={brandLogoStyle(l.brand)}
              >
                {l.brand.slice(0, 3).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-700 text-foreground leading-tight truncate">
                  {brandModelLabel(l)}
                </div>
                <div className="text-2xs text-muted-foreground mt-0.5 truncate">
                  {colorLabel(l.color)} · {l.trim}
                </div>
              </div>
            </div>
            <div className="text-left shrink-0 mr-3">
              <div className="text-sm font-700 font-mono text-foreground">
                {formatPrice(l.price)}
              </div>
              {l.priceVsMarket !== 0 && (
                <div
                  className={`flex items-center justify-end gap-0.5 text-[12px] mt-0.5 font-600 ${l.priceVsMarket >= 0 ? "text-danger" : "text-success"}`}
                >
                  {l.priceVsMarket > 0 ? "+" : ""}
                  {toFa(l.priceVsMarket)}٪{" "}
                  {l.priceVsMarket >= 0
                    ? "بالاتر از میانگین"
                    : "پایین‌تر از میانگین"}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <Link
        href="/market"
        className="flex items-center justify-center gap-1 px-5 py-3 text-sm text-primary hover:bg-primary/5 font-600 transition-colors duration-150 border-t border-border"
      >
        مشاهده همه آگهی‌ها
        <ArrowLeft size={14} />
      </Link>
    </div>
  );
}
