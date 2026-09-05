import { Suspense } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fetchListings } from "@/lib/supabase/listings";
import { fetchSellers } from "@/lib/supabase/sellers";
import { fetchHomepageStats } from "@/lib/supabase/homepageStats";
import { fetchAllTaxonomy } from "@/lib/supabase/taxonomy";
import { listingRowToListing } from "@/lib/supabase/listings";
import { fetchMarketPriceMap, computePriceVsMarket } from "@/lib/supabase/marketInsights";
import { aggregateSellerListingStats, sellerRowToSummary, sellerRowToDisplayFields } from "@/lib/supabase/sellers";
import Hero from "@/components/home/hero/Hero";
import InfoSection from "@/components/home/info/InfoSection";
import TableRender from "@/components/home/Latest/TableRender";
import PriceInsightWidget from "@/components/home/PricingInsight/PricingInsightWidget";
import VerifiedSellers from "@/components/home/verifiedSellers/VerifiedSellers";
import HowItWorks from "@/components/home/howItWorks/HowItWorks";
import HomeCTA from "@/components/home/cta/CTA";
import Reveal from "@/components/shared/Reveal";

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

async function getHomepageData() {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return {
      stats: null,
      latestListings: [],
      verifiedSellers: [],
      taxonomy: { BRAND: [], CITY: [], YEAR: [], MODEL: [], BODY_TYPE: [], FUEL_TYPE: [] },
    };
  }

  const [statsRes, listingsRes, sellersRes, taxonomyRes] = await Promise.all([
    fetchHomepageStats(),
    fetchListings({
      status: ["AVAILABLE", "NEGOTIABLE"],
    }),
    fetchSellers(),
    fetchAllTaxonomy(),
  ]);

  // Get latest 8 listings
  const latestListings = listingsRes.slice(0, 8);

  // Fetch seller data for these listings
  const sellerIds = [...new Set(latestListings.map((l) => l.seller_id))];
  const { data: sellersData } = await supabase
    .from("sellers")
    .select("*")
    .in("id", sellerIds);
  
  // Get seller listing stats for all sellers
  const allListings = await supabase
    .from("listings")
    .select("seller_id, brand, price, status");
  const sellerStatsMap = aggregateSellerListingStats(
    (allListings.data ?? []) as Array<{
      seller_id: string;
      brand: string;
      price: number;
      status: string;
    }>,
  );

  // Create seller display fields map
  const sellerDisplayMap = new Map();
  if (sellersData) {
    for (const seller of sellersData) {
      const stats = sellerStatsMap.get(seller.id);
      sellerDisplayMap.set(seller.id, sellerRowToDisplayFields(seller, stats));
    }
  }

  // Get market price map for latest listings
  const marketMap = await fetchMarketPriceMap(latestListings);

  // Convert listings with market data AND seller data
  const latestListingsWithMarket = latestListings.map((row) => {
    const seller = sellerDisplayMap.get(row.seller_id);
    const l = listingRowToListing(row, seller);
    const key = `${l.brand}|${l.model}|${l.year}`;
    const marketAvg = marketMap.get(key);
    return {
      ...l,
      priceVsMarket: marketAvg ? computePriceVsMarket(l.price, marketAvg) : 0,
    };
  });

  // Get top 4 verified sellers
  const verifiedSellers = sellersRes
    .filter((s) => s.verified)
    .sort((a, b) => b.seller_score - a.seller_score)
    .slice(0, 4)
    .map((seller) =>
      sellerRowToSummary(seller, sellerStatsMap.get(seller.id)),
    );

  // Extract taxonomy options for HeroFilter
  const taxonomy = {
    BRAND: taxonomyRes.BRAND?.map((r: any) => r.value) ?? [],
    CITY: taxonomyRes.CITY?.map((r: any) => r.value) ?? [],
    YEAR: taxonomyRes.YEAR?.map((r: any) => r.value) ?? [],
    MODEL: taxonomyRes.MODEL?.map((r: any) => r.value) ?? [],
    BODY_TYPE: taxonomyRes.BODY_TYPE?.map((r: any) => r.value) ?? [],
    FUEL_TYPE: taxonomyRes.FUEL_TYPE?.map((r: any) => r.value) ?? [],
  };

  return {
    stats: statsRes,
    latestListings: latestListingsWithMarket,
    verifiedSellers,
    taxonomy,
  };
}

