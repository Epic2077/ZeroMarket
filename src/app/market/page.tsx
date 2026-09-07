import { Suspense } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fetchListings } from "@/lib/supabase/listings";
import { fetchAllTaxonomy } from "@/lib/supabase/taxonomy";
import { listingRowToListing } from "@/lib/supabase/listings";
import {
  fetchMarketPriceMap,
  computePriceVsMarket,
} from "@/lib/supabase/marketInsights";
import { FilterState } from "@/types/marketplace";
import MarketplaceClient from "@/components/market/MarketplaceClient";

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: async () => (await cookies()).getAll(),
      setAll: () => {},
    },
  });
}

// Sort listings
function sortListings(
  listings: any[],
  sortBy: string,
  sortDir: "asc" | "desc",
) {
  const multiplier = sortDir === "asc" ? 1 : -1;
  return [...listings].sort((a, b) => {
    let aVal: any = a[sortBy];
    let bVal: any = b[sortBy];

    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (aVal < bVal) return -1 * multiplier;
    if (aVal > bVal) return 1 * multiplier;
    return 0;
  });
}

interface MarketplaceData {
  listings: any[];
  totalCount: number;
  taxonomy: any;
  filters: FilterState;
  activeCount: number;
}

async function getMarketplaceData(
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>,
): Promise<MarketplaceData> {
  const params = await searchParams;
  const supabase = createSupabaseClient();

  if (!supabase) {
    return {
      listings: [],
      totalCount: 0,
      taxonomy: {},
      filters: {
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
      },
      activeCount: 0,
    };
  }

  // Extract filters from search params
  const filters: FilterState = {
    search: (params.search as string) ?? "",
    brand: (params.brand as string) ?? "",
    bodyType: (params.bodyType as string) ?? "",
    city: (params.city as string) ?? "",
    fuelType: (params.fuelType as string) ?? "",
    priceMin: (params.priceMin as string) ?? "",
    priceMax: (params.priceMax as string) ?? "",
    verifiedOnly: params.verifiedOnly === "true",
    status: (params.status as string) ?? "",
    listingType: (params.listingType as string) ?? "",
    sortBy: (params.sortBy as string) ?? "listedDate",
    sortDir: ((params.sortDir as string) ?? "desc") as "asc" | "desc",
  };

  const statusMap: Record<string, string> = {
    active: "AVAILABLE",
    pending: "WAITING",
    negotiable: "NEGOTIABLE",
    reserved: "RESERVED",
  };
  const listingsFilter: any = {
    status:
      filters.status && statusMap[filters.status]
        ? statusMap[filters.status]
        : ["AVAILABLE", "NEGOTIABLE"],
  };

  if (filters.brand) listingsFilter.brand = filters.brand;
  if (filters.bodyType) listingsFilter.bodyType = filters.bodyType;
  if (filters.city) listingsFilter.city = filters.city;
  if (filters.fuelType) listingsFilter.fuel = filters.fuelType;
  if (filters.listingType) listingsFilter.listingType = filters.listingType;
  if (filters.priceMin) {
    listingsFilter.priceMin = Number(filters.priceMin) * 1_000_000_000;
  }
  if (filters.priceMax) {
    listingsFilter.priceMax = Number(filters.priceMax) * 1_000_000_000;
  }

  const search = filters.search.trim();
  if (filters.verifiedOnly || search) {
    const [verifiedSellers, namedSellers] = await Promise.all([
      filters.verifiedOnly
        ? supabase.from("sellers").select("id").eq("verified", true)
        : Promise.resolve({ data: null, error: null }),
      search
        ? supabase
            .from("sellers")
            .select("id")
            .ilike("full_name", `%${search}%`)
        : Promise.resolve({ data: null, error: null }),
    ]);
    if (verifiedSellers.error) throw verifiedSellers.error;
    if (namedSellers.error) throw namedSellers.error;

    if (filters.verifiedOnly) {
      listingsFilter.sellerIds = (verifiedSellers.data ?? []).map(
        (seller) => seller.id,
      );
    }
    if (search) {
      listingsFilter.search = search;
      listingsFilter.searchSellerIds = (namedSellers.data ?? []).map(
        (seller) => seller.id,
      );
    }
  }

  const [listingsRes, taxonomyRes] = await Promise.all([
    fetchListings(listingsFilter),
    fetchAllTaxonomy(),
  ]);

  // Get market price map for all listings
  const marketMap = await fetchMarketPriceMap(listingsRes);

  // Convert listings with market data
  const allListings = listingsRes.map((row) => {
    const l = listingRowToListing(row);
    const key = `${l.brand}|${l.model}|${l.year}`;
    const marketAvg = marketMap.get(key);
    return {
      ...l,
      priceVsMarket: marketAvg ? computePriceVsMarket(l.price, marketAvg) : 0,
      marketAvgBuy: marketAvg ?? l.price,
      marketAvgSell: marketAvg ?? l.price,
    };
  });

  // Sort
  const sortedListings = sortListings(
    allListings,
    filters.sortBy,
    filters.sortDir,
  );

  // Pagination - first 20
  const paginatedListings = sortedListings.slice(0, 20);
  const totalCount = sortedListings.length;

  // Count active filters
  const activeCount = [
    filters.search.trim(),
    filters.brand,
    filters.bodyType,
    filters.city,
    filters.fuelType,
    filters.status,
    filters.listingType,
    filters.priceMin,
    filters.priceMax,
    filters.verifiedOnly,
  ].filter(Boolean).length;

  // Extract taxonomy options
  const taxonomy = {
    BRAND: taxonomyRes.BRAND?.map((r: any) => r.value) ?? [],
    BODY_TYPE: taxonomyRes.BODY_TYPE?.map((r: any) => r.value) ?? [],
    CITY: taxonomyRes.CITY?.map((r: any) => r.value) ?? [],
    FUEL_TYPE: taxonomyRes.FUEL_TYPE?.map((r: any) => r.value) ?? [],
  };

  return {
    listings: paginatedListings,
    totalCount,
    taxonomy,
    filters,
    activeCount,
  };
}

export default async function ListingMarketplace({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const dataPromise = getMarketplaceData(searchParams);

  return (
    <main className="pt-16">
      <Suspense
        fallback={
          <div className="flex h-20 items-center justify-center">
            در حال بارگذاری…
          </div>
        }
      >
        <MarketplaceServerWrapper dataPromise={dataPromise} />
      </Suspense>
    </main>
  );
}

async function MarketplaceServerWrapper({
  dataPromise,
}: {
  dataPromise: Promise<MarketplaceData>;
}) {
  const initialData = await dataPromise;
  return <MarketplaceClient initialData={initialData} />;
}
