"use client";

import {
  approveTaxonomyChangeRequest,
  describeChangeRequest,
  fetchAllOwnerNotifications,
  fetchOwnerNotifications,
  fetchTaxonomyChangeRequests,
  notificationLabels,
  rejectTaxonomyChangeRequest,
  resolveNotification,
  type OwnerNotification,
  type OwnerNotificationType,
  type TaxonomyChangeRequest,
} from "@/lib/supabase/taxonomy";
import {
  Bell,
  Check,
  ChevronRight,
  Clock,
  Loader2,
  X,
  AlertCircle,
  Plus,
  Minus,
  Edit2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OwnerNotificationsProps {
  initialNotifications: OwnerNotification[];
  onNotificationsChange: (notifications: OwnerNotification[]) => void;
}

// ── Persian date from ISO ───────────────────────────────────────────────
function persianDate(iso: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// ── Type icons ──────────────────────────────────────────────────────────
const typeIcon: Record<OwnerNotificationType, string> = {
  TAXONOMY_REQUEST: "🏷️",
  SELLER_APPLICATION: "🏪",
  SYSTEM_ALERT: "⚠️",
  REPORT: "📋",
};

const actionIcon: Record<string, React.ReactNode> = {
  ADD: <Plus size={14} className="text-success" />,
  UPDATE: <Edit2 size={14} className="text-warning" />,
  DELETE: <Minus size={14} className="text-danger" />,
};

// Import the meta for helpers
import { taxonomyCategoryMeta } from "@/lib/supabase/taxonomy";

export default function OwnerNotifications({
  initialNotifications,
  onNotificationsChange,
}: OwnerNotificationsProps) {
  const [notifications, setNotifications] =
    useState<OwnerNotification[]>(initialNotifications);
  const [taxonomyRequests, setTaxonomyRequests] = useState<
    TaxonomyChangeRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Sync with parent
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  // Fetch taxonomy change requests and all notifications on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [notifs, requests] = await Promise.all([
          fetchAllOwnerNotifications(50),
          fetchTaxonomyChangeRequests(),
        ]);
        if (!cancelled) {
          setNotifications(notifs);
          setTaxonomyRequests(requests);
          onNotificationsChange(notifs.filter((n) => !n.is_resolved));
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "خطا در دریافت اعلان‌ها",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onNotificationsChange]);

  const syncNotifications = (
    next:
      | OwnerNotification[]
      | ((prev: OwnerNotification[]) => OwnerNotification[]),
  ) => {
    setNotifications((prev) => {
      const nextNotifications = typeof next === "function" ? next(prev) : next;
      onNotificationsChange(nextNotifications);
      return nextNotifications;
    });
  };

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleResolve = async (id: string) => {
    try {
      await resolveNotification(id);
      syncNotifications((prev: OwnerNotification[]) =>
        prev.filter((n: OwnerNotification) => n.id !== id),
      );
      toast.success("اعلان بسته شد");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در بستن اعلان");
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approveTaxonomyChangeRequest(requestId);
      setTaxonomyRequests((prev: TaxonomyChangeRequest[]) =>
        prev.filter((r: TaxonomyChangeRequest) => r.id !== requestId),
      );
      syncNotifications((prev: OwnerNotification[]) =>
        prev.filter((n: OwnerNotification) => n.reference_id !== requestId),
      );
      toast.success("درخواست تایید و اعمال شد");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در تایید درخواست");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectTaxonomyChangeRequest(requestId);
      setTaxonomyRequests((prev: TaxonomyChangeRequest[]) =>
        prev.filter((r: TaxonomyChangeRequest) => r.id !== requestId),
      );
      syncNotifications((prev: OwnerNotification[]) =>
        prev.filter((n: OwnerNotification) => n.reference_id !== requestId),
      );
      toast.success("درخواست رد شد");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در رد درخواست");
    }
  };

  if (loading) {
    return (
      <div className="card-elevated p-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 size={18} className="animate-spin text-primary" />
        در حال بارگذاری اعلان‌ها…
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-elevated p-8 text-center">
        <p className="text-sm text-danger mb-3">خطا: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary text-sm"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const hasItems = notifications.length > 0 || taxonomyRequests.length > 0;

  if (!hasItems) {
    return (
      <div className="card-elevated p-12 text-center">
        <Bell
          size={32}
          className="text-muted-foreground mx-auto mb-3 opacity-40"
        />
        <p className="text-sm text-muted-foreground">اعلان جدیدی وجود ندارد</p>
      </div>
    );
  }

  // Separate notifications into new (unresolved) and old (resolved)
  //   const newNotifications = notifications.filter((n) => !n.is_resolved);
  //   const oldNotifications = notifications.filter((n) => n.is_resolved);

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-0">
      {/* Taxonomy Change Requests */}
      {taxonomyRequests.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-700 text-foreground flex items-center gap-2 px-2">
            <AlertCircle size={14} className="text-warning shrink-0" />
            درخواست‌های تغییر گزینه‌ها (
            {taxonomyRequests.length.toLocaleString("fa-IR")})
          </h4>
          {taxonomyRequests.map((req) => {
            const isOpen = expanded.has(req.id);
            return (
              <div
                key={req.id}
                className={`card-elevated overflow-hidden transition-colors duration-150 ${isOpen ? "ring-1 ring-primary/20" : ""}`}
              >
                {/* Header */}
                <button
                  onClick={() => toggle(req.id)}
                  className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 text-right"
                >
                  <div className="flex items-center gap-3 min-w-0 w-full">
                    <span className="text-xl shrink-0">
                      {typeIcon.TAXONOMY_REQUEST}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-700 text-foreground truncate">
                        {describeChangeRequest(req)}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary text-2xs font-600 shrink-0">
                          {notificationLabels.TAXONOMY_REQUEST}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-2xs font-600 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                          در انتظار بررسی
                        </span>
                        <span className="text-2xs text-muted-foreground shrink-0 hidden sm:inline">
                          {persianDate(req.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                  />
                </button>

                {/* Expanded body */}
                {isOpen && (
                  <div className="border-t border-border px-4 py-4 space-y-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <span className="text-lg shrink-0">
                        {actionIcon[req.action]}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-600 text-foreground truncate">
                          {req.action === "ADD" &&
                            `افزودن ${getCategoryNoun(req.category)} جدید`}
                          {req.action === "UPDATE" &&
                            `تغییر ${getCategoryNoun(req.category)}`}
                          {req.action === "DELETE" &&
                            `حذف ${getCategoryNoun(req.category)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          دسته‌بندی: {getCategoryLabel(req.category)}
                        </p>
                      </div>
                    </div>

                    {req.action === "UPDATE" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30">
                        <div>
                          <p className="text-2xs text-muted-foreground mb-1">
                            مقدار فعلی
                          </p>
                          <p className="text-sm font-600 text-foreground truncate">
                            {req.value}
                          </p>
                        </div>
                        <div>
                          <p className="text-2xs text-muted-foreground mb-1">
                            مقدار جدید
                          </p>
                          <p className="text-sm font-600 text-primary truncate">
                            {req.new_value}
                          </p>
                        </div>
                      </div>
                    )}

                    {req.action === "ADD" && (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-2xs text-muted-foreground mb-1">
                          مقدار برای افزودن
                        </p>
                        <p className="text-sm font-600 text-foreground truncate">
                          {req.value}
                        </p>
                      </div>
                    )}

                    {req.action === "DELETE" && (
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-2xs text-muted-foreground mb-1">
                          مقدار برای حذف
                        </p>
                        <p className="text-sm font-600 text-danger truncate">
                          {req.value}
                        </p>
                      </div>
                    )}

                    {req.metadata && Object.keys(req.metadata).length > 0 && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer mb-2">
                          جزئیات متادیتا
                        </summary>
                        <pre className="bg-muted/50 p-2 rounded text-[10px] overflow-auto whitespace-pre-wrap">
                          {JSON.stringify(req.metadata, null, 2)}
                        </pre>
                      </details>
                    )}

                    {/* Actions - stacked on mobile */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-border">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="btn-primary text-sm inline-flex items-center justify-center gap-1.5 w-full sm:w-auto"
                      >
                        <Check size={14} />
                        تایید و اعمال
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="btn-secondary text-sm inline-flex items-center justify-center gap-1.5 text-danger hover:bg-danger/10 w-full sm:w-auto"
                      >
                        <X size={14} />
                        رد درخواست
                      </button>
                    </div>
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

// Helper functions
function getCategoryLabel(category: TaxonomyChangeRequest["category"]): string {
  const meta = taxonomyCategoryMeta.find((c) => c.id === category);
  return meta?.label ?? category;
}

function getCategoryNoun(category: TaxonomyChangeRequest["category"]): string {
  const meta = taxonomyCategoryMeta.find((c) => c.id === category);
  return meta?.noun ?? category;
}
