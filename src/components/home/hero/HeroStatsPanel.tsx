"use client";

import { brandModelLabel, colorLabel, toFa } from "@/context/carLabels";
import { formatPrice } from "@/context/data";
import { brandLogoStyle } from "@/context/latestTable";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ListingWithMarket {
  id: string;
  brand: string;
  model: string;
  trim: string;
  year: number;
  color: string;
  colorHex: string;
  engine: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
  city: string;
  deliveryDays: number;
  sellerName: string;
  sellerVerified: boolean;
  sellerResponseRate: number;
  sellerMemberSince: string;
  sellerActiveListings: number;
  sellerAvatar: string | null;
  price: number;
  priceUnit: string;
  status: string;
  listedDate: string;
  factoryOptions: string[];
  marketAvgBuy: number;
  marketAvgSell: number;
  priceVsMarket: number;
  trend7d: number;
  listingType: "SELL" | "BUY";
  deletedAt: string | null;
}

interface HeroStatsPanelProps {
  listings: ListingWithMarket[];
}

export default function HeroStatsPanel({ listings }: HeroStatsPanelProps) {
  const recent = listings.slice(0, 5);

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
          {toFa(listings.length)} آگهی فعال
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