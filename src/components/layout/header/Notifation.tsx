"use client";

import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useUserInfo } from "@/context/UserInfoProvider";
import {
  fetchUserNotifications,
  translateNotification,
  markAllNotificationsRead,
  type NotificationRow,
} from "@/lib/supabase/buyRequests";
import { supabase } from "@/lib/supabase/client";

/** Determine the user's dashboard path based on their role. */
function dashboardPath(role: string | undefined): string {
  switch (role) {
    case "OWNER":
      return "/dashboard/owner";
    case "ADMIN":
      return "/dashboard/admin";
    case "USER":
      return "/dashboard/user";
    default:
      return "/dashboard/user";
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} دقیقه پیش`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ساعت پیش`;
  return `${Math.floor(hrs / 24)} روز پیش`;
}

export default function Notification() {
  const router = useRouter();
  const { user, profile } = useUserInfo();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);

  const dashboardHref = dashboardPath(profile?.role);
  const unreadCount = notifications.filter((n) => n.is_unread).length;
  const preview = notifications.slice(0, 4);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setNotifications(
        (await fetchUserNotifications(user.id)).map(translateNotification),
      );
    } catch {
      // silently ignore
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  // Realtime subscription to keep notifications live
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel(`user-notifications-${user.id}`);

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const raw = payload.new as NotificationRow;
          setNotifications((prev) => [translateNotification(raw), ...prev]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const raw = payload.new as NotificationRow;
          setNotifications((prev) =>
            prev.map((n) => (n.id === raw.id ? translateNotification(raw) : n)),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const raw = payload.old as NotificationRow;
          setNotifications((prev) => prev.filter((n) => n.id !== raw.id));
        },
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [user?.id]);

  // When the dropdown is opened, mark notifications as read for the user
  useEffect(() => {
    if (!open || !user?.id) return;
    const hasUnread = notifications.some((n) => n.is_unread);
    if (!hasUnread) return;

    let canceled = false;
    (async () => {
      try {
        await markAllNotificationsRead(user.id);
        if (canceled) return;
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_unread: false })),
        );
      } catch {
        // ignore errors silently
      }
    })();

    return () => {
      canceled = true;
    };
  }, [open, user?.id, notifications]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Button
        variant="ghost"
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
        onClick={() => router.push(dashboardHref)}
        aria-label="اعلان‌ها"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
        )}
      </Button>

      {/* Hover dropdown */}
      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 vazir-matn"
          dir="rtl"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="absolute -top-2 left-0 right-0 h-2" />
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-xs font-700 text-foreground">
              اعلان‌ها
              {unreadCount > 0 && (
                <span className="mr-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-2xs font-700">
                  {unreadCount.toLocaleString("fa-IR")}
                </span>
              )}
            </p>
            <span
              role="button"
              className="text-2xs text-primary font-600 hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                router.push(dashboardHref);
              }}
            >
              مشاهده همه
            </span>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-auto py-1">
            {preview.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                اعلان جدیدی ندارید
              </p>
            ) : (
              preview.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`w-full flex items-start gap-3 px-4 py-3 text-right hover:bg-muted/60 transition-colors duration-100 border-b border-border/60 last:border-0 ${
                    n.is_unread ? "" : "opacity-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (n.href) router.push(n.href);
                    else router.push(dashboardHref);
                  }}
                >
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                      <Bell size={14} />
                    </div>
                    {n.is_unread && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-600 text-foreground leading-snug line-clamp-2">
                      {n.title}
                    </p>
                    <p className="text-2xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {n.description}
                    </p>
                    <span className="inline-block text-2xs text-muted-foreground/70 mt-1">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-muted/40 rounded-b-xl">
            <button
              type="button"
              className="w-full text-center text-2xs text-primary font-600 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                router.push(dashboardHref);
              }}
            >
              رفتن به داشبورد ←
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
