"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toFa } from "@/context/carLabels";
import { sellers } from "@/context/sellers";
import { BadgeCheck, ListChecks, Search, Store, TrendingUp, X } from "lucide-react";
import { useMemo, useState } from "react";
import SellerCard from "./SellerCard";

type SortKey = "featured" | "listings" | "response";

const SORT_LABELS: Record<SortKey, string> = {
  featured: "پیشنهادی",
  listings: "بیشترین آگهی",
  response: "بیشترین نرخ پاسخ",
};

// Page-level aggregates for the header band.
const TOTAL_SELLERS = sellers.length;
const VERIFIED_COUNT = sellers.filter((s) => s.verified).length;
const TOTAL_LISTINGS = sellers.reduce((sum, s) => sum + s.totalListings, 0);
const AVG_RESPONSE = Math.round(
  sellers.reduce((sum, s) => sum + s.responseRate, 0) / (sellers.length || 1),
);

export default function SellersDirectory() {
  const [query, setQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = sellers.filter((seller) => {
      if (verifiedOnly && !seller.verified) return false;
      if (!q) return true;
      return (
        seller.name.toLowerCase().includes(q) ||
        seller.nameEn.toLowerCase().includes(q) ||
        seller.city.toLowerCase().includes(q) ||
        seller.brands.some((brand) => brand.toLowerCase().includes(q))
      );
    });

    if (sort === "listings") {
      return [...result].sort((a, b) => b.totalListings - a.totalListings);
    }
    if (sort === "response") {
      return [...result].sort((a, b) => b.responseRate - a.responseRate);
    }
    return result; // already verified-first then by listings from the data layer
  }, [query, verifiedOnly, sort]);

  return (
    <div>
      {/* Header band */}
      <div className="relative overflow-hidden bg-linear-to-br from-accent via-primary to-[#0a1c44]">
        <div className="absolute inset-0 pointer-events-none select-none">
          <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="sellers-dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sellers-dots)" />
          </svg>
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-accent/30 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-4">
            <Store size={13} className="text-white" />
            <span className="text-xs font-600 text-white/90">شبکه فروشندگان زیرومارکت</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-800 text-white leading-tight">
            نمایشگاه‌های تأییدشده خودروی صفر کیلومتر
          </h1>
          <p className="text-sm lg:text-base text-white/65 mt-3 max-w-2xl leading-relaxed">
            فروشندگان حرفه‌ای با سابقه‌ی روشن، نرخ پاسخ‌گویی بالا و آگهی‌های
            ساختارمند را پیدا کنید — و مستقیم با نمایشگاه معتبر معامله کنید.
          </p>

          {/* Aggregate stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-3xl">
            {[
              { icon: <Store size={16} />, value: toFa(TOTAL_SELLERS), label: "فروشنده فعال" },
              { icon: <BadgeCheck size={16} />, value: toFa(VERIFIED_COUNT), label: "تأییدشده" },
              { icon: <ListChecks size={16} />, value: toFa(TOTAL_LISTINGS), label: "آگهی فعال" },
              { icon: <TrendingUp size={16} />, value: `${toFa(AVG_RESPONSE)}٪`, label: "میانگین پاسخ" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-1.5 text-white/70 mb-1.5">{stat.icon}</div>
                <div className="text-xl font-800 text-white font-mono-nums">{stat.value}</div>
                <div className="text-2xs text-white/55 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls + results */}
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
        {/* Search + filter + sort */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-8">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جست‌وجوی فروشنده، شهر یا برند…"
              className="w-full h-10 rounded-xl border border-border bg-card pr-10 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="پاک کردن جست‌وجو"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <button
            onClick={() => setVerifiedOnly((v) => !v)}
            className={`h-10 px-4 rounded-xl border text-sm font-600 transition-colors duration-150 shrink-0 ${
              verifiedOnly
                ? "border-primary bg-primary/8 text-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            فقط تأییدشده‌ها
          </button>
          <Select dir="rtl" value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-10 w-full lg:w-48 vazir-matn shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {SORT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="text-xs text-muted-foreground mb-4">
          {toFa(filtered.length)} فروشنده
        </div>

        {filtered.length === 0 ? (
          <div className="card-elevated flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Search size={22} className="text-muted-foreground" />
            <p className="text-sm font-600 text-foreground">فروشنده‌ای یافت نشد</p>
            <p className="text-xs text-muted-foreground">
              عبارت جست‌وجو یا فیلتر را تغییر دهید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((seller) => (
              <SellerCard key={seller.slug} seller={seller} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
