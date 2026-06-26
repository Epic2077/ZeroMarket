import { brandModelLabel, colorLabel, toFa } from "@/context/carLabels";
import { formatPrice, listings } from "@/context/data";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function HeroStatsPanel() {
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
                className="w-9 h-9 rounded-lg flex items-center justify-center text-2xs font-700 text-white shrink-0"
                style={{ backgroundColor: l.colorHex === "#F5F5F0" ? "#1b4fd8" : l.colorHex }}
              >
                {brandModelLabel(l).slice(0, 2)}
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
              <div
                className={`flex items-center justify-end gap-0.5 text-2xs mt-0.5 font-600 ${
                  l.trend7d >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {l.trend7d >= 0 ? (
                  <TrendingUp size={10} />
                ) : (
                  <TrendingDown size={10} />
                )}
                <span className="font-mono">
                  {l.trend7d >= 0 ? "+" : ""}
                  {toFa(l.trend7d.toFixed(1))}٪
                </span>
              </div>
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
