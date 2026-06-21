import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import { toFa } from "@/context/carLabels";
import type { SellerSummary } from "@/context/sellers";
import { ListChecks, MapPin, Star } from "lucide-react";
import Link from "next/link";

interface Props {
  seller: SellerSummary;
}

export default function SellerCard({ seller }: Props) {
  return (
    <Link
      href={`/sellers/${seller.slug}`}
      className="card-elevated card-hover p-5 flex flex-col h-full"
    >
      {/* Avatar + name */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-800 text-sm shrink-0">
          {seller.avatar}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-700 text-foreground leading-tight truncate">
              {seller.name}
            </span>
            {seller.verified && <VerifiedBadge size="sm" />}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin size={12} />
            {seller.city} · از {seller.memberSince}
          </div>
        </div>
      </div>

      {/* Specialty (distinct brands) */}
      <div className="text-xs text-muted-foreground mb-4 bg-muted rounded-lg px-2.5 py-1.5 truncate">
        {seller.brands.join(" · ")}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <div className="flex items-center gap-1.5">
          <ListChecks size={13} className="text-primary" />
          <div>
            <div className="text-sm font-700 text-foreground">
              {toFa(seller.totalListings)}
            </div>
            <div className="text-2xs text-muted-foreground">آگهی</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Star size={13} className="text-warning" />
          <div>
            <div className="text-sm font-700 text-foreground">
              {toFa(seller.responseRate)}٪
            </div>
            <div className="text-2xs text-muted-foreground">نرخ پاسخ</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
