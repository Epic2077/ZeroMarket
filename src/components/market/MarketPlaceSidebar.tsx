"use client";

import { formatPrice } from "@/context/data";
import { brandFa } from "@/context/marketFilters";
import type { Listing } from "@/types/dataTypes";
import { BarChart2, Star, TrendingDown, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";

const BrandVolumeChart = dynamic(() => import("./BrandVolumeChart"), {
  ssr: false,
});

interface Props {
  listings: Listing[];
}

const toFa = (value: number) => value.toLocaleString("fa-IR");

export default function MarketplaceSidebar({ listings }: Props) {
  const count = listings.length;
  const prices = listings.map((l) => l.price);
  const avgPrice = count ? prices.reduce((s, p) => s + p, 0) / count : 0;
  const maxPrice = count ? Math.max(...prices) : 0;
  const minPrice = count ? Math.min(...prices) : 0;
  const verifiedCount = listings.filter((l) => l.sellerVerified).length;

  const topTrending = [...listings]
    .sort((a, b) => b.trend7d - a.trend7d)
    .slice(0, 3);

  const summary = [
    {
      label: "میانگین قیمت",
      value: formatPrice(avgPrice),
      sub: "تومان",
      icon: <BarChart2 size={13} className="text-primary" />,
    },
    {
      label: "محدوده قیمت",
      value: `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`,
      sub: "تومان",
      icon: <TrendingUp size={13} className="text-success" />,
    },
    {
      label: "فروشندگان تأییدشده",
      value: `${toFa(verifiedCount)}/${toFa(count)}`,
      sub: "آگهی",
      icon: <Star size={13} className="text-warning" />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Market summary */}
      <div className="card-elevated p-4">
        <p className="section-label mb-3">خلاصه بازار</p>
        <div className="flex flex-col gap-2.5">
          {summary.map((item) => (
            <div
              key={`sidebar-${item.label}`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-1.5">
                {item.icon}
                <span className="text-xs text-muted-foreground">
                  {item.label}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-700 text-foreground">
                  {item.value}
                </span>
                <span className="text-2xs text-muted-foreground ml-1">
                  {item.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand distribution chart */}
      <div className="card-elevated p-4">
        <p className="section-label mb-3">آگهی‌ها بر اساس برند</p>
        <BrandVolumeChart />
      </div>

      {/* Trending models */}
      <div className="card-elevated p-4">
        <p className="section-label mb-3">مدل‌های پرطرفدار</p>
        <div className="flex flex-col gap-2">
          {topTrending.map((listing) => {
            const positive = listing.trend7d >= 0;
            return (
              <div
                key={`trending-${listing.id}`}
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
                  className={`flex items-center gap-0.5 text-xs font-700 ${positive ? "text-success" : "text-danger"}`}
                >
                  {positive ? (
                    <TrendingUp size={11} />
                  ) : (
                    <TrendingDown size={11} />
                  )}
                  {positive ? "+" : ""}
                  {toFa(listing.trend7d)}٪
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price insight CTA */}
      <div className="rounded-xl bg-primary p-4 text-white">
        <p className="text-xs font-700 mb-1">هوش کامل قیمت‌گذاری</p>
        <p className="text-2xs text-white/70 mb-3 leading-relaxed">
          تاریخچه ۳۰ روزه، نمودارهای مقایسه مدل‌ها و خروجی — به نسخه ویژه ارتقا
          دهید.
        </p>
        <button className="w-full py-2 bg-white text-primary text-xs font-700 rounded-lg hover:bg-white/90 transition-colors duration-150">
          مشاهده پلن‌های قیمت‌گذاری
        </button>
      </div>
    </div>
  );
}
