"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import type { Listing } from "@/types/dataTypes";
import { useUserInfo } from "@/context/UserInfoProvider";
import AdminManageButton from "../management/AdminManageButton";
import EditProductButton from "../management/EditProductButton";
import { sellerSlug } from "@/lib/utils";
import BrandIcon from "../shared/BrandIcon";
import StatusBadge from "../shared/StatusBadge";
import VerifiedBadge from "../shared/VerifiedBadeg";
import SaveListingButton from "../shared/SaveListingButton";

import ListingDetailSpecs from "./ListingDetailSpecs";
import ListingDetailSeller from "./ListingDetailSeller";
import ListingDetailPricePanel from "./ListingDetailPricePanel";
import ListingDetailSimilar from "./ListingDetailSimilar";
import ListingDetailRelated from "./ListingDetailRelated";
import ListingAuctionModal from "./ListingAuctionModal";
import ReportListingModal from "./ReportListingModal";

import {
  ChevronRight,
  ArrowLeft,
  Share2,
  Flag,
  Clock,
  MapPin,
  Zap,
  ShieldCheck,
  User,
  NotebookPen,
  HandCoins,
  ShoppingCart,
} from "lucide-react";

interface Props {
  listing: Listing;
}

type RequestStatus =
  | "none"
  | "pending"
  | "approved"
  | "declined"
  | "negotiable";

