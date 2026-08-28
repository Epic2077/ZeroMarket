"use client";

import {
  brandModelLabel,
  cityLabel,
  sellerLabel,
  toFa,
} from "@/context/carLabels";
import { formatPrice } from "@/context/data";
import { useListings } from "@/hooks/useListings";
import { useSellers } from "@/hooks/useSellers";
import { listingRowToListing } from "@/lib/supabase/listings";
import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  bodyTypeOptions,
  brandOptions,
  cityOptions,
  fuelTypeOptions,
  statusOptions,
  brandFa,
  bodyTypeFa,
  cityFa,
  fuelTypeFa,
  type SelectOption,
} from "@/context/marketFilters";
import {
  Car,
  Search,
  Store,
  X,
  Sliders,
  Shield,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface Props {
  onClose: () => void;
}

const CAR_LIMIT = 6;
const SELLER_LIMIT = 4;

const fieldClass =
  "h-8 rounded-lg border border-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/30";

const SelectField = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${fieldClass} appearance-none pl-3 pr-7 py-1.5 font-500 text-foreground cursor-pointer min-w-[110px] text-right`}
      dir="rtl"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={`opt-${placeholder}-${o.value}`} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={11}
      className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
    />
  </div>
);

export default function SearchModal({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  // ── Supabase data ──────────────────────────────────────────────────
  const { listings: rawListings, loading: listingsLoading } = useListings();
  const { sellers, loading: sellersLoading } = useSellers();
  const loading = listingsLoading || sellersLoading;

  const allListings = useMemo(
    () => rawListings.map((row) => listingRowToListing(row)),
    [rawListings],
  );

  // Filters State
  const [brand, setBrand] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [city, setCity] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [status, setStatus] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const BILLION = 1_000_000_000;
  const min = parseFloat(priceMin);
  const max = parseFloat(priceMax);

  const activeFilterCount = useMemo(() => {
    return [
      brand,
      bodyType,
      city,
      fuelType,
      status,
      priceMin,
      priceMax,
      verifiedOnly,
    ].filter(Boolean).length;
  }, [
    brand,
    bodyType,
    city,
    fuelType,
    status,
    priceMin,
    priceMax,
    verifiedOnly,
  ]);

  const handleReset = () => {
    setBrand("");
    setBodyType("");
    setCity("");
    setFuelType("");
    setStatus("");
    setPriceMin("");
    setPriceMax("");
    setVerifiedOnly(false);
  };

  const hasActiveFilter = useMemo(() => {
    return !!(
      q ||
      brand ||
      bodyType ||
      city ||
      fuelType ||
      status ||
      priceMin ||
      priceMax ||
      verifiedOnly
    );
  }, [
    q,
    brand,
    bodyType,
    city,
    fuelType,
    status,
    priceMin,
    priceMax,
    verifiedOnly,
  ]);

  const carResults = useMemo(() => {
    if (!hasActiveFilter) return [];
    return allListings
      .filter((l) => {
        if (q) {
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
          if (!haystack.includes(q)) return false;
        }

        if (brand && brandFa[l.brand] !== brand) return false;
        if (bodyType && bodyTypeFa[l.bodyType] !== bodyType) return false;
        if (city && cityFa[l.city] !== city) return false;
        if (fuelType && fuelTypeFa[l.fuelType] !== fuelType) return false;
        if (status && l.status !== status) return false;
        if (verifiedOnly && !l.sellerVerified) return false;
        if (!Number.isNaN(min) && l.price < min * BILLION) return false;
        if (!Number.isNaN(max) && l.price > max * BILLION) return false;

        return true;
      })
      .slice(0, CAR_LIMIT);
  }, [
    allListings,
    hasActiveFilter,
    q,
    brand,
    bodyType,
    city,
    fuelType,
    status,
    verifiedOnly,
    min,
    max,
  ]);

  const sellerResults = useMemo(() => {
    if (!hasActiveFilter) return [];
    return sellers
      .filter((s) => {
        if (q) {
          const match = [s.name, s.nameEn, s.city, ...s.brands]
            .join(" ")
            .toLowerCase()
            .includes(q);
          if (!match) return false;
        }
        if (brand && !s.brands.includes(brand)) return false;
        if (city && s.city !== city) return false;
        if (verifiedOnly && !s.verified) return false;
        return true;
      })
      .slice(0, SELLER_LIMIT);
  }, [sellers, hasActiveFilter, q, brand, city, verifiedOnly]);

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
          { }
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جست‌وجوی خودرو یا فروشنده…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 transition-colors duration-150 shrink-0 ${
              showFilters
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Sliders size={14} />
            فیلترها
            {activeFilterCount > 0 && (
              <span className="bg-primary text-white text-[10px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-mono font-700">
                {toFa(activeFilterCount)}
              </span>
            )}
          </button>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150 shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Filters drawer/panel */}
        {showFilters && (
          <div className="px-5 py-3 border-b border-border bg-muted/20 flex flex-wrap items-center gap-2 max-h-[160px] overflow-y-auto shrink-0 select-none">
            <SelectField
              value={brand}
              onChange={setBrand}
              options={brandOptions}
              placeholder="برند"
            />
            <SelectField
              value={bodyType}
              onChange={setBodyType}
              options={bodyTypeOptions}
              placeholder="نوع بدنه"
            />
            <SelectField
              value={city}
              onChange={setCity}
              options={cityOptions}
              placeholder="شهر"
            />
            <SelectField
              value={fuelType}
              onChange={setFuelType}
              options={fuelTypeOptions}
              placeholder="نوع سوخت"
            />
            <SelectField
              value={status}
              onChange={setStatus}
              options={statusOptions}
              placeholder="وضعیت"
            />

            {/* Price range */}
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="حداقل (میلیارد)"
                className={`${fieldClass} w-50 px-2 py-1 font-mono text-center`}
              />
              <span className="text-xs text-muted-foreground">–</span>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="حداکثر (میلیارد)"
                className={`${fieldClass} w-50 px-2 py-1 font-mono text-center`}
              />
            </div>

            {/* Verified toggle */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center gap-1.5 h-8 px-2.5 text-xs font-500 rounded-lg border transition-colors duration-150 ${
                verifiedOnly
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield size={12} />
              فقط تأییدشده
            </button>

            {/* Reset button */}
            {activeFilterCount > 0 && (
              <button
                onClick={handleReset}
                className="text-xs text-danger font-600 hover:underline flex items-center gap-0.5 ml-auto"
              >
                <X size={12} />
                حذف فیلترها
              </button>
            )}
          </div>
        )}

        {/* Results */}
        <div className="overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10">
              <Loader2 size={18} className="animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                در حال بارگذاری…
              </span>
            </div>
          ) : !hasActiveFilter ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              نام خودرو، برند یا فروشنده را وارد کنید یا فیلترها را اعمال کنید.
            </p>
          ) : !hasResults ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              {q
                ? `نتیجه‌ای برای «${query}» یافت نشد.`
                : "هیچ نتیجه‌ای با فیلترهای انتخابی یافت نشد."}
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
                        {s.avatar_path || s.name.slice(0, 1)}
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
