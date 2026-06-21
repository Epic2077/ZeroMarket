import {
  MessageSquare,
  Star,
  ListChecks,
  Clock,
  ExternalLink,
} from "lucide-react";
import VerifiedBadge from "../shared/VerifiedBadeg";
import { Listing } from "@/types/dataTypes";

interface Props {
  listing: Listing;
}

export default function ListingDetailSeller({ listing }: Props) {
  return (
    <div className="card-elevated p-5">
      <p className="section-label mb-3">پروفایل فروشنده</p>

      {/* Avatar + name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-800 text-sm shrink-0 bg-primary">
          {listing.sellerAvatar}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-700 text-foreground">
              {listing.sellerName}
            </span>
            {listing.sellerVerified && <VerifiedBadge size="md" />}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            عضو از {listing.sellerMemberSince} · {listing.city}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          {
            icon: <Star size={13} className="text-warning" />,
            value: `${listing.sellerResponseRate}٪`,
            label: "پاسخ",
          },
          {
            icon: <ListChecks size={13} className="text-primary" />,
            value: String(listing.sellerActiveListings),
            label: "آگهی",
          },
          {
            icon: <Clock size={13} className="text-success" />,
            value: "< ۴ ساعت",
            label: "میانگین پاسخ",
          },
        ].map((stat) => (
          <div
            key={`seller-stat-${stat.label}`}
            className="flex flex-col items-center gap-1 bg-muted rounded-xl py-2.5 px-2"
          >
            {stat.icon}
            <span className="text-sm font-700 text-foreground font-mono">
              {stat.value}
            </span>
            <span className="text-2xs text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Trust indicators */}
      {listing.sellerVerified && (
        <div className="flex items-center gap-2 p-2.5 bg-success/8 border border-success/20 rounded-xl mb-4">
          <VerifiedBadge size="sm" />
          <div>
            <div className="text-xs font-700 text-success">
              فروشنده تأییدشده
            </div>
            <div className="text-2xs text-muted-foreground">
              هویت تأیید شده · آگهی‌ها توسط زیرومارکت بررسی شده
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-600 text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors duration-150">
          <MessageSquare size={13} />
          پیام
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-600 text-primary bg-primary/8 border border-primary/20 rounded-lg hover:bg-primary/15 transition-colors duration-150">
          <ExternalLink size={13} />
          مشاهده پروفایل
        </button>
      </div>
    </div>
  );
}
