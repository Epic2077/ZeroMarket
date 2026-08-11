"use client";
import React, { useState } from "react";

import { X, Send, CheckCircle, Loader2, Info, Phone } from "lucide-react";
import { toast } from "sonner";
import { Listing } from "@/types/dataTypes";
import { formatPrice } from "@/context/data";
import BrandIcon from "../shared/BrandIcon";
import VerifiedBadge from "../shared/VerifiedBadeg";
import { useUserInfo } from "@/context/UserInfoProvider";
import { sendBuyRequest } from "@/lib/supabase/buyRequests";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props {
  listing: Listing;
  onClose: () => void;
  onStatusChange: (
    s: "pending" | "approved" | "declined" | "negotiable",
  ) => void;
}

const auctionSchema = z.object({
  offerPrice: z
    .string()
    .min(1, "قیمت پیشنهادی الزامی است")
    .refine(
      (v) => Number(v.replace(/\D/g, "")) >= 100_000_000,
      "حداقل پیشنهاد: ۱۰۰٬۰۰۰٬۰۰۰ تومان",
    ),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof auctionSchema>;

export default function ListingAuctionModal({
  listing,
  onClose,
  onStatusChange,
}: Props) {
  const { user, profile } = useUserInfo();
  const [step, setStep] = useState<"form" | "sent">("form");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(auctionSchema),
    defaultValues: {
      offerPrice: listing.price.toLocaleString("en-US"),
      message: "",
    },
  });

  const groupThousands = (raw: string): string => {
    const digits = raw.replace(/\D/g, "");
    return digits ? Number(digits).toLocaleString("en-US") : "";
  };

  const onSubmit = async (values: FormValues) => {
    if (!user?.id) {
      toast.error("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    setLoading(true);
    try {
      await sendBuyRequest({
        listingId: listing.id,
        sellerId: listing.seller_id ?? "",
        buyerId: user.id,
        offeredPrice: Number(values.offerPrice.replace(/\D/g, "")),
        message: values.message?.trim() || undefined,
      });
      setStep("sent");
      onStatusChange("pending");
      toast.success(`درخواست خرید به ${listing.sellerName} ارسال شد`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در ارسال درخواست");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 vazir-matn mt-15"
      dir="rtl"
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-border mr-5">
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
                  {listing.price.toLocaleString()}
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
              <Info size={13} className="text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-primary/80 leading-relaxed">
                {listing.listingType === "BUY" ? (
                  <span>
                    خریدار درخواست شما را دریافت می‌کند و با{" "}
                    <strong>تأیید</strong>، <strong>رد</strong> یا{" "}
                    <strong>قابل مذاکره</strong> پاسخ می‌دهد. در صورت قابل
                    مذاکره، اطلاعات تماس به اشتراک گذاشته می‌شود.
                  </span>
                ) : (
                  <span>
                    فروشنده درخواست شما را دریافت می‌کند و با{" "}
                    <strong>تأیید</strong>، <strong>رد</strong> یا{" "}
                    <strong>قابل مذاکره</strong> پاسخ می‌دهد. در صورت قابل
                    مذاکره، اطلاعات تماس به اشتراک گذاشته می‌شود.
                  </span>
                )}
              </p>
            </div>

            {/* Offer price */}
            <div>
              <label className="block text-xs font-600 text-foreground mb-1">
                قیمت پیشنهادی شما <span className="text-danger">*</span>
              </label>
              <p className="text-2xs text-muted-foreground mb-1.5">
                مبلغ کامل به تومان — مثلاً ۹۰۰٬۰۰۰٬۰۰۰
              </p>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  dir="rtl"
                  {...register("offerPrice", {
                    onChange: (e) => {
                      setValue("offerPrice", groupThousands(e.target.value), {
                        shouldValidate: true,
                      });
                    },
                  })}
                  // placeholder={listing.marketAvgBuy.toLocaleString()}
                  className="w-full pl-20 pr-3 py-2.5 text-sm text-right border border-border rounded-lg bg-card font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-600">
                  تومان
                </span>
              </div>
              {errors.offerPrice && (
                <p className="text-xs text-danger mt-1">
                  {errors.offerPrice.message}
                </p>
              )}
            </div>

            {/* Contact phone — from profile */}
            <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-xl px-3 py-2.5">
              <Phone size={13} className="text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-warning/90 leading-relaxed">
                {listing.listingType === "BUY" ? (
                  <span>
                    در صورت <strong>تایید</strong> خریدار، شماره تماس شما
                  </span>
                ) : (
                  <span>
                    در صورت <strong>تایید</strong> فروشنده، شماره تماس شما
                  </span>
                )}
                {profile?.phone ? (
                  <>
                    {" "}
                    (
                    <span className="font-mono" dir="ltr">
                      {profile.phone}
                    </span>
                    )
                  </>
                ) : null}{" "}
                {listing.listingType === "BUY" ? (
                  <span>با خریدار به اشتراک گذاشته می‌شود.</span>
                ) : (
                  <span>با فروشنده به اشتراک گذاشته می‌شود.</span>
                )}
                {!profile?.phone && (
                  <span className="block mt-1">
                    شماره تماس در پروفایل شما ثبت نشده است.{" "}
                    <a
                      href="/user-profile"
                      className="underline hover:text-warning"
                    >
                      ویرایش پروفایل
                    </a>
                  </span>
                )}
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-600 text-foreground mb-1">
                {listing.listingType === "BUY"
                  ? "پیام به خریدار"
                  : "پیام به فروشنده"}
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

        {/* Step: Sent */}
        {step === "sent" && (
          <div className="px-5 py-6 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle size={32} className="text-success" />
            </div>
            <div>
              <h3 className="text-base font-700 text-foreground">
                درخواست با موفقیت ارسال شد
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-xs">
                درخواست شما به <strong>{listing.sellerName}</strong> ارسال شد.
                فروشنده از طریق اعلان‌ها مطلع خواهد شد و پاسخ را در پنل خود
                مشاهده می‌کنید.
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn-primary w-full justify-center"
            >
              متوجه شدم
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
