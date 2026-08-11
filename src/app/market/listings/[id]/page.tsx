import ListingDetailContent from "@/components/listings-detail/ListingDetailContent";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  getMarketInsight,
  listingRowToListing,
  type ListingRow,
} from "@/lib/supabase/listings";
import {
  aggregateSellerListingStats,
  sellerRowToDisplayFields,
  type SellerRow,
} from "@/lib/supabase/sellers";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SinglePage({ params }: PageProps) {
  const { id } = await params;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: () => {},
      },
    },
  );

  // Fetch listing
  const { data: listingData, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (listingError || !listingData) notFound();

  const listingRow = listingData as ListingRow;

  // Fetch seller + market insights + seller listing stats in parallel
  const [sellerRes, market] = await Promise.all([
    supabase
      .from("sellers")
      .select("*")
      .eq("id", listingRow.seller_id)
      .single(),
    getMarketInsight(
      supabase,
      listingRow.brand,
      listingRow.model,
      listingRow.year,
      listingRow.price,
    ),
  ]);

  const { data: sellerListings } = await supabase
    .from("listings")
    .select("seller_id, brand, price, status")
    .eq("seller_id", listingRow.seller_id);

  const sellerStats = aggregateSellerListingStats(
    (sellerListings ?? []) as Array<{
      seller_id: string;
      brand: string;
      price: number;
      status: string;
    }>,
  ).get(listingRow.seller_id);

  const seller = sellerRes.data
    ? sellerRowToDisplayFields(sellerRes.data as SellerRow, sellerStats)
    : undefined;

  const listing = listingRowToListing(listingRow, seller, market ?? undefined);

  return (
    <main>
      <ListingDetailContent listing={listing} />
    </main>
  );
}
