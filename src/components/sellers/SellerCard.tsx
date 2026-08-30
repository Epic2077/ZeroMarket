"use client";

import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import { useBanners } from "@/context/BannerProvider";
import { toFa } from "@/context/carLabels";
import { formatPrice } from "@/context/data";
import type { SellerSummary } from "@/types/dataTypes";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import Link from "next/link";

interface Props {
  seller: SellerSummary;
}

export default function SellerCard({ seller }: Props) {
  const { getBackground, getAvatarGradient } = useBanners();
  const cover = getBackground(seller.slug);
  const avatarGradient = getAvatarGradient(seller.slug);
  const visibleBrands = seller.brands.slice(0, 3);
  const extraBrands = seller.brands.length - visibleBrands.length;

  return (
    <Link
      href={`/sellers/${seller.id}`}
      className="group card-elevated card-hover overflow-hidden flex flex-col h-full"
    >
      {/* Cover */}
      <div className="relative h-20" style={{ background: cover }}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[12px_12px]" />
        {seller.verified && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm">
            <VerifiedBadge size="sm" />
            <span className="text-2xs font-700 text-primary">تأییدشده</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-5 pb-5 flex flex-col flex-1">
        {/* Avatar overlapping the cover */}
        <div className="flex items-end gap-3 -mt-7 mb-3 z-10">
          <div className="w-14 h-14 rounded-xl bg-card ring-4 ring-card flex items-center justify-center shrink-0">
            <div
              className="w-full h-full rounded-xl flex items-center justify-center text-white font-800 text-base"
              style={{ background: avatarGradient }}
            >
              {seller.avatar_path ?? seller.avatar}
            </div>
          </div>
        </div>

        <h3 className="text-base font-700 text-foreground leading-tight truncate">
          {seller.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <MapPin size={12} />
          {seller.city} · عضو از {toFa(seller.memberSince)}
        </div>

        {/* Brand chips */}
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {visibleBrands.map((brand) => (
            <span
              key={brand}
              className="text-2xs font-600 text-secondary-foreground bg-muted rounded-md px-2 py-0.5"
            >
              {brand}
            </span>
          ))}
          {extraBrands > 0 && (
            <span className="text-2xs font-600 text-muted-foreground px-1 py-0.5">
              +{toFa(extraBrands)}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-4" />

        {/* Stats row */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="text-2xs text-muted-foreground">شروع قیمت از</div>
            <div className="text-sm font-700 font-mono text-foreground">
              {formatPrice(seller.minPrice)}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm font-700 text-foreground">
                {toFa(seller.totalListings)}
              </div>
              <div className="text-2xs text-muted-foreground">آگهی</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5 text-sm font-700 text-foreground">
                <Star size={11} className="text-warning fill-warning" />
                {toFa(seller.responseRate)}٪
              </div>
              <div className="text-2xs text-muted-foreground">پاسخ</div>
            </div>
          </div>
        </div>

        {/* Hover CTA */}
        <div className="flex items-center justify-center gap-1 mt-4 text-xs font-600 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          مشاهده نمایشگاه
          <ArrowLeft
            size={13}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
        </div>
      </div>
    </Link>
  );
}
