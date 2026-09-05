"use client";

import Reveal from "@/components/shared/Reveal";
import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import { ListChecks, Star } from "lucide-react";
import Link from "next/link";
import { toFa } from "@/context/carLabels";

interface SellerSummary {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  avatar_path: string | null;
  city: string;
  verified: boolean;
  responseRate: number;
  memberSince: string;
  activeListings: number;
  totalListings: number;
  totalSoldCount: number;
  sellerScore: number;
  brands: string[];
  listings: any[];
  minPrice: number;
}

interface VerifiedSellersProps {
  sellers: SellerSummary[];
}

const TOP_COUNT = 4;

/** Deterministic hue → color from a string (matches brandLogoStyle logic). */
function sellerColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 55%, 45%)`;
}

export default function VerifiedSellers({ sellers }: VerifiedSellersProps) {
  const top = sellers.slice(0, TOP_COUNT);

  return (
    <section
      id="sellers"
      className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-14 vazir-matn"
      dir="rtl"
    >
      <Reveal>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="section-label mb-1">شبکه اعتماد</p>
            <h2 className="text-2xl font-700 text-foreground">
              فروشندگان برتر تأییدشده
            </h2>
          </div>
          <Link href="/sellers" className="btn-secondary text-sm">
            مشاهده همه فروشندگان
          </Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {top.map((seller, i) => (
          <Reveal key={seller.id} delay={i * 0.08}>
            <Link
              href={`/sellers/${seller.slug}`}
              className="card-elevated card-hover p-5 cursor-pointer h-full block"
            >
              {/* Avatar + name */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-800 text-sm shrink-0"
                  style={{ backgroundColor: sellerColor(seller.id) }}
                >
                  {seller.avatar_path ?? seller.name.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-700 text-foreground leading-tight">
                      {seller.name}
                    </span>
                    <VerifiedBadge size="sm" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {seller.city} · از {seller.memberSince}
                  </div>
                </div>
              </div>

              {/* Specialty */}
              <div className="text-xs text-muted-foreground mb-3 bg-muted rounded-lg px-2.5 py-1.5 truncate">
                {seller.brands.join(" · ") || "برندهای متنوع"}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <ListChecks size={13} className="text-primary" />
                  <div>
                    <div className="text-sm font-700 text-foreground">
                      {toFa(seller.activeListings)}
                    </div>
                    <div className="text-2xs text-muted-foreground">
                      آگهی فعال
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={13} className="text-warning" />
                  <div>
                    <div className="text-sm font-700 text-foreground">
                      {seller.responseRate}٪
                    </div>
                    <div className="text-2xs text-muted-foreground">
                      نرخ پاسخ
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
        {top.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            فروشنده تأییدشده‌ای یافت نشد
          </div>
        )}
      </div>
    </section>
  );
}