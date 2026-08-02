"use client";

import { Loader2 } from "lucide-react";
import { NotificationLoadingProps } from "./NotificationTypes";

export function NotificationLoading({
  message = "در حال بارگذاری اعلان‌ها…",
  className,
}: NotificationLoadingProps) {
  return (
    <div className={`card-elevated p-12 flex items-center justify-center gap-2 text-sm text-muted-foreground ${className ?? ""}`}>
      <Loader2 size={18} className="animate-spin text-primary" />
      {message}
    </div>
  );
}