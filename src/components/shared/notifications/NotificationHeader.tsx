"use client";

import { NotificationHeaderProps, NotificationAction } from "./NotificationTypes";

function ActionButton({ action }: { action: NotificationAction }) {
  const baseClasses =
    "inline-flex items-center justify-center gap-1.5 text-sm font-700 transition-colors duration-150 rounded-lg";
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "text-danger hover:bg-danger/10 border-danger/30",
  };
  const disabledClasses = "disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <button
      onClick={action.onClick}
      disabled={action.disabled}
      className={`${baseClasses} ${variantClasses[action.variant ?? "secondary"]} ${disabledClasses} ${
        action.className ?? ""
      }`}
    >
      {action.icon}
      {action.label}
    </button>
  );
}

export function NotificationHeader({
  title,
  subtitle,
  icon,
  actions,
  className,
}: NotificationHeaderProps) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}>
      <div>
        <h4 className="text-sm font-700 text-foreground flex items-center gap-2">
          {icon}
          {title}
        </h4>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action, index) => (
            <ActionButton key={index} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}