"use client";

import ListingTable from "@/components/home/Latest/ListingTable";
import { listings } from "@/context/data";
import { activeFilterCount, applyFilters } from "@/context/marketFilters";
import { FilterState } from "@/types/marketplace";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import MarketplaceFilters from "./MarketPlaceFilters";
import MarketplaceSidebar from "./MarketPlaceSidebar";

const defaultFilters: FilterState = {
  search: "",
  brand: "",
  bodyType: "",
  city: "",
  fuelType: "",
  priceMin: "",
  priceMax: "",
  verifiedOnly: false,
  status: "",
  sortBy: "listedDate",
  sortDir: "desc",
};

export default function MarketplaceContent() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => setFilters((prev) => ({ ...prev, [key]: value }));

  const resetFilters = () => setFilters(defaultFilters);

  const filtered = useMemo(() => applyFilters(listings, filters), [filters]);
  const activeCount = activeFilterCount(filters);

  return (
    <section
      className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-6 vazir-matn"
      dir="rtl"
    >
      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-700 text-foreground">
            بازار خودروهای صفرکیلومتر
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length.toLocaleString("fa-IR")} آگهی موجود
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop toggle */}
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            className="hidden xl:flex items-center gap-2 px-3 py-2 text-sm font-600 text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors duration-150"
          >
            <SlidersHorizontal size={15} />
            {sidebarOpen ? "پنهان کردن" : "نمایش"} تحلیل‌ها
          </button>

          {/* Mobile analytics modal trigger */}
          <button
            onClick={() => setAnalyticsOpen(true)}
            className="xl:hidden flex items-center gap-2 px-3 py-2 text-sm font-600 text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors duration-150"
            aria-haspopup="dialog"
            aria-expanded={analyticsOpen}
          >
            <SlidersHorizontal size={15} />
            تحلیل‌ها
          </button>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky-filters -mx-4 lg:-mx-8 xl:-mx-10 px-4 lg:px-8 xl:px-10 py-3 mb-6">
        <MarketplaceFilters
          filters={filters}
          onUpdate={updateFilter}
          onReset={resetFilters}
          activeCount={activeCount}
          totalResults={filtered.length}
        />
      </div>

      {/* Body */}
      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1">
          <ListingTable data={filtered} />
        </div>

        {sidebarOpen && (
          <aside className="hidden xl:block w-72 shrink-0">
            <MarketplaceSidebar listings={filtered} />
          </aside>
        )}
      </div>

      {/* Mobile analytics modal */}
      {analyticsOpen && (
        <div
          className="fixed inset-0 z-70 flex items-end sm:items-center justify-center p-4"
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-label="تحلیل‌های بازار"
        >
          <div
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
            onClick={() => setAnalyticsOpen(false)}
          />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-800 text-foreground">
                  تحلیل‌های بازار
                </h2>
                <p className="text-2xs text-muted-foreground mt-0.5">
                  {filtered.length.toLocaleString("fa-IR")} آگهی در نتایج فعلی
                </p>
              </div>
              <button
                onClick={() => setAnalyticsOpen(false)}
                aria-label="بستن"
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 max-h-[75vh] overflow-auto">
              <MarketplaceSidebar listings={filtered} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
