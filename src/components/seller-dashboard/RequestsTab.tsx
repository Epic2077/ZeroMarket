"use client";

import { useUserInfo } from "@/context/UserInfoProvider";
import {
  fetchSellerRequests,
  markRequestNotificationsRead,
  updateRequestStatus,
  type BuyRequestRow,
  type BuyRequestStatus,
} from "@/lib/supabase/buyRequests";
import {
  CheckCircle,
  ChevronDown,
  HandCoins,
  Loader2,
  MessageSquare,
  Phone,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import RejectRequestDialog from "@/components/shared/RejectRequestDialog";
import RequestStatusBadge from "./RequestStatusBadge";
import type { RequestStatus } from "@/context/sellerDashboard";

const faNum = (n: number) => n.toLocaleString("fa-IR");

const STATUS_FROM_DB: Record<string, RequestStatus> = {
  WAITING: "pending",
  ACCEPTED: "approved",
  NEGOTIABLE: "negotiable",
  REJECTED: "declined",
  COMPLETED: "completed",
  CLOSED: "closed",
};

const STATUS_TO_DB: Record<string, BuyRequestStatus> = {
  approved: "ACCEPTED",
  negotiable: "NEGOTIABLE",
  declined: "REJECTED",
};

const requestActions: {
  status: RequestStatus;
  title: string;
  icon: typeof CheckCircle;
  className: string;
}[] = [
  {
    status: "approved",
    title: "تأیید",
    icon: CheckCircle,
    className:
      "bg-success/10 border-success/25 text-success hover:bg-success/20",
  },
  {
    status: "negotiable",
    title: "مذاکره",
    icon: MessageSquare,
    className:
      "bg-negotiable/10 border-negotiable/25 text-negotiable hover:bg-negotiable/20",
  },
  {
    status: "declined",
    title: "رد",
    icon: XCircle,
    className: "bg-danger/10 border-danger/25 text-danger hover:bg-danger/20",
  },
];

/** Relative-time label (Persian). */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} دقیقه پیش`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ساعت پیش`;
  return `${Math.floor(hrs / 24)} روز پیش`;
}

export default function RequestsTab() {
  const { profile } = useUserInfo();
  const [requests, setRequests] = useState<BuyRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<BuyRequestRow | null>(null);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      setRequests(await fetchSellerRequests(profile.id));
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  // Mark REQUEST notifications as read when this tab is viewed
  useEffect(() => {
    if (profile?.id) {
      markRequestNotificationsRead(profile.id).catch(() => {});
    }
  }, [profile?.id]);

  const handleStatus = async (requestId: string, status: RequestStatus) => {
    const dbStatus = STATUS_TO_DB[status];
    if (!dbStatus) return;

    setActingId(requestId);
    try {
      await updateRequestStatus(requestId, dbStatus);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: dbStatus } : r)),
      );
      toast.success("وضعیت درخواست به‌روزرسانی شد");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در به‌روزرسانی");
    } finally {
      setActingId(null);
    }
  };

  const handleRejectDecision = async (close: boolean) => {
    if (!rejectTarget) return;
    const dbStatus: BuyRequestStatus = close ? "CLOSED" : "REJECTED";
    setActingId(rejectTarget.id);
    try {
      await updateRequestStatus(rejectTarget.id, dbStatus);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === rejectTarget.id ? { ...r, status: dbStatus } : r,
        ),
      );
      toast.success(close ? "درخواست بسته شد" : "درخواست رد شد");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در به‌روزرسانی");
    } finally {
      setActingId(null);
      setRejectTarget(null);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16">
        <Loader2 size={18} className="animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">در حال بارگذاری…</span>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────
  if (requests.length === 0) {
    return (
      <div className="card-elevated p-12 text-center">
        <p className="text-sm text-muted-foreground">
          هنوز درخواست خریدی دریافت نکرده‌اید
        </p>
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-700 text-foreground">
          همه درخواست‌های خرید ({faNum(requests.length)})
        </h2>
      </div>
      <div className="divide-y divide-border">
        {requests.map((req) => {
          const frontendStatus = STATUS_FROM_DB[req.status] ?? "pending";
          const completed =
            req.status === "COMPLETED" || req.status === "CLOSED";
          const listingTitle = req.listing_brand
            ? `${req.listing_brand} ${req.listing_model ?? ""}`
            : "آگهی";
          const isBuyListing = req.listing_type === "BUY";

          return (
            <div
              key={req.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 ${
                completed ? "opacity-50 bg-muted/20" : "hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <Link
                  href={`/sellers/${req.buyer_id}`}
                  className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-700 text-foreground shrink-0 hover:ring-2 hover:ring-primary/30 transition-all"
                >
                  {req.buyer_name.charAt(0)}
                </Link>
                <div>
                  <div className="text-sm font-700 text-foreground flex items-center gap-1.5">
                    <Link
                      href={`/sellers/${req.buyer_id}`}
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {req.buyer_name}
                    </Link>
                    {req.message && (
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === req.id ? null : req.id)
                        }
                        className="inline-flex items-center gap-0.5 text-2xs text-muted-foreground hover:text-foreground transition-colors"
                        title="مشاهده پیام"
                      >
                        <MessageSquare size={11} />
                        <ChevronDown
                          size={10}
                          className={`transition-transform ${expandedId === req.id ? "rotate-180" : ""}`}
                        />
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    {listingTitle}
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
                  {expandedId === req.id && req.message && (
                    <div className="mt-2 p-2.5 bg-muted/50 rounded-lg text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                      {req.message}
                    </div>
                  )}
                  <div className="text-2xs text-muted-foreground mt-0.5">
                    {timeAgo(req.created_at)}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-mono font-700 text-foreground">
                  {req.offered_price.toLocaleString()} تومان
                </div>
                <div className="text-2xs text-muted-foreground">
                  پیشنهاد قیمت
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <RequestStatusBadge status={frontendStatus} />
                {req.buyer_phone && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-xs font-mono text-foreground"
                    dir="ltr"
                  >
                    <Phone size={11} className="text-muted-foreground" />
                    {req.buyer_phone}
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  {!completed &&
                    requestActions.map((action) => {
                      const Icon = action.icon;
                      const isActive = frontendStatus === action.status;
                      const isBusy = actingId === req.id;
                      return (
                        <button
                          key={action.status}
                          onClick={() =>
                            action.status === "declined"
                              ? setRejectTarget(req)
                              : handleStatus(req.id, action.status)
                          }
                          disabled={isBusy}
                          title={action.title}
                          aria-label={action.title}
                          className={`flex items-center gap-1 px-3 py-1.5 border text-xs font-700 rounded-lg transition-colors duration-150 disabled:opacity-50 ${action.className} ${isActive ? "ring-1 ring-current" : ""}`}
                        >
                          <Icon size={12} />
                          {action.title}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {rejectTarget && (
        <RejectRequestDialog
          title="رد درخواست"
          description={`آیا می‌خواهید درخواست «${rejectTarget.buyer_name}» بسته شود؟`}
          onConfirm={(close) => handleRejectDecision(close)}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
