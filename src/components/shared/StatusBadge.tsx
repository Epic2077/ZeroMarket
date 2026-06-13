import React from "react";

type StatusType =
  | "active"
  | "pending"
  | "sold"
  | "negotiable"
  | "reserved"
  | "approved"
  | "declined"
  | "draft";

interface StatusBadgeProps {
  status: StatusType;
}

const statusConfig: Record<
  StatusType,
  { label: string; className: string; dot: string }
> = {
  active: { label: "موجود", className: "status-active", dot: "bg-success" },
  pending: {
    label: "در انتظار",
    className: "status-pending",
    dot: "bg-warning",
  },
  sold: { label: "فروخته شده", className: "status-sold", dot: "bg-danger" },
  negotiable: {
    label: "قابل مذاکره",
    className: "status-negotiable",
    dot: "bg-negotiable",
  },
  reserved: {
    label: "رزرو شده",
    className: "status-reserved",
    dot: "bg-primary",
  },
  approved: {
    label: "تایید شده",
    className: "status-active",
    dot: "bg-success",
  },
  declined: { label: "رد شده", className: "status-sold", dot: "bg-danger" },
  draft: {
    label: "پیش‌نویس",
    className: "status-pending",
    dot: "bg-muted-foreground",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={config.className}>
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full ${config.dot}`}
      ></span>
      {config.label}
    </span>
  );
}
