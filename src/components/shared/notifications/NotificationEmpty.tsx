"use client";

import { Bell } from "lucide-react";
import { NotificationEmptyProps } from "./NotificationTypes";

export function NotificationEmpty({
  message,
  icon,
  className,
}: NotificationEmptyProps) {
  return (
    <div className={`card-elevated p-12 text-center ${className ?? ""}`}>
      {icon ?? (
        <Bell
          size={32}
          className="text-muted-foreground mx-auto mb-3 opacity-40"
        />
      )}
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}