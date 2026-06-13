"use client";
import { useState } from "react";
import Link from "next/link";

import type { Listing } from "@/types/dataTypes";
import BrandIcon from "../shared/BrandIcon";
import StatusBadge from "../shared/StatusBadge";
import VerifiedBadge from "../shared/VerifiedBadeg";

import ListingDetailSpecs from "./ListingDetailSpecs";
import ListingDetailSeller from "./ListingDetailSeller";
import ListingDetailPricePanel from "./ListingDetailPricePanel";
import ListingDetailSimilar from "./ListingDetailSimilar";
import ListingAuctionModal from "./ListingAuctionModal";

import {
  ChevronRight,
  ArrowLeft,
  Share2,
  Heart,
  Flag,
  Clock,
  MapPin,
  Zap,
  ShieldCheck,
  User,
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
  const [auctionOpen, setAuctionOpen] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("none");
  const [saved, setSaved] = useState(false);

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
            <Link
              href="/listings-marketplace"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-600 text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors duration-150"
            >
              <ArrowLeft size={13} className="rotate-180" />
              بازگشت
            </Link>
            <button
              onClick={() => setSaved(!saved)}
              className={`p-2 rounded-lg border transition-colors duration-150 ${saved ? "border-danger/30 bg-danger/8 text-danger" : "border-border text-muted-foreground hover:bg-muted"}`}
              title={saved ? "حذف از ذخیره‌شده‌ها" : "ذخیره این آگهی"}
            >
              <Heart size={15} fill={saved ? "currentColor" : "none"} />
            </button>
            <button
              className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors duration-150"
              title="اشتراک‌گذاری این آگهی"
            >
              <Share2 size={15} />
            </button>
            <button
              className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-danger transition-colors duration-150"
              title="گزارش این آگهی"
            >
              <Flag size={15} />
            </button>
          </div>
        </div>

        {/* Trust banner */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-success/5 border border-success/20 rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-600 text-success">
            <ShieldCheck size={14} />
            تأیید صفرکیلومتر کارخانه
          </div>
          <div className="w-px h-3 bg-border hidden sm:block" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User size={14} />
            <span>فروشنده: {listing.sellerName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <VerifiedBadge size="sm" />
            <span>هویت فروشنده توسط زیرومارکت تأیید شده</span>
          </div>
          <div className="w-px h-3 bg-border hidden sm:block" />
          <div className="text-xs text-muted-foreground">
            شناسه آگهی:{" "}
            <span className="font-mono font-600 text-foreground">
              {listing.id?.toUpperCase()}
            </span>
          </div>
        </div>

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
          <div className="xl:col-span-1 flex flex-col gap-4">
            <ListingDetailPricePanel
              listing={listing}
              onRequestAuction={() => setAuctionOpen(true)}
              requestStatus={requestStatus}
            />
            <ListingDetailSeller listing={listing} />
          </div>
        </div>
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
    </>
  );
}