export default async function Home() {
  const dataPromise = getHomepageData();

  return (
    <div>
      <main>
        <Suspense fallback={<div className="h-64 animate-pulse bg-muted" />}>
          <Reveal>
            <HomeHero dataPromise={dataPromise} />
          </Reveal>
        </Suspense>

        <Suspense fallback={<div className="h-48 animate-pulse bg-muted" />}>
          <Reveal>
            <HomeInfoSection dataPromise={dataPromise} />
          </Reveal>
        </Suspense>

        <Suspense fallback={<div className="h-96 animate-pulse bg-muted" />}>
          <Reveal>
            <HomeTableRender dataPromise={dataPromise} />
          </Reveal>
        </Suspense>

        <Suspense fallback={<div className="h-96 animate-pulse bg-muted" />}>
          <Reveal>
            <HomePriceInsightWidget dataPromise={dataPromise} />
          </Reveal>
        </Suspense>

        <Suspense fallback={<div className="h-64 animate-pulse bg-muted" />}>
          <HomeVerifiedSellers dataPromise={dataPromise} />
        </Suspense>

        <HowItWorks />

        <Suspense fallback={<div className="h-48 animate-pulse bg-muted" />}>
          <Reveal>
            <HomeCTA />
          </Reveal>
        </Suspense>
      </main>
    </div>
  );
}

// Wrapper components that await the data and pass to client components
async function HomeHero({
  dataPromise,
}: {
  dataPromise: Promise<{
    stats: any;
    latestListings: any[];
    verifiedSellers: any[];
    taxonomy: any;
  }>;
}) {
  const { latestListings, taxonomy } = await dataPromise;
  return <Hero taxonomy={taxonomy} listings={latestListings} />;
}

async function HomeInfoSection({
  dataPromise,
}: {
  dataPromise: Promise<{
    stats: any;
    latestListings: any[];
    verifiedSellers: any[];
    taxonomy: any;
  }>;
}) {
  const { stats } = await dataPromise;
  return <InfoSection stats={stats} />;
}

import type { LatestRow } from "@/context/latestTable";

// ... existing imports

async function HomeTableRender({
  dataPromise,
}: {
  dataPromise: Promise<{
    stats: any;
    latestListings: any[];
    verifiedSellers: any[];
    taxonomy: any;
  }>;
}) {
  const { latestListings } = await dataPromise;
  
  // Map Listing to LatestRow format
  const tableRows: LatestRow[] = latestListings.map((l) => ({
    id: l.id,
    brand: l.brand,
    trim: l.trim,
    year: l.year,
    color: l.color,
    seller: l.sellerName,
    verified: l.sellerVerified,
    cost: l.price,
    status: l.status,
    listingType: l.listingType,
    priceVsMarket: l.priceVsMarket,
  }));
  
  return <TableRender listings={tableRows} />;
}

async function HomePriceInsightWidget({
  dataPromise,
}: {
  dataPromise: Promise<{
    stats: any;
    latestListings: any[];
    verifiedSellers: any[];
    taxonomy: any;
  }>;
}) {
  const { taxonomy } = await dataPromise;
  return <PriceInsightWidget taxonomy={taxonomy} />;
}

async function HomeVerifiedSellers({
  dataPromise,
}: {
  dataPromise: Promise<{
    stats: any;
    latestListings: any[];
    verifiedSellers: any[];
    taxonomy: any;
  }>;
}) {
  const { verifiedSellers } = await dataPromise;
  return <VerifiedSellers sellers={verifiedSellers} />;
}