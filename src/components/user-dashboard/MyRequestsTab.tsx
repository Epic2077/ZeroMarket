"use client";

import RequestStatusBadge from "@/components/seller-dashboard/RequestStatusBadge";
import { useUserInfo } from "@/context/UserInfoProvider";
import {
  cancelBuyRequest,
  completeBuyRequest,
  fetchBuyerRequests,
  updateRequestStatus,
  type BuyerRequestRow,
} from "@/lib/supabase/buyRequests";
import { reportListing } from "@/lib/supabase/taxonomy";
import type { RequestStatus } from "@/context/sellerDashboard";
import {
  Check,
  Flag,
  HandCoins,
  Loader2,
  Phone,
  ShoppingCart,
  Store,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const faNum = (n: number) => n.toLocaleString("fa-IR");

const STATUS_FROM_DB: Record<string, RequestStatus> = {
  WAITING: "pending",
  ACCEPTED: "approved",
  NEGOTIABLE: "negotiable",
  REJECTED: "declined",
  COMPLETED: "completed",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} دقیقه پیش`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ساعت پیش`;
  return `${Math.floor(hrs / 24)} روز پیش`;
}

export default function MyRequestsTab() {
  const { user } = useUserInfo();
  const [requests, setRequests] = useState<BuyerRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      setRequests(await fetchBuyerRequests(user.id));
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const cancel = async (id: string, title: string) => {
    try {
      await cancelBuyRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success(`درخواست «${title}» لغو شد`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در لغو درخواست");
    }
  };

  const finish = async (id: string, title: string) => {
    setBusyId(id);
    try {
      await completeBuyRequest(id);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "COMPLETED" as const } : r,
        ),
      );
      toast.success(`معامله «${title}» تکمیل شد.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "خطا در تکمیل معامله",
      );
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (req: BuyerRequestRow) => {
    setBusyId(req.id);
    try {
      await updateRequestStatus(req.id, "REJECTED");
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id ? { ...r, status: "REJECTED" as const } : r,
        ),
      );
      toast.success("درخواست رد شد.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "خطا در رد معامله",
      );
    } finally {
      setBusyId(null);
    }
  };

  const reportCancel = async (req: BuyerRequestRow) => {
    setBusyId(req.id);
    try {
      await updateRequestStatus(req.id, "REJECTED");
      await reportListing({
        listingId: req.listing_id,
        listingLabel: req.listing_title,
        reason: "خریدار درخواست را لغو و آگهی را گزارش کرد",
      });
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id ? { ...r, status: "REJECTED" as const } : r,
        ),
      );
      toast.success("درخواست لغو شد و آگهی گزارش گردید.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "خطا در گزارش آگهی",
      );
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16">
        <Loader2 size={18} className="animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">در حال بارگذاری…</span>
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-700 text-foreground">
          درخواست‌های خرید من ({faNum(requests.length)})
        </h2>
      </div>

      {requests.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
          درخواست فعالی ندارید.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {requests.map((req) => {
            const frontendStatus = STATUS_FROM_DB[req.status] ?? "pending";
            const cancellable =
              req.status === "WAITING" || req.status === "NEGOTIABLE";
            const canComplete = req.status === "ACCEPTED";
            const completed = req.status === "COMPLETED";
            const rejected = req.status === "REJECTED";
            const showPhone =
              (req.status === "ACCEPTED" || req.status === "NEGOTIABLE") &&
              req.seller_phone;
            const isBuyListing = req.listing_type === "BUY";
            return (
              <div
                key={req.id}
                className={`flex flex-col gap-4 px-5 py-4 transition-colors duration-150 ${
                  completed || rejected
                    ? "opacity-50 bg-muted/20"
                    : "hover:bg-muted/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                      <Store size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-700 text-foreground">
                          {req.listing_title}
                        </span>
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-2xs font-600 ${
                            isBuyListing
                              ? "bg-accent/10 text-accent"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {isBuyListing ? (
                            <HandCoins size={10} />
                          ) : (
                            <ShoppingCart size={10} />
                          )}
                          {isBuyListing ? "خرید" : "فروش"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {req.seller_name}
                      </div>
                      <div className="text-2xs text-muted-foreground mt-0.5">
                        {timeAgo(req.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-mono font-700 text-foreground">
                      {req.offered_price.toLocaleString("fa-IR")} تومان
                    </div>
                    <div className="text-2xs text-muted-foreground">
                      پیشنهاد شما
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <RequestStatusBadge status={frontendStatus} />
                    {canComplete && (
                      <button
                        onClick={() => finish(req.id, req.listing_title)}
                        disabled={busyId === req.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-success text-white text-xs font-700 rounded-lg hover:bg-success/90 transition-colors duration-150 disabled:opacity-50"
                      >
                        {busyId === req.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                        تأیید و تکمیل معامله
                      </button>
                    )}
                    {canComplete && (
                      <button
                        onClick={() => reject(req)}
                        disabled={busyId === req.id}
                        className="flex items-center gap-1 px-3 py-1.5 border border-danger/25 bg-danger/10 text-danger text-xs font-700 rounded-lg hover:bg-danger/20 transition-colors duration-150 disabled:opacity-50"
                      >
                        <X size={12} />
                        رد معامله
                      </button>
                    )}
                    {cancellable && (
                      <button
                        onClick={() => cancel(req.id, req.listing_title)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-danger/25 bg-danger/10 text-danger text-xs font-700 rounded-lg hover:bg-danger/20 transition-colors duration-150"
                      >
                        <X size={12} />
                        لغو درخواست
                      </button>
                    )}
                    {cancellable && (
                      <button
                        onClick={() => reportCancel(req)}
                        disabled={busyId === req.id}
                        className="flex items-center gap-1 px-3 py-1.5 border border-warning/25 bg-warning/10 text-warning text-xs font-700 rounded-lg hover:bg-warning/20 transition-colors duration-150 disabled:opacity-50"
                      >
                        <Flag size={12} />
                        گزارش آگهی
                      </button>
                    )}
                  </div>
                </div>

                {/* Phone number reveal for accepted/negotiable */}
                {showPhone && (
                  <div className="flex items-center gap-2 bg-success/5 border border-success/20 rounded-xl px-3 py-2">
                    <Phone size={13} className="text-success shrink-0" />
                    <span className="text-xs text-foreground">
                      شماره تماس {isBuyListing ? "خریدار" : "فروشنده"}:{" "}
                      <span className="font-mono font-700" dir="ltr">
                        {req.seller_phone}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
