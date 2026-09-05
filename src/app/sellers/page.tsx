import { Suspense } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { fetchSellers } from "@/lib/supabase/sellers";
import { aggregateSellerListingStats, sellerRowToSummary } from "@/lib/supabase/sellers";
import SellersClient from "@/components/sellers/SellersClient";
import type { SellerSummary } from "@/types/dataTypes";

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

interface SellersData {
  sellers: SellerSummary[];
  totalSellers: number;
  verifiedCount: number;
  totalListings: number;
  avgResponse: number;
}

async function getSellersData(searchParams: Promise<{ [key: string]: string | string[] | undefined }>): Promise<SellersData> {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return {
      sellers: [],
      totalSellers: 0,
      verifiedCount: 0,
      totalListings: 0,
      avgResponse: 0,
    };
  }

  const [sellersRes, allListingsRes] = await Promise.all([
    fetchSellers(),
    supabase.from("listings").select("seller_id, brand, price, status"),
  ]);

  const sellerStatsMap = aggregateSellerListingStats(
    (allListingsRes.data ?? []) as Array<{
      seller_id: string;
      brand: string;
      price: number;
      status: string;
    }>,
  );

  const sellers = sellersRes.map((seller) =>
    sellerRowToSummary(seller, sellerStatsMap.get(seller.id)),
  );

  const totalSellers = sellers.length;
  const verifiedCount = sellers.filter((s) => s.verified).length;
  const totalListings = sellers.reduce((sum, s) => sum + s.totalListings, 0);
  const avgResponse = Math.round(
    sellers.reduce((sum, s) => sum + s.responseRate, 0) / (sellers.length || 1),
  );

  return {
    sellers,
    totalSellers,
    verifiedCount,
    totalListings,
    avgResponse,
  };
}

export default async function SellersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const dataPromise = getSellersData(searchParams);

  return (
    <main className="pt-16" dir="rtl">
      <Suspense fallback={<div className="flex h-20 items-center justify-center">در حال بارگذاری…</div>}>
        <SellersServerWrapper dataPromise={dataPromise} />
      </Suspense>
    </main>
  );
}

async function SellersServerWrapper({
  dataPromise,
}: {
  dataPromise: Promise<SellersData>;
}) {
  const data = await dataPromise;
  return <SellersClient initialData={data} />;
}