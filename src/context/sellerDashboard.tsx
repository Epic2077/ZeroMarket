export type RequestStatus =
  | "pending"
  | "approved"
  | "declined"
  | "negotiable"
  | "completed"
  | "closed";

export const requestStatusMap: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  pending: { label: "در انتظار", className: "status-pending" },
  approved: { label: "تأیید شده", className: "status-active" },
  declined: { label: "رد شده", className: "status-sold" },
  negotiable: { label: "قابل مذاکره", className: "status-negotiable" },
  completed: { label: "تکمیل شده", className: "status-completed" },
  closed: { label: "بسته شد", className: "status-completed" },
};

export const dashboardTabs = [
  { id: "listings", label: "آگهی‌های من" },
  { id: "summary", label: "اعلان ها" },
  { id: "requests", label: "درخواست‌ها" },
  { id: "analytics", label: "تحلیل‌ها" },
] as const;

export type DashboardTabId = (typeof dashboardTabs)[number]["id"];
