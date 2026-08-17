"use client";

import { reportListing } from "@/lib/supabase/taxonomy";
import type { Listing } from "@/types/dataTypes";
import { Flag, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  listing: Listing;
  onClose: () => void;
}

export default function ReportListingModal({ listing, onClose }: Props) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await reportListing({
        listingId: listing.id,
        listingLabel: `${listing.brand} ${listing.model} ${listing.trim}`,
        reason: reason.trim() || undefined,
      });
      toast.success("گزارش شما ثبت شد.");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در ثبت گزارش");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 vazir-matn"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="گزارش آگهی"
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <form
        onSubmit={submit}
        noValidate
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-800 text-foreground">گزارش آگهی</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {listing.brand} {listing.model} {listing.trim}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-muted"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-3 px-5 py-4">
          <label className="flex flex-col gap-1.5 text-xs font-600 text-muted-foreground">
            دلیل گزارش
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="توضیح دهید چرا این آگهی باید بررسی شود…"
              className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <p className="text-2xs text-muted-foreground">
            گزارش شما برای مدیران پلتفرم ارسال می‌شود.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-sm"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-sm flex items-center gap-2"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Flag size={14} />
            )}
            ثبت گزارش
          </button>
        </div>
      </form>
    </div>
  );
}
