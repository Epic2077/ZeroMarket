"use client";

import { brandFa } from "@/context/marketFilters";
import { toFa } from "@/context/carLabels";
import type { Listing } from "@/types/dataTypes";
import {
  BarChart2,
  Star,
  TrendingDown,
  TrendingUp,
  Clock,
  MessageSquare,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import MarketplaceSummary from "./MarketplaceSummary";

const BrandVolumeChart = dynamic(() => import("./BrandVolumeChart"), {
  ssr: false,
});

interface Props {
  listings: Listing[];
}

function formatFaPrice(price: number): string {
  if (price >= 1_000_000_000) {
    return `${toFa((price / 1_000_000_000).toFixed(2))} میلیارد`;
  }
  if (price >= 1_000_000) {
    return `${toFa(Math.round(price / 1_000_000))} میلیون`;
  }
  return toFa(price);
}

export default function MarketplaceSidebar({ listings }: Props) {
  const count = listings.length;

  const analytics = useMemo(() => {
    if (!count) return null;
    const prices = listings.map((l) => l.price);
    const avgPrice = prices.reduce((s, p) => s + p, 0) / count;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const verifiedCount = listings.filter((l) => l.sellerVerified).length;
    const negotiableCount = listings.filter(
      (l) => l.status === "negotiable",
    ).length;
    const activeCount = listings.filter((l) => l.status === "active").length;
    const avgDelivery = Math.round(
      listings.reduce((s, l) => s + l.deliveryDays, 0) / count,
    );

    // Top trending by priceVsMarket magnitude (biggest movers)
    const topByMarketMove = [...listings]
      .filter((l) => l.priceVsMarket !== 0)
      .sort((a, b) => Math.abs(b.priceVsMarket) - Math.abs(a.priceVsMarket))
      .slice(0, 3);

    return {
      avgPrice,
      maxPrice,
      minPrice,
      verifiedCount,
      negotiableCount,
      activeCount,
      avgDelivery,
      topByMarketMove,
    };
  }, [listings, count]);

  if (!analytics) return null;

  const summary = [
    {
      label: "میانگین قیمت",
      value: formatFaPrice(analytics.avgPrice),
      sub: "تومان",
      icon: <BarChart2 size={13} className="text-primary" />,
    },
    {
      label: "محدوده قیمت",
      value: `${formatFaPrice(analytics.minPrice)} – ${formatFaPrice(analytics.maxPrice)}`,
      sub: "تومان",
      icon: <TrendingUp size={13} className="text-success" />,
    },
    {
      label: "آگهی‌های فعال",
      value: `${toFa(analytics.activeCount)}/${toFa(count)}`,
      sub: `میانگین تحویل ${toFa(analytics.avgDelivery)} روز`,
      icon: <Clock size={13} className="text-accent" />,
    },
    // {
    //   label: "قابل مذاکره",
    //   value: toFa(analytics.negotiableCount),
    //   sub: `${toFa(analytics.verifiedCount)} فروشنده تأییدشده`,
    //   icon: <MessageSquare size={13} className="text-negotiable" />,
    // },
  ];

  return (
    <div className="flex flex-col gap-4">
      <MarketplaceSummary summary={summary} />

      <div className="card-elevated p-4">
        <p className="section-label mb-3">آگهی‌ها بر اساس برند</p>
        <BrandVolumeChart listings={listings} />
      </div>

      <div className="card-elevated p-4">
        <p className="section-label mb-3">بیشترین تغییر قیمت</p>
        <div className="flex flex-col gap-2">
          {analytics.topByMarketMove.map((listing) => {
            const positive = listing.priceVsMarket >= 0;
            return (
              <div
                key={`move-${listing.id}`}
                className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
              >
                <div>
                  <div className="text-xs font-700 text-foreground">
                    {brandFa[listing.brand] ?? listing.brand} {listing.model}
                  </div>
                  <div className="text-2xs text-muted-foreground">
                    {listing.trim}
                  </div>
                </div>
                <div
                  className={`flex items-center gap-0.5 text-xs font-700 ${positive ? "text-danger" : "text-success"}`}
                >
                  {positive ? (
                    <TrendingUp size={11} />
                  ) : (
                    <TrendingDown size={11} />
                  )}
                  {positive ? "+" : ""}
                  {toFa(listing.priceVsMarket)}٪
                </div>
              </div>
            );
          })}
          {analytics.topByMarketMove.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              داده‌ای موجود نیست
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
