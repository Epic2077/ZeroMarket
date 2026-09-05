"use client";

import ListingTable from "@/components/home/Latest/ListingTable";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import MarketplaceFilters from "./MarketPlaceFilters";
import MarketplaceSidebar from "./MarketPlaceSidebar";
import { FilterState } from "@/types/marketplace";
import { SelectOption } from "@/context/marketFilters";

interface MarketplaceData {
  listings: any[];
  totalCount: number;
  taxonomy: any;
  filters: FilterState;
  activeCount: number;
}

interface MarketplaceContentProps {
  filters: FilterState;
  onUpdate: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onReset: () => void;
}

export default function MarketplaceContent({
  filters,
  onUpdate,
  onReset,
}: MarketplaceContentProps) {
  // This component is a placeholder - the actual content is rendered by MarketplaceContentWithData
  // which receives data as props from the server component wrapper
  return null;
}

// The actual content component that receives data from server
interface MarketplaceContentDataProps extends MarketplaceContentProps {
  data: MarketplaceData;
}

export function MarketplaceContentWithData({
  data,
  filters,
  onUpdate,
  onReset,
}: MarketplaceContentDataProps) {
  const { listings, totalCount, taxonomy, activeCount } = data;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // Taxonomy-driven filter options
  const brandOptions: SelectOption[] = (taxonomy.BRAND ?? []).map((v: string) => ({ value: v, label: v }));
  const bodyTypeOptions: SelectOption[] = (taxonomy.BODY_TYPE ?? []).map((v: string) => ({ value: v, label: v }));
  const cityOptions: SelectOption[] = (taxonomy.CITY ?? []).map((v: string) => ({ value: v, label: v }));
  const fuelTypeOptions: SelectOption[] = (taxonomy.FUEL_TYPE ?? []).map((v: string) => ({ value: v, label: v }));

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
            {totalCount.toLocaleString("fa-IR")} آگهی موجود
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
            className="xl:hidden mb-5 flex items-center gap-2 px-3 py-2 text-sm font-600 text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors duration-150"
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
          onUpdate={onUpdate}
          onReset={onReset}
          activeCount={activeCount}
          totalResults={totalCount}
          brandOptions={brandOptions}
          bodyTypeOptions={bodyTypeOptions}
          cityOptions={cityOptions}
          fuelTypeOptions={fuelTypeOptions}
        />
      </div>

      {/* Body */}
      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1">
          <ListingTable data={listings} />
        </div>

        {sidebarOpen && (
          <aside className="hidden xl:block w-72 shrink-0">
            <MarketplaceSidebar listings={listings} />
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
                  {totalCount.toLocaleString("fa-IR")} آگهی در نتایج فعلی
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
              <MarketplaceSidebar listings={listings} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}