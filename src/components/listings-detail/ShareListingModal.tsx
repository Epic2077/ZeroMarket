"use client";

import { useRef, useState } from "react";
import type { Listing } from "@/types/dataTypes";
import { downloadCanvasAsImage, copyListingLink } from "@/lib/shareUtils";
import ListingShareCard from "./ListingShareCard";
import { X, Download, Link2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  listing: Listing;
  onClose: () => void;
}

type ShareMode = "options" | "image" | "link";

export default function ShareListingModal({ listing, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<ShareMode>("options");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    try {
      await downloadCanvasAsImage(
        cardRef,
        `${listing.brand}-${listing.model}-${listing.year}`,
      );
      toast.success("تصویر با موفقیت دانلود شد");
      onClose();
    } catch (error) {
      toast.error("خطا در دانلود تصویر");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const success = await copyListingLink(listing.id);
      if (success) {
        setCopied(true);
        toast.success("لینک کپی شد");
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error("خطا در کپی کردن");
      }
    } catch (error) {
      toast.error("خطا در کپی کردن");
      console.error(error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 mt-16 p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto vazir-matn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white">
          <div className="flex items-center gap-4 flex-1">
            {mode === "image" && (
              <button
                onClick={handleGenerateImage}
                disabled={isGenerating}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-600 flex items-center gap-2 transition-colors"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    درحال تولید...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    دانلود تصویر
                  </>
                )}
              </button>
            )}
          </div>
          <h2 className="text-xl font-700 text-foreground flex-1 text-center">
            {mode === "options"
              ? "اشتراک‌گذاری آگهی"
              : mode === "image"
                ? "دانلود تصویر"
                : "اشتراک لینک"}
          </h2>
          <div className="flex-1 flex justify-end">
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 z-50">
          {mode === "options" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 z-50">
              {/* Image Option */}
              <button
                onClick={() => setMode("image")}
                className="group p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-right"
              >
                <div className="flex items-center gap-3 mb-3 z-50">
                  <Download size={24} className="text-primary" />
                  <h3 className="font-700 text-foreground">دانلود تصویر</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  تصویر زیبای این آگهی را دانلود کنید و در شبکه‌های اجتماعی
                  اشتراک بگذارید
                </p>
              </button>

              {/* Link Option */}
              <button
                onClick={() => setMode("link")}
                className="group p-6 rounded-xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all text-right"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Link2 size={24} className="text-accent" />
                  <h3 className="font-700 text-foreground">اشتراک لینک</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  لینک آگهی را کپی کنید و با دوستان خود اشتراک بگذارید —
                  پیش‌نمایش خودکار آگهی نمایش داده می‌شود
                </p>
              </button>
            </div>
          )}

          {mode === "image" && (
            <div className="space-y-6">
              {/* Preview */}
              <div className="bg-muted/30 rounded-xl p-6 flex items-center justify-center">
                <div className="w-full max-w-sm">
                  <ListingShareCard listing={listing} forwardRef={cardRef} />
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-sm text-muted-foreground">
                  📌 این تصویر را می‌توانید در اینستاگرام، تلگرام یا سایر
                  شبکه‌های اجتماعی اشتراک بگذارید. کیفیت بالا برای دستگاه‌های
                  مختلف بهینه شده است.
                </p>
              </div>

              {/* Windows Security Info */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>💡 نکته:</strong> اگر هنگام باز کردن تصویر پیام
                  &quot;ناشر نامشخص&quot; یا &quot;فایل خطرناک است&quot; دیدید،
                  این یک پیام امنیتی معمولی از ویندوز است. برای حل این مشکل:
                </p>
                <ol className="text-xs text-muted-foreground mt-2 pr-4 space-y-1">
                  <li>• روی فایل کلیک راست کنید</li>
                  <li>• &quot;ویژگی‌ها&quot; را انتخاب کنید</li>
                  <li>
                    • اگر گزینه &quot;Unblock&quot; وجود داشت، آن را تیک کنید
                  </li>
                  <li>
                    • یا با کلیک راست بر روی تصویر، &quot;Open with&quot; را
                    انتخاب کنید
                  </li>
                </ol>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setMode("options")}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  بازگشت
                </button>
              </div>
            </div>
          )}

          {mode === "link" && (
            <div className="space-y-6">
              {/* Link Display */}
              <div className="bg-muted/30 rounded-xl p-4 flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}/market/listings/${listing.id}`
                      : ""
                  }
                  className="flex-1 bg-transparent text-sm text-foreground font-mono border-none outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 hover:bg-muted rounded-lg transition-colors shrink-0"
                  title="کپی کردن"
                >
                  {copied ? (
                    <Check size={18} className="text-success" />
                  ) : (
                    <Copy size={18} className="text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* Embed preview */}
              <div>
                <p className="text-xs font-600 text-muted-foreground mb-3">
                  پیش‌نمایش هنگام اشتراک در شبکه‌های اجتماعی:
                </p>
                <div className="border border-border rounded-xl overflow-hidden bg-muted/20">
                  <div className="aspect-video bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-muted-foreground text-sm">
                        تصویر آگهی
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-700 text-foreground mb-1">
                      {listing.brand} {listing.model} {listing.year}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {listing.trim} • صفرکیلومتر • {listing.city}
                    </p>
                    <p className="text-sm font-700 text-primary">
                      خودروجو - بازار خودروهای صفرکیلومتر
                    </p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                <p className="text-sm text-muted-foreground">
                  ✓ هنگام ارسال این لینک به شبکه‌های اجتماعی (واتس‌اپ، تلگرام،
                  اینستاگرام، وغیره)، این پیش‌نمایش خودکار نمایش داده می‌شود.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setMode("options")}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  بازگشت
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 font-600 flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      کپی شد!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      کپی کردن لینک
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
