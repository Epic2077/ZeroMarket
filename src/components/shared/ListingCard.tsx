import {
  bodyTypeLabel,
  brandModelLabel,
  cityLabel,
  sellerLabel,
  toFa,
} from "@/context/carLabels";
import { formatPrice } from "@/context/data";
import type { Listing } from "@/types/dataTypes";
import { Calendar, MapPin, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import VerifiedBadge from "./VerifiedBadeg";
import { useSellers } from "@/hooks/useSellers";

interface Props {
  listing: Listing;
}

// Deterministic hue from the brand so the logo tile is stable across renders
// (mirrors the BrandIcon/table convention, without the table-specific margin).
function brandTileStyle(brand: string) {
  let hash = 0;
  for (let i = 0; i < brand.length; i++) {
    hash = brand.charCodeAt(i) + ((hash << 5) - hash);
  }
  return { backgroundColor: `hsl(${Math.abs(hash) % 360}, 60%, 48%)` };
}

// Compact car card used in the marketplace grids (related listings, seller
// profile). Links through to the listing detail page.
export default function ListingCard({ listing }: Props) {
  const { sellers } = useSellers();
  const sellersMap = new Map(sellers.map((s) => [s.id, s]));

  const trendUp = listing.trend7d >= 0;
  const seller = sellersMap.get(listing.seller_id ?? "");

  return (
    <Link
      href={`/market/listings/${listing.id}`}
      className="card-elevated card-hover p-4 flex flex-col gap-3"
    >
      {/* Header — brand tile, title, status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-800 shrink-0"
            style={brandTileStyle(listing.brand)}
          >
            {listing.brand.slice(0, 3).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-700 text-foreground truncate">
              {brandModelLabel(listing)}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {listing.trim}
            </div>
          </div>
        </div>
        <StatusBadge status={listing.status} />
      </div>

      {/* Spec chips */}
      <div className="flex items-center gap-2 flex-wrap text-2xs text-muted-foreground">
        <span className="flex items-center gap-1 bg-muted rounded-md px-2 py-1">
          <Calendar size={11} />
          {toFa(listing.year)}
        </span>
        <span className="flex items-center gap-1 bg-muted rounded-md px-2 py-1">
          <MapPin size={11} />
          {cityLabel(listing.city)}
        </span>
        <span className="bg-muted rounded-md px-2 py-1">
          {bodyTypeLabel(listing.bodyType)}
        </span>
      </div>

      {/* Price + 7-day trend */}
      <div className="flex items-end justify-between mt-auto pt-1">
        <div>
          <div className="text-price text-base text-foreground">
            {formatPrice(listing.price)}
          </div>
          <div className="text-2xs text-muted-foreground">تومان</div>
        </div>
        <div
          className={`flex items-center gap-0.5 text-2xs font-600 ${trendUp ? "text-success" : "text-danger"}`}
        >
          {trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {toFa(Math.abs(listing.trend7d))}٪
        </div>
      </div>

      {/* Seller footer */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-border text-xs text-muted-foreground">
        <span className="truncate">
          {sellerLabel(seller?.name ?? listing.sellerName)}
        </span>
        {listing.sellerVerified && <VerifiedBadge size="sm" />}
      </div>
    </Link>
  );
}
