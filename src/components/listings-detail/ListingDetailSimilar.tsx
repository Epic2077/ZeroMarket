import Link from "next/link";

import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { formatPrice, listings } from "@/context/data";
import BrandIcon from "../shared/BrandIcon";
import VerifiedBadge from "../shared/VerifiedBadeg";
import StatusBadge from "../shared/StatusBadge";

interface Props {
  currentSeller: string;
}

export default function ListingDetailSimilar({ currentSeller }: Props) {
  const similar = listings
    .filter((l) => l.sellerName !== currentSeller)
    .slice(0, 4);

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-700 text-foreground">
          آگهی‌های مشابه صفرکیلومتر
        </h2>
        <Link
          href={`/market`}
          className="flex items-center gap-1 text-xs font-600 text-primary hover:underline"
        >
          مشاهده همه <ArrowRight size={12} className="rotate-180" />
        </Link>
      </div>

      <div className="flex flex-col gap-0">
        {similar.map((listing) => (
          <Link
            key={`similar-${listing.id}`}
            href={`/market/listings/${listing.id}`}
            className="exchange-row flex items-center gap-3 py-3 px-5  border-b border-border last:border-0 rounded-lg"
          >
            <BrandIcon brand={listing.brand} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-700 text-foreground truncate">
                {listing.brand} {listing.model}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {listing.trim}
                </span>
                <span className="text-2xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {listing.year}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-price text-sm text-foreground">
                {formatPrice(listing.price)}
              </div>
              <div
                className={`text-2xs font-600 flex items-center justify-end gap-0.5 mt-0.5 ${listing.trend7d >= 0 ? "text-success" : "text-danger"}`}
              >
                {listing.trend7d >= 0 ? (
                  <TrendingUp size={9} />
                ) : (
                  <TrendingDown size={9} />
                )}
                {Math.abs(listing.trend7d)}%
              </div>
            </div>
            <div className="flex-shrink-0 hidden sm:flex items-center gap-1.5">
              <StatusBadge status={listing.status} />
              {listing.sellerVerified && <VerifiedBadge size="sm" />}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
