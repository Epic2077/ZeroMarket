"use client";

import { NotificationFiltersProps } from "./NotificationTypes";

export function NotificationFilters({
  filters,
  activeFilter,
  onFilterChange,
  className,
}: NotificationFiltersProps) {
  return (
    <div className={`flex items-center gap-1 border-b border-border ${className ?? ""}`}>
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onFilterChange(f.id)}
          className={`relative whitespace-nowrap px-4 py-2 text-sm font-600 transition-colors duration-150 border-b-2 -mb-px ${
            activeFilter === f.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {f.label}
          <span className="mr-1.5 text-2xs text-muted-foreground">
            ({f.count.toLocaleString("fa-IR")})
          </span>
          {f.hasBadge && (
            <span className="absolute top-1.5 left-1.5 h-2 w-2 rounded-full bg-danger" />
          )}
        </button>
      ))}
    </div>
  );
}