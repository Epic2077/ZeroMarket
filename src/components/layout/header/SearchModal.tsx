"use client";

import {
  brandModelLabel,
  cityLabel,
  sellerLabel,
  toFa,
} from "@/context/carLabels";
import { formatPrice, listings } from "@/context/data";
import { sellers } from "@/context/sellers";
import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import StatusBadge from "@/components/shared/StatusBadge";
import { Car, Search, Store, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface Props {
  onClose: () => void;
}

const CAR_LIMIT = 6;
const SELLER_LIMIT = 4;

export default function SearchModal({ onClose }: Props) {
  const [query, setQuery] = useState("");

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();

  const carResults = useMemo(() => {
    if (!q) return [];
    return listings
      .filter((l) => {
        const haystack = [
          brandModelLabel(l),
          l.brand,
          l.model,
          l.trim,
          cityLabel(l.city),
          sellerLabel(l.sellerName),
          String(l.year),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, CAR_LIMIT);
  }, [q]);

  const sellerResults = useMemo(() => {
    if (!q) return [];
    return sellers
      .filter((s) =>
        [s.name, s.nameEn, s.city, ...s.brands]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, SELLER_LIMIT);
  }, [q]);

  const hasResults = carResults.length > 0 || sellerResults.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 vazir-matn"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="جست‌وجو"
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
          <Search size={18} className="text-muted-foreground shrink-0" />
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جست‌وجوی خودرو یا فروشنده…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="بستن"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150 shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto px-2 py-2">
          {!q ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              نام خودرو، برند یا فروشنده را وارد کنید.
            </p>
          ) : !hasResults ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              نتیجه‌ای برای «{query}» یافت نشد.
            </p>
          ) : (
            <>
              {carResults.length > 0 && (
                <section className="mb-1">
                  <h3 className="flex items-center gap-1.5 px-3 py-2 text-2xs font-700 text-muted-foreground">
                    <Car size={12} />
                    خودروها
                  </h3>
                  {carResults.map((l) => (
                    <Link
                      key={`car-${l.id}`}
                      href={`/market/listings/${l.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors duration-150"
                    >
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-2xs font-800 text-foreground shrink-0">
                        {l.brand.slice(0, 3).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-600 text-foreground truncate">
                          {brandModelLabel(l)}{" "}
                          <span className="text-muted-foreground font-400">
                            {l.trim}
                          </span>
                        </div>
                        <div className="text-2xs text-muted-foreground">
                          {toFa(l.year)} · {cityLabel(l.city)} ·{" "}
                          {sellerLabel(l.sellerName)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={l.status} />
                        <span className="text-price text-xs text-foreground hidden sm:inline">
                          {formatPrice(l.price)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </section>
              )}

              {sellerResults.length > 0 && (
                <section>
                  <h3 className="flex items-center gap-1.5 px-3 py-2 text-2xs font-700 text-muted-foreground">
                    <Store size={12} />
                    فروشندگان
                  </h3>
                  {sellerResults.map((s) => (
                    <Link
                      key={`seller-${s.slug}`}
                      href={`/sellers/${s.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors duration-150"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-2xs font-800 text-white shrink-0">
                        {s.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-600 text-foreground truncate">
                            {s.name}
                          </span>
                          {s.verified && <VerifiedBadge size="sm" />}
                        </div>
                        <div className="text-2xs text-muted-foreground truncate">
                          {s.city} · {toFa(s.totalListings)} آگهی
                        </div>
                      </div>
                    </Link>
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
