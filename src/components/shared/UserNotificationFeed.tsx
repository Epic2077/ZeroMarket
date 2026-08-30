"use client";

import {
  Bell,
  CheckCheck,
  ExternalLink,
  Loader2,
  MailOpen,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  fetchUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  translateNotification,
  type NotificationRow,
} from "@/lib/supabase/buyRequests";
import {
  NotificationFilters,
  NotificationHeader,
  NotificationEmpty,
  NotificationLoading,
  NotificationError,
  NotificationItem,
} from "@/components/shared/notifications";

const faNum = (n: number) => n.toLocaleString("fa-IR");

const kindStyles: Record<string, { label: string; className: string }> = {
  REQUEST: { label: "درخواست", className: "bg-primary/10 text-primary" },
  PRICE: { label: "قیمت", className: "bg-warning/10 text-warning" },
  SAVED: { label: "ذخیره‌شده", className: "bg-success/10 text-success" },
  SYSTEM: { label: "سیستم", className: "bg-accent/10 text-accent" },
};

const filters = [
  { id: "unread", label: "خوانده‌نشده" },
  { id: "read", label: "خوانده‌شده" },
] as const;

type FilterId = (typeof filters)[number]["id"];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} دقیقه پیش`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ساعت پیش`;
  return `${Math.floor(hrs / 24)} روز پیش`;
}

interface Props {
  userId: string;
  /** When true, show only the compact list without header/filters (for embedding). */
  compact?: boolean;
  /** Max items to show in compact mode. */
  maxItems?: number;
  /** External refresh trigger. */
  refreshKey?: number;
}

export default function UserNotificationFeed({
  userId,
  compact = false,
  maxItems,
  refreshKey,
}: Props) {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>("unread");

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      setNotifications(
        (await fetchUserNotifications(userId)).map(translateNotification),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت اعلان‌ها");
    } finally {
      setLoading(false);
    }
  }, [userId, refreshKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadList = notifications.filter((n) => n.is_unread);
  const readList = notifications.filter((n) => !n.is_unread);
  const unreadCount = unreadList.length;
  const visible = filter === "unread" ? unreadList : readList;
  const displayed = maxItems ? visible.slice(0, maxItems) : visible;

  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_unread: false } : n)),
      );
    } catch {
      toast.error("خطا در به‌روزرسانی");
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_unread: false })));
      toast.success("همه اعلان‌ها خوانده شدند");
    } catch {
      toast.error("خطا در به‌روزرسانی");
    }
  };

  // ── Compact mode (for embedding in OverviewTab, etc.) ───────────
  if (compact) {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        </div>
      );
    }

    const top = unreadList.slice(0, maxItems ?? 3);

    return (
      <div className="divide-y divide-border">
        {top.length === 0 ? (
          <NotificationEmpty message="اعلان جدیدی ندارید" />
        ) : (
          top.map((n) => {
            const kind = kindStyles[n.kind] ?? kindStyles.SYSTEM;
            return (
              <NotificationItem
                key={n.id}
                notification={n}
                isUnread
                renderContent={(notification) => (
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <span className="text-sm font-600 text-foreground truncate">
                        {notification.title}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-2xs font-700 shrink-0 ${kind.className}`}
                      >
                        {kind.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.description}
                    </p>
                    <span className="text-2xs text-muted-foreground">
                      {timeAgo(notification.created_at)}
                    </span>
                  </div>
                )}
                renderActions={(notification) => (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="inline-flex items-center gap-1 text-2xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MailOpen size={12} />
                    خوانده شد
                  </button>
                )}
              />
            );
          })
        )}
      </div>
    );
  }

  // ── Full mode ────────────────────────────────────────────────────
  if (loading) {
    return <NotificationLoading />;
  }

  if (error) {
    return <NotificationError message={error} onRetry={() => load()} />;
  }

  if (notifications.length === 0) {
    return <NotificationEmpty message="اعلان جدیدی وجود ندارد" />;
  }

  const notificationFilters = filters.map((f) => ({
    id: f.id,
    label: f.label,
    count: f.id === "unread" ? unreadList.length : readList.length,
    hasBadge: f.id === "unread" && unreadCount > 0,
  }));

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <NotificationHeader
        title="اعلان‌های شما"
        subtitle={
          <>
            {faNum(unreadCount)} اعلان خوانده‌نشده از{" "}
            {faNum(notifications.length)} مورد
          </>
        }
        icon={<Bell size={14} className="text-primary shrink-0" />}
        actions={[
          {
            label: "خواندن همه",
            onClick: markAllAsRead,
            disabled: unreadCount === 0,
            icon: <CheckCheck size={16} />,
            variant: "secondary",
          },
        ]}
      />

      <NotificationFilters
        filters={notificationFilters}
        activeFilter={filter}
        onFilterChange={(id) => setFilter(id as FilterId)}
      />

      {displayed.length === 0 ? (
        <NotificationEmpty
          message={
            filter === "unread"
              ? "اعلان خوانده‌نشده‌ای ندارید."
              : "اعلان خوانده‌شده‌ای وجود ندارد."
          }
        />
      ) : (
        <div className="card-elevated overflow-hidden divide-y divide-border">
          {displayed.map((n) => {
            const kind = kindStyles[n.kind] ?? kindStyles.SYSTEM;
            return (
              <NotificationItem
                key={n.id}
                notification={n}
                isUnread={n.is_unread}
                className={n.is_unread ? "" : "opacity-50 grayscale-[0.3]"}
                renderContent={(notification) => (
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        notification.is_unread
                          ? "bg-background shadow-sm"
                          : "bg-muted"
                      }`}
                    >
                      <Bell size={18} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-700 text-foreground">
                          {notification.title}
                        </h3>
                        {notification.is_unread && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-2xs font-700 ${kind.className}`}
                        >
                          {kind.label}
                        </span>
                      </div>
                      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                        {notification.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-2xs text-muted-foreground">
                        <span>{timeAgo(notification.created_at)}</span>
                        {notification.href && (
                          <Link
                            href={notification.href}
                            className="inline-flex items-center gap-1 font-600 text-primary hover:underline"
                          >
                            مشاهده
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                renderActions={(notification) =>
                  notification.is_unread ? (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-700 text-muted-foreground transition-colors duration-150 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    >
                      <MailOpen size={14} />
                      خوانده شد
                    </button>
                  ) : null
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
