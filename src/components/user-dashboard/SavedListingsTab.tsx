"use client";

import ListingCard from "@/components/shared/ListingCard";
import { useUserInfo } from "@/context/UserInfoProvider";
import { fetchWishlistListings } from "@/lib/supabase/wishlist";
import { listingRowToListing } from "@/lib/supabase/listings";
import type { Listing } from "@/types/dataTypes";
import { AlertTriangle, BookmarkX, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function SavedListingsTab() {
  const { user, loading: authLoading } = useUserInfo();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      if (!authLoading) {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchWishlistListings(user.id);
      setItems(rows.map((row) => listingRowToListing(row)));
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      setError(
        err instanceof Error ? err.message : "خطا در دریافت آگهی‌های ذخیره‌شده",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16">
        <Loader2 size={18} className="animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">در حال بارگذاری…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-elevated flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center">
          <AlertTriangle size={22} className="text-danger" />
        </div>
        <p className="text-sm font-600 text-foreground">
          خطا در بارگذاری آگهی‌ها
        </p>
        <p className="text-xs text-muted-foreground max-w-xs">{error}</p>
        <button onClick={() => void load()} className="btn-secondary text-sm">
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card-elevated flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
          <BookmarkX size={22} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-600 text-foreground">
          برای مشاهده آگهی‌های ذخیره‌شده وارد شوید
        </p>
        <Link href="/auth/login" className="btn-primary text-sm">
          ورود به حساب
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card-elevated flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
          <BookmarkX size={22} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-600 text-foreground">
          هنوز آگهی‌ای ذخیره نکرده‌اید
        </p>
        <p className="text-xs text-muted-foreground">
          خودروهای موردعلاقه‌تان را با قلب ذخیره کنید تا اینجا ببینید.
        </p>
        <Link href="/market" className="btn-primary text-sm">
          مشاهده بازار
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {items.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
