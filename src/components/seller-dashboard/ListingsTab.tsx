"use client";

import LatestTable from "@/components/home/Latest/Table";
import { useUserInfo } from "@/context/UserInfoProvider";
import { useSellerListings } from "@/hooks/useListings";
import {
  listingRowToListing,
  softDeleteListing,
} from "@/lib/supabase/listings";
import type { Listing } from "@/types/dataTypes";
import {
  fetchSellerRequests,
  type BuyRequestRow,
} from "@/lib/supabase/buyRequests";
import { getSellerListingColumns } from "@/context/sellerListings";
import ConfirmDialog from "@/components/management/ConfirmDialog";
import { toast } from "sonner";
import { Handshake, Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import OffersTable from "./OffersTable";

const faNum = (n: number) => n.toLocaleString("fa-IR");

export default function ListingsTab() {
  const { profile } = useUserInfo();
  const sellerId = profile?.id ?? "";

  const { listings: rawListings, loading: listingsLoading } =
    useSellerListings(sellerId);

  const [requests, setRequests] = useState<BuyRequestRow[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async (listing: Listing) => {
    setDeleting(true);
    const { error } = await softDeleteListing(listing.id);
    setDeleting(false);
    setDeleteTarget(null);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("آگهی با موفقیت حذف شد");
    // Refresh by reloading the page (simplest approach for now)
    window.location.reload();
  }, []);

  const listings = useMemo(
    () => rawListings.map((row) => listingRowToListing(row)),
    [rawListings],
  );

  // Group requests by listing_id for the sub-row panels
  const requestsByListing = useMemo(() => {
    const map = new Map<string, BuyRequestRow[]>();
    for (const r of requests) {
      const group = map.get(r.listing_id) ?? [];
      group.push(r);
      map.set(r.listing_id, group);
    }
    return map;
  }, [requests]);

  const loadRequests = useCallback(async () => {
    if (!sellerId) return;
    setRequestsLoading(true);
    try {
      setRequests(await fetchSellerRequests(sellerId));
    } catch {
      // silently ignore
    } finally {
      setRequestsLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const loading = listingsLoading || requestsLoading;

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div dir="rtl" className="flex items-center justify-center gap-2 py-16">
        <Loader2 size={18} className="animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">در حال بارگذاری…</span>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────
  if (listings.length === 0) {
    return (
      <div dir="rtl" className="text-center py-16">
        <p className="text-sm text-muted-foreground mb-4">
          هنوز آگهی ثبت نکرده‌اید
        </p>
        <Link
          href={`/dashboard/manage/products/new?owner=${sellerId}`}
          className="btn-primary text-xs inline-flex"
        >
          <PlusCircle size={13} />
          ثبت اولین آگهی
        </Link>
      </div>
    );
  }
  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-700 text-foreground">
          آگهی‌های فعال من ({faNum(listings.length)})
        </h2>
        <Link
          href={`/dashboard/manage/products/new?owner=${sellerId}`}
          className="btn-primary text-xs inline-flex"
        >
          <PlusCircle size={13} />
          آگهی جدید
        </Link>
      </div>

      <LatestTable
        columns={getSellerListingColumns(setDeleteTarget)}
        data={listings}
        renderSubRow={(listing) => {
          const listingRequests = requestsByListing.get(listing.id) ?? [];
          return (
            <div className="bg-muted/20 px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                  <Handshake size={13} className="text-primary" />
                </span>
                <h3 className="text-sm font-700 text-foreground">
                  پیشنهاد ({faNum(listingRequests.length)})
                </h3>
              </div>
              {listingRequests.length > 0 ? (
                <OffersTable requests={listingRequests} />
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  هنوز پیشنهادی برای این آگهی دریافت نشده
                </p>
              )}
            </div>
          );
        }}
      />

      {deleteTarget && (
        <ConfirmDialog
          title="حذف آگهی"
          description={`آیا از حذف «${deleteTarget.brand} ${deleteTarget.model}» اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
          confirmLabel={deleting ? "در حال حذف…" : "حذف"}
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
