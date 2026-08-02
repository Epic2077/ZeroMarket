"use client";

import { NotificationItemProps } from "./NotificationTypes";

export function NotificationItem<T>({
  notification,
  renderContent,
  renderActions,
  className,
  isUnread,
}: NotificationItemProps<T>) {
  return (
    <div
      className={`px-5 py-4 transition-colors duration-150 hover:bg-muted/30 ${
        isUnread ? "bg-primary/5" : ""
      } ${className ?? ""}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="min-w-0">{renderContent(notification)}</div>
        </div>
        {renderActions && (
          <div className="self-start">{renderActions(notification)}</div>
        )}
      </div>
    </div>
  );
}