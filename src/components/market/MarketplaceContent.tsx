"use client";

import ListingTable from "@/components/home/Latest/ListingTable";
import { listings } from "@/context/data";
import { activeFilterCount, applyFilters } from "@/context/marketFilters";
import { FilterState } from "@/types/marketplace";
import { SlidersHorizontal } from "lucide-react";
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
        <button
          onClick={() => setSidebarOpen((open) => !open)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-600 text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors duration-150"
        >
          <SlidersHorizontal size={15} />
          {sidebarOpen ? "پنهان کردن" : "نمایش"} تحلیل‌ها
        </button>
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
    </section>
  );
}
