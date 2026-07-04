"use client";

import { Bell, CheckCheck, ExternalLink, MailOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { userNotifications } from "@/context/userProfile";

const kindStyles: Record<
  "request" | "price" | "saved" | "system",
  { label: string; className: string }
> = {
  request: { label: "درخواست", className: "bg-primary/10 text-primary" },
  price: { label: "قیمت", className: "bg-warning/10 text-warning" },
  saved: { label: "ذخیره‌شده", className: "bg-success/10 text-success" },
  system: { label: "سیستم", className: "bg-accent/10 text-accent" },
};

const faNum = (n: number) => n.toLocaleString("fa-IR");

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState(userNotifications);

  const unreadCount = notifications.filter((item) => item.unread).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    );
    toast.success("اعلان به‌عنوان خوانده‌شده ثبت شد");
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, unread: false })),
    );
    toast.success("همه اعلان‌ها خوانده شدند");
  };

  return (
    <div className="card-elevated overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-700 text-foreground">اعلان‌های شما</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {faNum(unreadCount)} اعلان خوانده‌نشده از{" "}
            {faNum(notifications.length)} مورد
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="btn-secondary text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck size={16} />
          خواندن همه
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
          اعلان فعالی ندارید.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {notifications.map((notification) => {
            const kind = kindStyles[notification.kind];
            return (
              <div
                key={notification.id}
                className={`px-5 py-4 transition-colors duration-150 hover:bg-muted/30 ${notification.unread ? "bg-primary/5" : ""}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${notification.unread ? "bg-background shadow-sm" : "bg-muted"}`}
                    >
                      {notification.icon ?? (
                        <Bell size={18} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-700 text-foreground">
                          {notification.title}
                        </h3>
                        {notification.unread && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-2xs font-700 ${kind.className}`}
                        >
                          {kind.label}
                        </span>
                      </div>
                      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                        {notification.body}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-2xs text-muted-foreground">
                        <span>{notification.time}</span>
                        {notification.href && (
                          <Link
                            href={notification.href}
                            className="inline-flex items-center gap-1 font-600 text-primary hover:underline"
                          >
                            {notification.actionLabel ?? "مشاهده"}
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => markAsRead(notification.id)}
                    disabled={!notification.unread}
                    className="inline-flex items-center gap-2 self-start rounded-lg border border-border px-3 py-2 text-xs font-700 text-muted-foreground transition-colors duration-150 hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MailOpen size={14} />
                    {notification.unread
                      ? "علامت به‌عنوان خوانده‌شده"
                      : "خوانده‌شده"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
