"use client";

import { NotificationErrorProps } from "./NotificationTypes";

export function NotificationError({
  message,
  onRetry,
  className,
}: NotificationErrorProps) {
  return (
    <div className={`card-elevated p-8 text-center ${className ?? ""}`}>
      <p className="text-sm text-danger mb-3">خطا: {message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          تلاش مجدد
        </button>
      )}
    </div>
  );
}