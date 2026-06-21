"use client";

import { sellers } from "@/context/sellers";
import { Search, Store, X } from "lucide-react";
import { useMemo, useState } from "react";
import SellerCard from "./SellerCard";

export default function SellersDirectory() {
  const [query, setQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sellers.filter((seller) => {
      if (verifiedOnly && !seller.verified) return false;
      if (!q) return true;
      // Match Persian name, latin name, city, or any specialty brand.
      return (
        seller.name.toLowerCase().includes(q) ||
        seller.nameEn.toLowerCase().includes(q) ||
        seller.city.toLowerCase().includes(q) ||
        seller.brands.some((brand) => brand.toLowerCase().includes(q))
      );
    });
  }, [query, verifiedOnly]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      {/* Heading */}
      <div className="flex items-center gap-2 mb-1">
        <Store size={20} className="text-primary" />
        <h1 className="text-2xl font-800 text-foreground">فروشندگان زیرومارکت</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        نمایشگاه‌ها و فروشندگان تأییدشده خودروی صفر کیلومتر را مرور کنید.
      </p>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
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
      </div>

      {/* Results */}
      <div className="text-xs text-muted-foreground mb-4">
        {filtered.length.toLocaleString("fa-IR")} فروشنده
      </div>

      {filtered.length === 0 ? (
        <div className="card-elevated flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Search size={22} className="text-muted-foreground" />
          <p className="text-sm font-600 text-foreground">
            فروشنده‌ای یافت نشد
          </p>
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
  );
}
