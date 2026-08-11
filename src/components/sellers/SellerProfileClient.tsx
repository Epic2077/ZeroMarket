"use client";

import ListingCard from "@/components/shared/ListingCard";
import SellerProfileHero from "@/components/sellers/SellerProfileHero";
import { toFa } from "@/context/carLabels";
import { useSeller } from "@/hooks/useSellers";
import { useSellerListings } from "@/hooks/useListings";
import { listingRowToListing } from "@/lib/supabase/listings";
import { ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface Props {
  sellerId: string;
}

export default function SellerProfileClient({ sellerId }: Props) {
  const {
    seller,
    loading: sellerLoading,
    error: sellerError,
  } = useSeller(sellerId);
  const {
    listings: rawListings,
    loading: listingsLoading,
    error: listingsError,
  } = useSellerListings(sellerId);

  const listings = useMemo(
    () => rawListings.map((listing) => listingRowToListing(listing)),
    [rawListings],
  );

  const loading = sellerLoading || listingsLoading;
  const error = sellerError || listingsError;

  // ── Loading ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24">
        <Loader2 size={24} className="animate-spin text-primary" />
        <span className="text-sm text-muted-foreground vazir-matn">
          در حال بارگذاری…
        </span>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-16">
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-8 text-center vazir-matn">
          <p className="text-sm text-danger mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary text-xs"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────
  if (!seller) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-16">
        <div className="rounded-xl border border-dashed border-border p-8 text-center vazir-matn">
          <p className="text-sm text-muted-foreground">فروشنده یافت نشد</p>
        </div>
      </div>
    );
  }

  const summary = seller.summary;

  return (
    <div
      className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8 vazir-matn"
      dir="rtl"
    >
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-foreground transition-colors">
          خانه
        </Link>
        <ChevronRight size={12} className="rotate-180" />
        <Link
          href="/sellers"
          className="hover:text-foreground transition-colors"
        >
          فروشندگان
        </Link>
        <ChevronRight size={12} className="rotate-180" />
        <span className="text-foreground font-600">{summary.name}</span>
      </nav>

      {/* Header with banner */}
      <SellerProfileHero seller={summary} />

      {/* Listings */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-800 text-foreground">
          آگهی‌های این فروشنده
        </h2>
        <span className="text-sm text-muted-foreground">
          ({toFa(listings.length)})
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
