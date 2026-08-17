import { toFa } from "@/context/carLabels";
import { useUserInfo } from "@/context/UserInfoProvider";
import {
  fetchSellerRequests,
  updateRequestStatus,
  type BuyRequestRow,
} from "@/lib/supabase/buyRequests";
import { useSeller } from "@/hooks/useSellers";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle,
  ChevronDown,
  Loader2,
  MessageSquare,
  PlusCircle,
  Upload,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { ReactNode } from "react";
import RequestStatusBadge from "./RequestStatusBadge";
import type { RequestStatus } from "@/context/sellerDashboard";

interface Props {
  onViewAllRequests: () => void;
  onBulkImport: () => void;
}

// Map DB status → frontend status for the badge
const STATUS_MAP: Record<string, RequestStatus> = {
  WAITING: "pending",
  ACCEPTED: "approved",
  NEGOTIABLE: "negotiable",
  REJECTED: "declined",
  COMPLETED: "completed",
};

/** Relative-time label from an ISO date string (Persian). */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} دقیقه پیش`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ساعت پیش`;
  const days = Math.floor(hrs / 24);
  return `${days} روز پیش`;
}

// The always-visible summary row of a request. `trigger` is the optional
// collapsible toggle rendered at the end (only for actionable requests).
function RequestSummary({
  req,
  trigger,
}: {
  req: BuyRequestRow;
  trigger?: ReactNode;
}) {
  const [showMsg, setShowMsg] = useState(false);
  const listingTitle = req.listing_brand
    ? `${req.listing_brand} ${req.listing_model ?? ""}`
    : "آگهی";

  return (
    <div>
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Link
            href={`/sellers/${req.buyer_id}`}
            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-700 text-foreground hover:ring-2 hover:ring-primary/30 transition-all"
          >
            {req.buyer_name.charAt(0)}
          </Link>
          <div>
            <div className="text-sm font-600 text-foreground flex items-center gap-1.5">
              <Link
                href={`/sellers/${req.buyer_id}`}
                className="hover:text-primary hover:underline transition-colors"
              >
                {req.buyer_name}
              </Link>
              {req.message && (
                <button
                  onClick={() => setShowMsg(!showMsg)}
                  className="inline-flex items-center gap-0.5 text-2xs text-muted-foreground hover:text-foreground transition-colors"
                  title="مشاهده پیام"
                >
                  <MessageSquare size={11} />
                </button>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{listingTitle}</div>
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-mono font-700 text-foreground">
            {req.offered_price.toLocaleString()} تومان
          </div>
          <div className="text-2xs text-muted-foreground">
            {timeAgo(req.created_at)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RequestStatusBadge status={STATUS_MAP[req.status] ?? "pending"} />
          {trigger}
        </div>
      </div>
      {showMsg && req.message && (
        <div className="px-5 pb-3">
          <div className="p-2.5 bg-muted/50 rounded-lg text-xs text-foreground leading-relaxed whitespace-pre-wrap">
            {req.message}
          </div>
        </div>
      )}
    </div>
  );
}

function RequestActions({
  onAction,
  loading,
}: {
  onAction: (status: "ACCEPTED" | "NEGOTIABLE" | "REJECTED") => void;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-5 pb-4 pt-1">
      <button
        onClick={() => onAction("ACCEPTED")}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-success/10 border border-success/25 text-success text-xs font-700 rounded-lg hover:bg-success/20 transition-colors duration-150 disabled:opacity-50"
      >
        <CheckCircle size={13} />
        تأیید
      </button>
      <button
        onClick={() => onAction("NEGOTIABLE")}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-negotiable/10 border border-negotiable/25 text-negotiable text-xs font-700 rounded-lg hover:bg-negotiable/20 transition-colors duration-150 disabled:opacity-50"
      >
        <MessageSquare size={13} />
        مذاکره
      </button>
      <button
        onClick={() => onAction("REJECTED")}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-danger/10 border border-danger/25 text-danger text-xs font-700 rounded-lg hover:bg-danger/20 transition-colors duration-150 disabled:opacity-50"
      >
        <XCircle size={13} />
        رد
      </button>
    </div>
  );
}

export default function OverviewTab({
  onViewAllRequests,
  onBulkImport,
}: Props) {
  const { profile } = useUserInfo();
  const { seller } = useSeller(profile?.id ?? "");
  const [requests, setRequests] = useState<BuyRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const data = await fetchSellerRequests(profile.id);
      setRequests(data);
    } catch {
      // silently ignore — UI shows empty state
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAction = async (
    requestId: string,
    status: "ACCEPTED" | "NEGOTIABLE" | "REJECTED",
  ) => {
    setActingId(requestId);
    try {
      await updateRequestStatus(requestId, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r)),
      );
      toast.success("وضعیت درخواست به‌روزرسانی شد");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در به‌روزرسانی");
    } finally {
      setActingId(null);
    }
  };

  const visible = requests.slice(0, 3);

  // Real performance metrics derived from the seller profile and requests.
  const summary = seller?.summary;
  const processed = requests.filter((r) => r.status !== "WAITING");
  const approvedCount = requests.filter(
    (r) => r.status === "ACCEPTED" || r.status === "COMPLETED",
  ).length;
  const approvalRate = processed.length
    ? Math.round((approvedCount / processed.length) * 100)
    : 0;
  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  const performance = [
    {
      label: "نرخ پاسخگویی",
      value: `${toFa(summary?.responseRate ?? 0)}٪`,
      bar: clamp(summary?.responseRate ?? 0),
      color: "bg-success",
    },
    {
      label: "نرخ تأیید درخواست",
      value: `${toFa(approvalRate)}٪`,
      bar: approvalRate,
      color: "bg-primary",
    },
    {
      label: "امتیاز فروشنده",
      value: toFa(summary?.sellerScore ?? 0),
      bar: clamp(summary?.sellerScore ?? 0),
      color: "bg-accent",
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Recent requests */}
      <div className="xl:col-span-2">
        <div className="card-elevated overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-700 text-foreground">
              آخرین درخواست‌های خرید
            </h2>
            <button
              onClick={onViewAllRequests}
              className="text-xs text-primary font-600 hover:underline"
            >
              مشاهده همه
            </button>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-12">
                <Loader2
                  size={18}
                  className="animate-spin text-muted-foreground"
                />
                <span className="text-sm text-muted-foreground">
                  در حال بارگذاری…
                </span>
              </div>
            ) : visible.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                هنوز درخواستی دریافت نکرده‌اید
              </div>
            ) : (
              visible.map((req) =>
                req.status === "WAITING" ? (
                  <Collapsible
                    key={req.id}
                    className="transition-colors duration-150 hover:bg-muted/30"
                  >
                    <RequestSummary
                      req={req}
                      trigger={
                        <CollapsibleTrigger
                          aria-label="نمایش عملیات"
                          className="group rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <ChevronDown
                            size={16}
                            className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                          />
                        </CollapsibleTrigger>
                      }
                    />
                    <CollapsibleContent>
                      {req.message && (
                        <div className="px-5 pt-3 pb-1">
                          <div className="p-2.5 bg-muted/50 rounded-lg text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                            {req.message}
                          </div>
                        </div>
                      )}
                      <RequestActions
                        onAction={(s) => handleAction(req.id, s)}
                        loading={actingId === req.id}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <div
                    key={req.id}
                    className="transition-colors duration-150 hover:bg-muted/30"
                  >
                    <RequestSummary req={req} />
                  </div>
                ),
              )
            )}
          </div>
        </div>
      </div>

      {/* Performance + quick actions */}
      <div className="flex flex-col gap-4 h-fit">
        <div className="card-elevated p-5">
          <h3 className="text-sm font-700 text-foreground mb-4">
            عملکرد این ماه
          </h3>
          <div className="flex flex-col gap-3">
            {performance.map((item) => (
              <div key={`perf-${item.label}`}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-700 text-foreground">{item.value}</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.bar}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card-elevated p-5">
          <h3 className="text-sm font-700 text-foreground mb-3">دسترسی سریع</h3>
          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard/seller/products/new"
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-500 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150 text-right w-full"
            >
              <PlusCircle size={14} className="text-primary" />
              ثبت آگهی جدید
            </Link>
            <button
              onClick={onBulkImport}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-500 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150 text-right w-full"
            >
              <Upload size={14} className="text-accent" />
              ورود گروهی (اکسل)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