export default function ListingDetailContent({ listing }: Props) {
  const { user } = useUserInfo();
  const isOwner = Boolean(user?.id && user.id === listing.seller_id);
  const [auctionOpen, setAuctionOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("none");

  // ── Private note (visible to admin, owner, and the seller) ──────────
  // Auth is enforced server-side by the API route; the client always
  // attempts the fetch and shows the note only when the API returns one.
  const [privateNote, setPrivateNote] = useState<string | null>(null);
  const [noteLoading, setNoteLoading] = useState(false);

  const loadPrivateNote = useCallback(async () => {
    if (!listing.id) return;
    setNoteLoading(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}/private-note`);
      if (res.ok) {
        const body = await res.json();
        setPrivateNote(body.note ?? null);
      } else {
        setPrivateNote(null);
      }
    } catch {
      setPrivateNote(null);
    }
    setNoteLoading(false);
  }, [listing.id]);

  useEffect(() => {
    void loadPrivateNote();
  }, [loadPrivateNote]);

  return (
    <>
      <div
        className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-6 vazir-matn mt-20"
        dir="rtl"
      >
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="hover:text-foreground transition-colors duration-150"
          >
            خانه
          </Link>
          <ChevronRight size={12} className="rotate-180" />
          <Link
            href="/listings-marketplace"
            className="hover:text-foreground transition-colors duration-150"
          >
            بازار خودرو
          </Link>
          <ChevronRight size={12} className="rotate-180" />
          <span className="text-foreground font-600">
            {listing.brand} {listing.model} {listing.trim}
          </span>
        </nav>

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <BrandIcon brand={listing.brand} size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-800 text-foreground tracking-tight">
                  {listing.brand} {listing.model}
                </h1>
                <StatusBadge status={listing.status} />
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-600 border ${
                    listing.listingType === "BUY"
                      ? "bg-accent/10 text-accent border-accent/25"
                      : "bg-primary/10 text-primary border-primary/25"
                  }`}
                >
                  {listing.listingType === "BUY" ? (
                    <HandCoins size={12} />
                  ) : (
                    <ShoppingCart size={12} />
                  )}
                  {listing.listingType === "BUY" ? "آگهی خرید" : "آگهی فروش"}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {listing.trim} · {listing.year} · صفرکیلومتر کارخانه
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} />
                  {listing.city}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={12} />
                  ثبت شده {listing.listedDate}
                </div>
                <div className="flex items-center gap-1 text-xs text-success font-600">
                  <Zap size={12} />
                  {listing.deliveryDays === 0
                    ? "موجود — آماده"
                    : `تحویل در ${listing.deliveryDays} روز`}
                </div>
              </div>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2 shrink-0">
            <EditProductButton listing={listing} />
            <AdminManageButton
              userId={`usr-${sellerSlug(listing.sellerName)}`}
            />
            <Link
              href="/listings-marketplace"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors duration-150"
            >
              <ArrowLeft size={13} className="rotate-180" />
              بازگشت
            </Link>
            <SaveListingButton listingId={listing.id} />
            <button
              className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors duration-150"
              title="اشتراک‌گذاری این آگهی"
            >
              <Share2 size={15} />
            </button>
            <button
              className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-danger transition-colors duration-150"
              title="گزارش این آگهی"
              onClick={() => setReportOpen(true)}
            >
              <Flag size={15} />
            </button>
          </div>
        </div>

        {/* Listing type banner — only shown for BUY requests */}
        {listing.listingType === "BUY" && (
          <div className="flex items-center gap-3 mb-5 p-4 bg-accent/8 border border-accent/25 rounded-xl">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
              <HandCoins size={20} className="text-accent" />
            </div>
            <div>
              <div className="text-sm font-700 text-accent">
                آگهی درخواست خرید
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                این آگهی یک درخواست خرید است — شخص به دنبال خرید این خودرو
                می‌باشد. قیمت نمایش‌داده‌شده، قیمت پیشنهادی خریدار است.
              </p>
            </div>
          </div>
        )}

        {/* Trust banner */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-success/5 border border-success/20 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-600 text-success">
            <ShieldCheck size={14} />
            تأیید صفرکیلومتر کارخانه
          </div>
          <div className="w-px h-3 bg-border hidden sm:block" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User size={14} />
            {listing.listingType === "BUY" ? (
              <span>خریدار: {listing.sellerName}</span>
            ) : (
              <span>فروشنده: {listing.sellerName}</span>
            )}
          </div>
          <div className="w-px h-3 bg-border hidden sm:block" />
          {listing.sellerVerified && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <VerifiedBadge size="sm" />
              <span>هویت فروشنده توسط زیرومارکت تأیید شده</span>
            </div>
          )}
          <div className="w-px h-3 bg-border hidden sm:block" />
          <div className="text-xs text-muted-foreground">
            شناسه آگهی:{" "}
            <span className="font-mono font-600 text-foreground">
              {listing.id?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Private note (admin / owner / seller only — enforced server-side) */}
        {!noteLoading && privateNote && (
          <div className="mb-6 p-4 bg-negotiable/5 border border-negotiable/20 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <NotebookPen size={14} className="text-negotiable" />
              <span className="text-xs font-700 text-negotiable">
                یادداشت داخلی فروشنده
              </span>
              <span className="text-2xs text-muted-foreground">
                (فقط برای شما قابل مشاهده است)
              </span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {privateNote}
            </p>
          </div>
        )}
        {noteLoading && (
          <div className="mb-6 p-4 bg-muted/30 border border-border rounded-xl animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
            <div className="h-3 bg-muted rounded w-full" />
          </div>
        )}

        {/* Main 2-col layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left — specs (2/3 width) */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            <ListingDetailSpecs listing={listing} />
            <ListingDetailSimilar
              currentSeller={listing.sellerName}
              currentId={listing.id}
            />
          </div>

          {/* Right — price + seller + action (1/3 width) */}
          <div className="xl:col-span-1 flex flex-col gap-4 ">
            <ListingDetailPricePanel
              listing={listing}
              onRequestAuction={() => setAuctionOpen(true)}
              requestStatus={requestStatus}
              isOwner={isOwner}
            />
            <ListingDetailSeller listing={listing} />
          </div>
        </div>

        {/* Related cars / other sellers of the same model */}
        <ListingDetailRelated listing={listing} />
      </div>
      {/* Auction modal */}
      {auctionOpen && (
        <ListingAuctionModal
          listing={listing}
          onClose={() => setAuctionOpen(false)}
          onStatusChange={(s) => {
            setRequestStatus(s);
            setAuctionOpen(false);
          }}
        />
      )}
      {/* Report modal */}
      {reportOpen && (
        <ReportListingModal
          listing={listing}
          onClose={() => setReportOpen(false)}
        />
      )}
    </>
  );
}
