"use client";

import StatusBadge from "@/components/shared/StatusBadge";
import { formatPrice } from "@/context/data";
import { savedListings } from "@/context/userProfile";
import { BookmarkX, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function SavedListingsTab() {
  const [items, setItems] = useState(savedListings);

  const remove = (id: string, title: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success(`«${title}» از فهرست ذخیره‌شده حذف شد`);
  };

  if (items.length === 0) {
    return (
      <div className="card-elevated flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
          <BookmarkX size={22} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-600 text-foreground">
          هنوز آگهی‌ای ذخیره نکرده‌اید
        </p>
        <Link href="/market" className="btn-primary text-sm">
          مشاهده بازار
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {items.map((item) => (
        <div key={item.id} className="card-elevated card-hover p-5 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-foreground flex items-center justify-center text-white text-xs font-800">
                {item.avatar}
              </div>
              <div>
                <div className="text-sm font-700 text-foreground">
                  {item.title}
                </div>
                <div className="text-xs text-muted-foreground">{item.trim}</div>
              </div>
            </div>
            <StatusBadge status={item.status} />
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin size={13} />
            {item.city}
            <span className="mx-1">·</span>
            ذخیره {item.savedAt}
          </div>

          <div className="text-price text-lg font-700 text-foreground mb-4">
            {formatPrice(item.price)}{" "}
            <span className="text-xs font-500 text-muted-foreground">تومان</span>
          </div>

          <div className="mt-auto flex items-center gap-2">
            <Link
              href={`/market/listings/${item.listingId}`}
              className="btn-primary text-sm flex-1 justify-center"
            >
              مشاهده آگهی
            </Link>
            <button
              onClick={() => remove(item.id, item.title)}
              aria-label="حذف از ذخیره‌شده‌ها"
              title="حذف از ذخیره‌شده‌ها"
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-danger hover:border-danger/40 hover:bg-danger/5 transition-colors duration-150"
            >
              <BookmarkX size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
