"use client";

import { useUserInfo } from "@/context/UserInfoProvider";
import {
  describeChangeRequest,
  fetchMyTaxonomyChangeRequests,
  type TaxonomyChangeRequest,
} from "@/lib/supabase/taxonomy";
import {
  getAllNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationKind,
  type UserNotification,
} from "@/lib/supabase/userNotifications";
import { Bell, CheckCheck, Clock, MailOpen, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  NotificationFilters,
  NotificationHeader,
  NotificationEmpty,
  NotificationLoading,
  NotificationError,
  NotificationItem,
  NotificationAction,
} from "@/components/shared/notifications";

const faNum = (n: number) => n.toLocaleString("fa-IR");

const kindStyles: Record<
  NotificationKind,
  { label: string; className: string }
> = {
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

const requestStatusStyles: Record<
  TaxonomyChangeRequest["status"],
  { label: string; className: string }
> = {
  PENDING: {
    label: "در انتظار بررسی",
    className: "bg-warning/10 text-warning",
  },
  APPROVED: { label: "تایید شد", className: "bg-success/10 text-success" },
  REJECTED: { label: "رد شد", className: "bg-danger/10 text-danger" },
};

function persianDate(iso: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function AdminNotifications() {
  const { user } = useUserInfo();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [myRequests, setMyRequests] = useState<TaxonomyChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>("unread");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [notifs, requests] = await Promise.all([
          getAllNotifications(50),
          user ? fetchMyTaxonomyChangeRequests(user.id) : Promise.resolve([]),
        ]);
        if (!cancelled) {
          setNotifications(notifs);
          setMyRequests(requests);
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
  }, [user]);

  const unreadList = notifications.filter((n) => n.is_unread);
  const readList = notifications.filter((n) => !n.is_unread);
  const unreadCount = unreadList.length;
  const visible = filter === "unread" ? unreadList : readList;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_unread: false } : n)),
      );
      toast.success("اعلان به‌عنوان خوانده‌شده ثبت شد");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "خطا در بروزرسانی اعلان",
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_unread: false })));
      toast.success("همه اعلان‌ها خوانده شدند");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "خطا در بروزرسانی اعلان‌ها",
      );
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

  const hasItems = notifications.length > 0 || myRequests.length > 0;

  if (!hasItems) {
    return <NotificationEmpty message="اعلان جدیدی وجود ندارد" />;
  }

  const notificationFilters = filters.map((f) => ({
    id: f.id,
    label: f.label,
    count: f.id === "unread" ? unreadList.length : readList.length,
    hasBadge: f.id === "unread" && unreadCount > 0,
  }));

  const headerActions: NotificationAction[] = [
    {
      label: "خواندن همه",
      onClick: handleMarkAllAsRead,
      disabled: unreadCount === 0,
      icon: <CheckCheck size={16} />,
      variant: "secondary",
    },
  ];

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <NotificationHeader
        title="اعلان‌های شخصی"
        subtitle={
          <>
            {faNum(unreadCount)} اعلان خوانده‌نشده از{" "}
            {faNum(notifications.length)} مورد
          </>
        }
        icon={<Bell size={14} className="text-primary shrink-0" />}
        actions={headerActions}
      />

      <NotificationFilters
        filters={notificationFilters}
        activeFilter={filter}
        onFilterChange={(id) => setFilter(id as FilterId)}
      />

      {visible.length === 0 ? (
        <NotificationEmpty
          message={
            filter === "unread"
              ? "اعلان خوانده‌نشده‌ای ندارید."
              : "اعلان خوانده‌شده‌ای وجود ندارد."
          }
        />
      ) : (
        <div className="card-elevated overflow-hidden divide-y divide-border">
          {visible.map((notification) => {
            const kind = kindStyles[notification.kind];
            return (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isUnread={notification.is_unread}
                renderContent={(n) => (
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        n.is_unread ? "bg-background shadow-sm" : "bg-muted"
                      }`}
                    >
                      <Bell size={18} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-700 text-foreground">
                          {n.title}
                        </h3>
                        {n.is_unread && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-2xs font-700 ${kind.className}`}
                        >
                          {kind.label}
                        </span>
                      </div>
                      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                        {n.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-2xs text-muted-foreground">
                        <span>{persianDate(n.created_at)}</span>
                      </div>
                    </div>
                  </div>
                )}
                renderActions={(n) =>
                  n.is_unread ? (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
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

      {myRequests.length > 0 && (
        <section className="space-y-3">
          <NotificationHeader
            title={`درخواست‌های تغییر گزینه‌های من (${faNum(myRequests.length)})`}
            icon={<Tag size={14} className="text-negotiable shrink-0" />}
          />
          <div className="card-elevated overflow-hidden divide-y divide-border">
            {myRequests.map((req) => {
              const status = requestStatusStyles[req.status];
              return (
                <NotificationItem
                  key={req.id}
                  notification={req}
                  renderContent={(r) => (
                    <div className="min-w-0">
                      <p className="text-sm font-700 text-foreground">
                        {describeChangeRequest(r)}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-2xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {persianDate(r.created_at)}
                        </span>
                      </div>
                    </div>
                  )}
                  renderActions={() => (
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-2xs font-700 ${status.className}`}
                    >
                      {status.label}
                    </span>
                  )}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
