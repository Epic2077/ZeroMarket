"use client";

import { Button } from "@/components/ui/button";
import { userNotifications } from "@/context/userProfile";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Notification() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const hasUnread = userNotifications.some((n) => n.unread);
  const preview = userNotifications.slice(0, 4);
  const unreadCount = userNotifications.filter((n) => n.unread).length;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Button
        variant="ghost"
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
        onClick={() => router.push("/dashboard/user")}
        aria-label="اعلان‌ها"
      >
        <Bell size={18} />
        {hasUnread && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
        )}
      </Button>

      {/* Hover dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 w-80 bg-card border border-border rounded-xl shadow-xl z-50 vazir-matn"
          dir="rtl"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {/* Invisible bridge — prevents gap between bell and dropdown */}
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
                router.push("/dashboard/user");
              }}
            >
              مشاهده همه
            </span>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-auto py-1">
            {preview.map((n) => (
              <button
                key={n.id}
                type="button"
                className="w-full flex items-start gap-3 px-4 py-3 text-right hover:bg-muted/60 transition-colors duration-100 border-b border-border/60 last:border-0"
                onClick={(e) => {
                  e.stopPropagation();
                  if (n.href) router.push(n.href);
                  else router.push("/dashboard/user");
                }}
              >
                {/* Icon + unread dot */}
                <div className="relative shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    {n.icon ?? <Bell size={14} />}
                  </div>
                  {n.unread && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-600 text-foreground leading-snug line-clamp-2">
                    {n.title}
                  </p>
                  <p className="text-2xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {n.body}
                  </p>
                  <span className="inline-block text-2xs text-muted-foreground/70 mt-1">
                    {n.time}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-muted/40 rounded-b-xl">
            <button
              type="button"
              className="w-full text-center text-2xs text-primary font-600 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                router.push("/dashboard/user");
              }}
            >
              رفتن به داشبورد کاربری ←
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
