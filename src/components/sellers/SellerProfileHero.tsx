"use client";

import AdminManageButton from "@/components/management/AdminManageButton";
import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import { useBanners } from "@/context/BannerProvider";
import { toFa } from "@/context/carLabels";
import type { SellerSummary } from "@/context/sellers";
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  ListChecks,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";
import Link from "next/link";

interface Props {
  seller: SellerSummary;
}

export default function SellerProfileHero({ seller }: Props) {
  const { getBackground, getAvatarGradient } = useBanners();
  const background = getBackground(seller.slug);
  const avatarGradient = getAvatarGradient(seller.slug);

  const stats = [
    {
      icon: <ListChecks size={15} className="text-primary" />,
      value: toFa(seller.totalListings),
      label: "کل آگهی‌ها",
    },
    {
      icon: <Star size={15} className="text-warning" />,
      value: `${toFa(seller.responseRate)}٪`,
      label: "نرخ پاسخ",
    },
    {
      icon: <Clock size={15} className="text-success" />,
      value: toFa(seller.activeListings),
      label: "آگهی فعال",
    },
    {
      icon: <CalendarClock size={15} className="text-accent" />,
      value: toFa(seller.memberSince),
      label: "عضو از",
    },
  ];

  return (
    <div className="card-elevated overflow-hidden mb-8">
      {/* Banner */}
      <div className="relative h-36 sm:h-44" style={{ background }}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-size-[14px_14px]" />
        {seller.verified && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm">
            <VerifiedBadge size="sm" />
            <span className="text-2xs font-700 text-primary">تأییدشده</span>
          </div>
        )}
      </div>

      <div className="px-6 pb-6 z-10">
        {/* Avatar + identity + actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 ">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-card ring-4 ring-card shrink-0 z-10">
              <div
                className="w-full h-full rounded-2xl flex items-center justify-center text-white font-800 text-2xl"
                style={{ background: avatarGradient }}
              >
                {seller.avatar}
              </div>
            </div>
            <div className="pb-1 z-10 bg-white px-2 rounded-lg">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-800 text-foreground">
                  {seller.name}
                </h1>
                {seller.verified && <VerifiedBadge size="md" />}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {seller.city}
                </span>
                <span>{seller.brands.join(" · ")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
            <AdminManageButton userId={`usr-${seller.slug}`} />
            <Link
              href="/sellers"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors duration-150"
            >
              <ArrowLeft size={13} className="rotate-180" />
              همه فروشندگان
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 bg-muted rounded-xl py-3 px-2"
            >
              {stat.icon}
              <span className="text-base font-800 text-foreground font-mono">
                {stat.value}
              </span>
              <span className="text-2xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Trust banner */}
        {seller.verified && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-success/5 border border-success/20 rounded-xl">
            <ShieldCheck size={15} className="text-success shrink-0" />
            <div>
              <div className="text-xs font-700 text-success">
                فروشنده تأییدشده زیرومارکت
              </div>
              <div className="text-2xs text-muted-foreground">
                هویت احراز شده · آگهی‌ها توسط زیرومارکت بررسی شده‌اند.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
