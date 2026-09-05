"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { FilterState } from "@/types/marketplace";
import { MarketplaceContentWithData } from "@/components/market/MarketplaceContent";

interface MarketplaceData {
  listings: any[];
  totalCount: number;
  taxonomy: any;
  filters: FilterState;
  activeCount: number;
}

interface MarketplaceClientProps {
  initialData: MarketplaceData;
}

export default function MarketplaceClient({ initialData }: MarketplaceClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize client-side filters from searchParams
  const [filters, setFilters] = useState<FilterState>(() => ({
    search: searchParams.get("search") ?? "",
    brand: searchParams.get("brand") ?? "",
    bodyType: searchParams.get("bodyType") ?? "",
    city: searchParams.get("city") ?? "",
    fuelType: searchParams.get("fuelType") ?? "",
    priceMin: searchParams.get("priceMin") ?? "",
    priceMax: searchParams.get("priceMax") ?? "",
    verifiedOnly: searchParams.get("verifiedOnly") === "true",
    status: searchParams.get("status") ?? "",
    listingType: searchParams.get("listingType") ?? "",
    sortBy: searchParams.get("sortBy") ?? "listedDate",
    sortDir: (searchParams.get("sortDir") as "asc" | "desc") ?? "desc",
  }));

  // Data state - initially from server, then updated on filter change
  const [data, setData] = useState<MarketplaceData>(initialData);

  // Debounced URL update
  const updateUrl = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== "" && value !== false) {
          if (key === "sortBy" && value === "listedDate") return;
          if (key === "sortDir" && value === "desc") return;
          params.set(key, String(value));
        }
      });
      const query = params.toString();
      router.replace(query ? `/market?${query}` : "/market", { scroll: false });
    },
    [router],
  );

  // Sync local state to URL (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateUrl(filters);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filters, updateUrl]);

  // Handle filter updates from MarketplaceFilters
  const handleFilterChange = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      brand: "",
      bodyType: "",
      city: "",
      fuelType: "",
      priceMin: "",
      priceMax: "",
      verifiedOnly: false,
      status: "",
      listingType: "",
      sortBy: "listedDate",
      sortDir: "desc",
    });
  };

  return (
    <MarketplaceContentWithData
      data={data}
      filters={filters}
      onUpdate={handleFilterChange}
      onReset={handleReset}
    />
  );
}