"use client";

import { TrendingUp, TrendingDown, Zap, BarChart3 } from "lucide-react";
import { toFa } from "@/context/carLabels";

export interface MarketOverviewItem {
  brand: string;
  model: string;
  avgPrice: number;
  trend7d: number;
  activeListings: number;
}

interface Props {
  overview: {
    gainers: MarketOverviewItem[];
    droppers: MarketOverviewItem[];
    mostActive: MarketOverviewItem[];
  } | null;
  loading: boolean;
}

export default function MarketOverviewSection({ overview, loading }: Props) {
  return (
    <section className="mb-10">
      <h2 className="flex items-center gap-2 text-lg font-700 text-foreground mb-4">
        <BarChart3 size={18} className="text-primary" />
        نمای بازار
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : overview ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-elevated p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-700 text-success mb-3">
              <TrendingUp size={14} />
              بیشترین رشد ۷ روزه
            </h3>
            <div className="space-y-2">
              {overview.gainers.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-600 text-foreground truncate">
                    {item.brand} {item.model}
                  </span>
                  <span className="font-mono text-success font-700">
                    +{toFa(item.trend7d)}٪
                  </span>
                </div>
              ))}
              {overview.gainers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  داده‌ای موجود نیست
                </p>
              )}
            </div>
          </div>

          <div className="card-elevated p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-700 text-danger mb-3">
              <TrendingDown size={14} />
              بیشترین کاهش ۷ روزه
            </h3>
            <div className="space-y-2">
              {overview.droppers.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-600 text-foreground truncate">
                    {item.brand} {item.model}
                  </span>
                  <span className="font-mono text-danger font-700">
                    {toFa(item.trend7d)}٪
                  </span>
                </div>
              ))}
              {overview.droppers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  داده‌ای موجود نیست
                </p>
              )}
            </div>
          </div>

          <div className="card-elevated p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-700 text-primary mb-3">
              <Zap size={14} />
              فعال‌ترین بازارها
            </h3>
            <div className="space-y-2">
              {overview.mostActive.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-600 text-foreground truncate">
                    {item.brand} {item.model}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {toFa(item.activeListings)} آگهی
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
