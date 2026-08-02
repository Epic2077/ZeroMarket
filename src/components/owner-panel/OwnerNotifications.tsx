"use client";

import {
  approveTaxonomyChangeRequest,
  describeChangeRequest,
  fetchAllOwnerNotifications,
  fetchTaxonomyChangeRequests,
  notificationLabels,
  rejectTaxonomyChangeRequest,
  resolveNotification,
  type OwnerNotification,
  type OwnerNotificationType,
  type TaxonomyChangeRequest,
} from "@/lib/supabase/taxonomy";
import {
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  X,
  AlertCircle,
  Plus,
  Minus,
  Edit2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  NotificationFilters,
  NotificationHeader,
  NotificationEmpty,
  NotificationLoading,
  NotificationError,
  NotificationItem,
} from "@/components/shared/notifications";
import { taxonomyCategoryMeta } from "@/lib/supabase/taxonomy";

interface OwnerNotificationsProps {
  initialNotifications: OwnerNotification[];
  onNotificationsChange: (notifications: OwnerNotification[]) => void;
}

function persianDate(iso: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

const faNum = (n: number) => n.toLocaleString("fa-IR");

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

function getCategoryLabel(category: TaxonomyChangeRequest["category"]): string {
  const meta = taxonomyCategoryMeta.find((c) => c.id === category);
  return meta?.label ?? category;
}

function getCategoryNoun(category: TaxonomyChangeRequest["category"]): string {
  const meta = taxonomyCategoryMeta.find((c) => c.id === category);
  return meta?.noun ?? category;
}

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
  const [ownerFilter, setOwnerFilter] = useState<string>("unresolved");

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

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
    return <NotificationLoading />;
  }

  if (error) {
    return (
      <NotificationError
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const hasItems = notifications.length > 0 || taxonomyRequests.length > 0;

  if (!hasItems) {
    return <NotificationEmpty message="اعلان جدیدی وجود ندارد" />;
  }

  const newNotifs = notifications.filter((n) => !n.is_resolved);
  const oldNotifs = notifications.filter((n) => n.is_resolved);
  const visibleOwnerNotifs =
    ownerFilter === "unresolved" ? newNotifs : oldNotifs;

  const ownerFilters = [
    {
      id: "unresolved",
      label: "جدید",
      count: newNotifs.length,
      hasBadge: newNotifs.length > 0,
    },
    {
      id: "resolved",
      label: "بسته‌شده",
      count: oldNotifs.length,
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-2 sm:px-0" dir="rtl">
      {notifications.length > 0 && (
        <div className="space-y-3">
          <NotificationFilters
            filters={ownerFilters}
            activeFilter={ownerFilter}
            onFilterChange={setOwnerFilter}
          />

          {visibleOwnerNotifs.length === 0 ? (
            <NotificationEmpty
              message={
                ownerFilter === "unresolved"
                  ? "اعلان جدیدی وجود ندارد."
                  : "اعلان بسته‌شده‌ای وجود ندارد."
              }
            />
          ) : (
            <div className="space-y-2">
              {visibleOwnerNotifs.map((n) => {
                const icon = typeIcon[n.type];
                return (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    isUnread={!n.is_resolved}
                    renderContent={(notification) => (
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-lg shrink-0 mt-0.5">{icon}</span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="text-sm font-700 text-foreground">
                              {notification.heading}
                            </h5>
                            <span
                              className={`rounded-full px-2 py-0.5 text-2xs font-700 ${
                                notificationLabels[notification.type]
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {notificationLabels[notification.type] ??
                                notification.type}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground leading-6">
                            {notification.body}
                          </p>
                          <span className="mt-2 inline-flex items-center gap-1 text-2xs text-muted-foreground">
                            <Clock size={11} />
                            {persianDate(notification.created_at)}
                          </span>
                        </div>
                      </div>
                    )}
                    renderActions={(notification) =>
                      !notification.is_resolved ? (
                        <button
                          onClick={() => handleResolve(notification.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-700 text-muted-foreground transition-colors duration-150 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                        >
                          <CheckCheck size={14} />
                          بستن
                        </button>
                      ) : null
                    }
                    className={`card-elevated ${
                      !n.is_resolved ? "ring-1 ring-primary/10" : ""
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {taxonomyRequests.length > 0 && (
        <div className="space-y-3">
          <NotificationHeader
            title={`درخواست‌های تغییر گزینه‌ها (${faNum(taxonomyRequests.length)})`}
            icon={<AlertCircle size={14} className="text-warning shrink-0" />}
          />
          <div className="space-y-2">
            {taxonomyRequests.map((req) => {
              const isOpen = expanded.has(req.id);
              return (
                <div
                  key={req.id}
                  className={`card-elevated overflow-hidden transition-colors duration-150 ${
                    isOpen ? "ring-1 ring-primary/20" : ""
                  }`}
                >
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
                      className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                  </button>

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
        </div>
      )}
    </div>
  );
}
