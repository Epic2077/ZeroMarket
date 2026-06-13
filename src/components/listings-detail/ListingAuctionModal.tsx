"use client";
import React, { useState } from "react";

import {
  X,
  Send,
  CheckCircle,
  XCircle,
  MessageSquare,
  Loader2,
  Info,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { Listing } from "@/types/dataTypes";
import { formatPrice } from "@/context/data";
import BrandIcon from "../shared/BrandIcon";
import VerifiedBadge from "../shared/VerifiedBadeg";
import { useForm } from "react-hook-form";

type RequestOutcome = "pending" | "approved" | "declined" | "negotiable";

interface Props {
  listing: Listing;
  onClose: () => void;
  onStatusChange: (s: RequestOutcome) => void;
}

interface FormValues {
  offerPrice: string;
  message: string;
  contactPhone: string;
}

export default function ListingAuctionModal({
  listing,
  onClose,
  onStatusChange,
}: Props) {
  const [step, setStep] = useState<"form" | "sent" | "outcome">("form");
  const [outcome, setOutcome] = useState<RequestOutcome | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormValues>({
    defaultValues: {
      offerPrice: (listing.price / 1_000_000_000).toFixed(2),
      message: "",
      contactPhone: "",
    },
  });

  const onSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setStep("sent");
    toast.success("درخواست خرید به " + listing.sellerName + " ارسال شد");
  };

  // Simulate seller response for demo
  const simulateResponse = async (response: RequestOutcome) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setOutcome(response);
    setStep("outcome");
    onStatusChange(response);
    if (response === "approved")
      toast.success("فروشنده درخواست شما را تأیید کرد!");
    else if (response === "negotiable")
      toast.info(
        "فروشنده می‌خواهد مذاکره کند — اطلاعات تماس به اشتراک گذاشته شد",
      );
    else toast.error("فروشنده این درخواست را رد کرد");
  };

  const outcomeConfig = {
    approved: {
      icon: <CheckCircle size={36} className="text-success" />,
      bg: "bg-success/8 border-success/20",
      title: "درخواست تأیید شد!",
      desc: `${listing.sellerName} درخواست خرید شما را تأیید کرد. می‌توانید برای تراکنش اقدام کنید.`,
    },
    declined: {
      icon: <XCircle size={36} className="text-danger" />,
      bg: "bg-danger/8 border-danger/20",
      title: "درخواست رد شد",
      desc: "فروشنده درخواست شما را رد کرد. این آگهی برای سایر خریداران در دسترس است.",
    },
    negotiable: {
      icon: <MessageSquare size={36} className="text-negotiable" />,
      bg: "bg-negotiable/8 border-negotiable/20",
      title: "قابل مذاکره",
      desc: "فروشنده می‌خواهد شرایط را بررسی کند. مستقیماً با آن‌ها تماس بگیرید:",
      phone: "۰۹۱۲ ۳۴۵ ۶۷۸۹",
    },
    pending: {
      icon: <Send size={36} className="text-warning" />,
      bg: "bg-warning/8 border-warning/20",
      title: "درخواست در انتظار",
      desc: "",
    },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Auction request"
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <BrandIcon brand={listing.brand} />
            <div>
              <div className="text-sm font-700 text-foreground">
                {listing.brand} {listing.model} · {listing.trim}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  {listing.sellerName}
                </span>
                {listing.sellerVerified && <VerifiedBadge size="sm" />}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step: Form */}
        {step === "form" && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-5 py-5 flex flex-col gap-4"
          >
            {/* Price summary */}
            <div className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
              <div>
                <div className="text-2xs text-muted-foreground">قیمت آگهی</div>
                <div className="text-price text-xl text-foreground">
                  {formatPrice(listing.price)}
                </div>
                <div className="text-2xs text-muted-foreground">تومان</div>
              </div>
              <div className="text-right">
                <div className="text-2xs text-muted-foreground">
                  میانگین خرید بازار
                </div>
                <div className="text-price text-sm text-success">
                  {formatPrice(listing.marketAvgBuy)}
                </div>
                <div className="text-2xs text-muted-foreground">
                  میانگین فروش بازار
                </div>
                <div className="text-price text-sm text-danger">
                  {formatPrice(listing.marketAvgSell)}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 bg-primary/5 border border-primary/15 rounded-xl px-3 py-2.5">
              <Info size={13} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-primary/80 leading-relaxed">
                فروشنده درخواست شما را دریافت می‌کند و با <strong>تأیید</strong>
                ، <strong>رد</strong> یا <strong>قابل مذاکره</strong> پاسخ
                می‌دهد. در صورت قابل مذاکره، اطلاعات تماس به اشتراک گذاشته
                می‌شود.
              </p>
            </div>

            {/* Offer price */}
            <div>
              <label className="block text-xs font-600 text-foreground mb-1">
                قیمت پیشنهادی شما <span className="text-danger">*</span>
              </label>
              <p className="text-2xs text-muted-foreground mb-1.5">
                به میلیارد تومان — مثلاً ۲.۷۵ یعنی ۲٬۷۵۰٬۰۰۰٬۰۰۰ تومان
              </p>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  {...register("offerPrice", {
                    required: "قیمت پیشنهادی الزامی است",
                    min: {
                      value: 0.1,
                      message: "حداقل پیشنهاد: ۰.۱ میلیارد تومان",
                    },
                  })}
                  className="w-full pl-3 pr-24 py-2.5 text-sm border border-border rounded-lg bg-card font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-600">
                  میلیارد تومان
                </span>
              </div>
              {errors.offerPrice && (
                <p className="text-xs text-danger mt-1">
                  {errors.offerPrice.message}
                </p>
              )}
            </div>

            {/* Contact phone */}
            <div>
              <label className="block text-xs font-600 text-foreground mb-1">
                شماره تماس <span className="text-danger">*</span>
              </label>
              <p className="text-2xs text-muted-foreground mb-1.5">
                فقط در صورت پاسخ قابل مذاکره با فروشنده به اشتراک گذاشته می‌شود
              </p>
              <input
                type="tel"
                {...register("contactPhone", {
                  required: "شماره تماس الزامی است",
                })}
                placeholder="۰۹xx-xxx-xxxx"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-card font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {errors.contactPhone && (
                <p className="text-xs text-danger mt-1">
                  {errors.contactPhone.message}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-600 text-foreground mb-1">
                پیام به فروشنده
              </label>
              <textarea
                {...register("message")}
                rows={2}
                placeholder="هر شرط، نیاز تحویل یا سوالی که دارید…"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 justify-center"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 justify-center"
                style={{ minWidth: "140px" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> در حال ارسال…
                  </>
                ) : (
                  <>
                    <Send size={14} /> ارسال درخواست
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step: Sent — demo seller response buttons */}
        {step === "sent" && (
          <div className="px-5 py-6 flex flex-col gap-4">
            <div className="flex flex-col items-center text-center gap-2 mb-2">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
                <Send size={28} className="text-success" />
              </div>
              <h3 className="text-base font-700 text-foreground">
                درخواست ارسال شد!
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                درخواست شما به <strong>{listing.sellerName}</strong> تحویل داده
                شد. یک پاسخ فروشنده را شبیه‌سازی کنید (فقط دمو):
              </p>
            </div>

            {/* Demo response buttons */}
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-3">
                دمو: فروشنده پاسخ می‌دهد با…
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => simulateResponse("approved")}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-success/10 border border-success/25 text-success text-sm font-700 rounded-xl hover:bg-success/20 transition-colors duration-150 disabled:opacity-50"
                >
                  <CheckCircle size={15} />
                  تأیید — قبول درخواست خرید
                </button>
                <button
                  onClick={() => simulateResponse("negotiable")}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-negotiable/10 border border-negotiable/25 text-negotiable text-sm font-700 rounded-xl hover:bg-negotiable/20 transition-colors duration-150 disabled:opacity-50"
                >
                  <MessageSquare size={15} />
                  قابل مذاکره — اشتراک‌گذاری تماس برای مذاکره
                </button>
                <button
                  onClick={() => simulateResponse("declined")}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-danger/10 border border-danger/25 text-danger text-sm font-700 rounded-xl hover:bg-danger/20 transition-colors duration-150 disabled:opacity-50"
                >
                  <XCircle size={15} />
                  رد — رد کردن درخواست
                </button>
              </div>
              {loading && (
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Loader2 size={13} className="animate-spin" />
                  در حال پردازش پاسخ فروشنده…
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="btn-secondary w-full justify-center text-sm"
            >
              Close — Check notifications later
            </button>
          </div>
        )}

        {/* Step: Outcome */}
        {step === "outcome" && outcome && outcome !== "pending" && (
          <div className="px-5 py-6 flex flex-col items-center text-center gap-4">
            <div
              className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${outcomeConfig[outcome].bg}`}
            >
              {outcomeConfig[outcome].icon}
            </div>
            <div>
              <h3 className="text-lg font-700 text-foreground">
                {outcomeConfig[outcome].title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs">
                {outcomeConfig[outcome].desc}
              </p>
              {outcome === "negotiable" && (
                <div className="mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-negotiable/10 border border-negotiable/25 rounded-xl">
                  <Phone size={15} className="text-negotiable" />
                  <span className="font-mono font-700 text-negotiable text-sm">
                    {outcomeConfig.negotiable.phone}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="btn-primary w-full justify-center"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
