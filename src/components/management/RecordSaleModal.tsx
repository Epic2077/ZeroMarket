"use client";

import { recordSale } from "@/lib/supabase/completedSales";
import { formatPrice } from "@/context/data";
import type { Listing } from "@/types/dataTypes";
import {
  fetchSellerRequests,
  type BuyRequestRow,
} from "@/lib/supabase/buyRequests";
import { HandCoins, Loader2, ShoppingCart, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface Props {
  listing: Listing;
  sellerId: string;
  onClose: () => void;
  onRecorded: () => void;
}

const groupThousands = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("en-US") : "";
};

export default function RecordSaleModal({
  listing,
  sellerId,
  onClose,
  onRecorded,
}: Props) {
  const [finalPrice, setFinalPrice] = useState(
    listing.price.toLocaleString("en-US"),
  );
  const [archive, setArchive] = useState(false);
  const [saving, setSaving] = useState(false);

  // Buyer selection
  const [applicants, setApplicants] = useState<BuyRequestRow[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState("");
  const [manual, setManual] = useState(false);
  const [manualId, setManualId] = useState("");

  const isBuy = listing.listingType === "BUY";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchSellerRequests(sellerId);
        if (!cancelled) {
          setApplicants(
            rows.filter(
              (r) =>
                r.listing_id === listing.id &&
                (r.status === "WAITING" ||
                  r.status === "ACCEPTED" ||
                  r.status === "NEGOTIABLE"),
            ),
          );
        }
      } catch {
        // ignore — applicant list is optional (manual entry still works)
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sellerId, listing.id]);

  const buyerId = manual ? manualId.trim() : selectedBuyer;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(finalPrice.replace(/\D/g, ""));
    if (!price || price <= 0) {
      toast.error("قیمت نهایی معامله نامعتبر است");
      return;
    }
    if (!buyerId) {
      toast.error("خریدار معامله را انتخاب یا وارد کنید");
      return;
    }

    setSaving(true);
    try {
      await recordSale({
        sellerId,
        buyerId,
        listingId: listing.id,
        listingType: listing.listingType,
        listingLabel: `${listing.brand} ${listing.model} ${listing.trim}`,
        finalPrice: price,
        archiveListing: archive,
      });
      toast.success("معامله ثبت شد و به آمار فروش اضافه گردید.");
      onRecorded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در ثبت معامله");
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
      aria-label="ثبت معامله"
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
            <h2 className="text-base font-800 text-foreground">ثبت معامله</h2>
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

        <div className="flex flex-col gap-4 px-5 py-4">
          {/* Type indicator */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-700 border ${
                isBuy
                  ? "bg-accent/10 text-accent border-accent/25"
                  : "bg-primary/10 text-primary border-primary/25"
              }`}
            >
              {isBuy ? <HandCoins size={13} /> : <ShoppingCart size={13} />}
              {isBuy ? "معامله خرید" : "معامله فروش"}
            </span>
          </div>

          {/* Buyer selection */}
          <div className="flex flex-col gap-1.5 text-xs font-600 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User size={13} />
              خریدار معامله
            </span>

            {applicants.length > 0 && !manual && (
              <select
                value={selectedBuyer}
                onChange={(e) => setSelectedBuyer(e.target.value)}
                className="h-10 rounded-lg border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">— انتخاب از درخواست‌دهندگان —</option>
                {applicants.map((a) => (
                  <option key={a.id} value={a.buyer_id}>
                    {a.buyer_name} · پیشنهاد{" "}
                    {a.offered_price.toLocaleString("fa-IR")} تومان
                  </option>
                ))}
              </select>
            )}

            <label className="flex items-center gap-2 mt-1 text-2xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={manual}
                onChange={(e) => setManual(e.target.checked)}
                className="accent-primary size-3.5"
              />
              ورود دستی شناسه خریدار
            </label>

            {manual && (
              <input
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                dir="ltr"
                placeholder="شناسه کاربری (UUID) خریدار"
                className="h-10 rounded-lg border border-border bg-card px-3 text-left font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            )}
          </div>

          {/* Final price */}
          <label className="flex flex-col gap-1.5 text-xs font-600 text-muted-foreground">
            قیمت نهایی معامله (تومان)
            <input
              value={finalPrice}
              onChange={(e) => setFinalPrice(groupThousands(e.target.value))}
              inputMode="numeric"
              dir="ltr"
              className="h-10 rounded-lg border border-border bg-card px-3 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={listing.price.toLocaleString("en-US")}
            />
            <span className="text-2xs text-muted-foreground">
              قیمت اولیه آگهی: {formatPrice(listing.price)} تومان
            </span>
          </label>

          {/* Archive toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
            <div>
              <div className="text-xs font-700 text-foreground">
                غیرفعال‌سازی آگهی
              </div>
              <div className="text-2xs text-muted-foreground mt-0.5">
                پس از ثبت معامله، این آگهی از بازار حذف می‌شود.
              </div>
            </div>
            <Switch checked={archive} onCheckedChange={setArchive} />
          </div>
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
              <ShoppingCart size={14} />
            )}
            ثبت معامله
          </button>
        </div>
      </form>
    </div>
  );
}
