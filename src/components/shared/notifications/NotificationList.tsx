"use client";

import { NotificationListProps } from "./NotificationTypes";
import { NotificationEmpty } from "./NotificationEmpty";

export function NotificationList<T>({
  items,
  renderItem,
  emptyMessage = "اعلان جدیدی وجود ندارد",
  emptyIcon,
  className,
  divider = false,
}: NotificationListProps<T>) {
  if (items.length === 0) {
    return <NotificationEmpty message={emptyMessage} icon={emptyIcon} />;
  }

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`${divider ? "border-t border-border pt-4" : ""} ${
            index === 0 && !divider ? "" : ""
          }`}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}