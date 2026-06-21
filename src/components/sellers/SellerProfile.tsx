import ListingCard from "@/components/shared/ListingCard";
import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import { toFa } from "@/context/carLabels";
import type { SellerSummary } from "@/context/sellers";
import {
  ArrowLeft,
  CalendarClock,
  ChevronRight,
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

export default function SellerProfile({ seller }: Props) {
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
        <span className="text-foreground font-600">{seller.name}</span>
      </nav>

      {/* Header */}
      <div className="card-elevated p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white font-800 text-xl shrink-0">
              {seller.avatar}
            </div>
            <div>
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

          <Link
            href="/sellers"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors duration-150 self-start"
          >
            <ArrowLeft size={13} className="rotate-180" />
            همه فروشندگان
          </Link>
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

      {/* Listings */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-800 text-foreground">
          آگهی‌های این فروشنده
        </h2>
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
