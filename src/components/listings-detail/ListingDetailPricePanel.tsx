"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";

import {
  Send,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Info,
  Lock,
  Zap,
} from "lucide-react";
import { formatPrice } from "@/context/data";
import { Listing } from "@/types/dataTypes";
import StatusBadge from "../shared/StatusBadge";

const DetailPriceTrendChart = dynamic(() => import("./DetailPriceTrending"), {
  ssr: false,
});

interface Props {
  listing: Listing;
  onRequestAuction: () => void;
  requestStatus: "none" | "pending" | "approved" | "declined" | "negotiable";
}

const requestStatusConfig = {
  none: null,
  pending: {
    label: "درخواست در انتظار",
    className: "status-pending",
    desc: "در انتظار پاسخ فروشنده — معمولاً ظرف ۲۴ ساعت.",
  },
  approved: {
    label: "درخواست تأیید شد",
    className: "status-active",
    desc: "فروشنده درخواست شما را تأیید کرد. برای خرید اقدام کنید.",
  },
  declined: {
    label: "درخواست رد شد",
    className: "status-sold",
    desc: "فروشنده این درخواست را رد کرد. می‌توانید آگهی‌های مشابه را مرور کنید.",
  },
  negotiable: {
    label: "قابل مذاکره",
    className: "status-negotiable",
    desc: "فروشنده می‌خواهد مذاکره کند. اطلاعات تماس: ۰۹۱۲ ۳۴۵ ۶۷۸۹",
  },
};

export default function ListingDetailPricePanel({
  listing,
  onRequestAuction,
  requestStatus,
}: Props) {
  const [insightExpanded, setInsightExpanded] = useState(false);

  const priceAboveAvg = listing.price > listing.marketAvgBuy;
  const pctDiff = Math.abs(listing.priceVsMarket);
  const statusInfo = requestStatusConfig[requestStatus];

  return (
    <div className="card-elevated p-5 flex flex-col gap-4 sticky top-24">
      {/* Price */}
      <div>
        <p className="section-label mb-1">قیمت آگهی</p>
        <div className="text-price text-3xl text-foreground">
          {formatPrice(listing.price)}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          تومان · صفرکیلومتر کارخانه
        </div>
      </div>

      {/* Market comparison */}
      <div className="bg-muted/50 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-600 text-muted-foreground">
            در مقابل میانگین بازار
          </span>
          <span
            className={`text-xs font-700 flex items-center gap-0.5 ${priceAboveAvg ? "text-danger" : "text-success"}`}
          >
            {priceAboveAvg ? (
              <TrendingUp size={11} />
            ) : (
              <TrendingDown size={11} />
            )}
            {pctDiff}٪ {priceAboveAvg ? "بالاتر از" : "پایین‌تر از"} میانگین
          </span>
        </div>

        {/* Range bar */}
        <div className="relative h-2 bg-border rounded-full mb-2 overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-success to-warning"
            style={{ width: "100%", opacity: 0.3 }}
          />
          {/* Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-white shadow"
            style={{
              left: `${Math.min(95, Math.max(5, ((listing.price - listing.marketAvgBuy) / (listing.marketAvgSell - listing.marketAvgBuy)) * 100))}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        <div className="flex justify-between text-2xs text-muted-foreground font-mono">
          <span>میانگین خرید: {formatPrice(listing.marketAvgBuy)}</span>
          <span>میانگین فروش: {formatPrice(listing.marketAvgSell)}</span>
        </div>
      </div>

      {/* 7d trend toggle */}
      <div>
        <button
          onClick={() => setInsightExpanded(!insightExpanded)}
          className="w-full flex items-center justify-between text-xs font-600 text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-primary" />
            روند قیمت ۷ روزه
            <span
              className={`font-700 ${listing.trend7d >= 0 ? "text-success" : "text-danger"}`}
            >
              {listing.trend7d > 0 ? "+" : ""}
              {listing.trend7d}٪
            </span>
          </div>
          {insightExpanded ? (
            <ChevronUp size={13} />
          ) : (
            <ChevronDown size={13} />
          )}
        </button>

        {insightExpanded && (
          <div className="mt-3 animate-fade-in">
            <DetailPriceTrendChart />
            <div className="flex items-center gap-1.5 mt-2 p-2 bg-warning/8 border border-warning/20 rounded-lg">
              <Lock size={11} className="text-warning flex-shrink-0" />
              <span className="text-2xs text-warning font-600">
                تاریخچه ۳۰ روزه با نسخه ویژه در دسترس است
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Request status chip */}
      {statusInfo && (
        <div
          className={`rounded-xl p-3 flex flex-col gap-1 ${
            requestStatus === "approved"
              ? "bg-success/8 border border-success/20"
              : requestStatus === "declined"
                ? "bg-danger/8 border border-danger/20"
                : requestStatus === "negotiable"
                  ? "bg-negotiable/8 border border-negotiable/20"
                  : "bg-warning/8 border border-warning/20"
          }`}
        >
          <span className={statusInfo.className}>{statusInfo.label}</span>
          <p className="text-xs text-muted-foreground mt-1">
            {statusInfo.desc}
          </p>
        </div>
      )}

      {/* CTA */}
      {requestStatus === "none" && listing.status === "active" && (
        <button
          onClick={onRequestAuction}
          className="btn-primary w-full justify-center py-3 text-sm"
        >
          <Send size={15} />
          ارسال درخواست خرید
        </button>
      )}

      {listing.status !== "active" && requestStatus === "none" && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-xl text-xs text-muted-foreground">
          <Info size={13} className="flex-shrink-0" />
          این آگهی در حال حاضر <StatusBadge status={listing.status} /> است —
          درخواست‌ها متوقف شده‌اند.
        </div>
      )}

      {requestStatus !== "none" &&
        requestStatus !== "approved" &&
        requestStatus !== "negotiable" && (
          <button
            onClick={onRequestAuction}
            className="btn-secondary w-full justify-center text-sm"
          >
            ارسال درخواست جدید
          </button>
        )}

      {/* Delivery note */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
        <Zap size={12} className="text-success flex-shrink-0" />
        {listing.deliveryDays === 0
          ? "موجود — آماده تحویل فوری"
          : `تحویل تخمینی: ${listing.deliveryDays} روز کاری پس از تأیید`}
      </div>
    </div>
  );
}
