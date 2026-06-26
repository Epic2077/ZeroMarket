import ListingCard from "@/components/shared/ListingCard";
import SellerProfileHero from "@/components/sellers/SellerProfileHero";
import { toFa } from "@/context/carLabels";
import type { SellerSummary } from "@/context/sellers";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Props {
  seller: SellerSummary;
}

export default function SellerProfile({ seller }: Props) {
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
        <Link href="/sellers" className="hover:text-foreground transition-colors">
          فروشندگان
        </Link>
        <ChevronRight size={12} className="rotate-180" />
        <span className="text-foreground font-600">{seller.name}</span>
      </nav>

      {/* Header with banner */}
      <SellerProfileHero seller={seller} />

      {/* Listings */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-800 text-foreground">آگهی‌های این فروشنده</h2>
        <span className="text-sm text-muted-foreground">
          ({toFa(seller.totalListings)})
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {seller.listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
