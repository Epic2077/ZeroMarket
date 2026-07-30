"use client";

import { CURRENT_ADMIN_ID } from "@/context/adminData";
import { useSession } from "@/context/SessionProvider";
import { Crown } from "lucide-react";
import { useEffect, useState } from "react";
import TaxonomyManager from "../management/TaxonomyManager";
import UserManagementTable from "../management/UserManagementTable";
import AdminAssignments from "./AdminAssignments";
import OwnerOverview from "./OwnerOverview";
import OwnerNotifications from "./OwnerNotifications";
import ProductsCatalog from "./ProductsCatalog";
import { useUserInfo } from "@/context/UserInfoProvider";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import {
  fetchOwnerNotifications,
  type OwnerNotification,
} from "@/lib/supabase/taxonomy";

const tabs = [
  { id: "overview", label: "مرور کلی" },
  { id: "users", label: "کاربران" },
  { id: "posts", label: "آگهی‌ها" },
  { id: "admins", label: "مدیران و دسترسی‌ها" },
  { id: "options", label: "گزینه‌های ثبت آگهی" },
  { id: "notifications", label: "اعلان‌ها" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function OwnerDashboard() {
  const { profile } = useUserInfo();
  const { setViewer } = useSession();
  const [active, setActive] = useState<TabId>("overview");
  const [notifications, setNotifications] = useState<OwnerNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const {
    users: apiUsers,
    total: usersTotal,
    page: usersPage,
    limit: usersLimit,
    loading: usersLoading,
    error: usersError,
    goToPage,
    setPageSize,
  } = useAdminUsers(1, 20);

  // Acting as the owner while on this panel.
  useEffect(() => {
    setViewer({ role: "owner", adminId: CURRENT_ADMIN_ID });
  }, [setViewer]);

  // Fetch notifications for badge count only (lightweight)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setNotificationsLoading(true);
      try {
        const data = await fetchOwnerNotifications();
        if (!cancelled) setNotifications(data);
      } catch {
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setNotificationsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = notifications.length;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center text-warning shrink-0">
            <Crown size={26} />
          </div>
          <div>
            <div className="flex gap-2 items-center">
              <h1 className="text-2xl font-800 text-foreground">پنل مالک</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-negotiable/10 text-negotiable text-2xs font-700">
                {profile?.full_name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              دسترسی کامل به کاربران، آگهی‌ها و مدیران پلتفرم
            </p>
          </div>
        </div>
        {/* <Link href="/dashboard/admin" className="btn-secondary text-sm">
          نمای پنل مدیر
        </Link> */}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto overflow-y-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-600 transition-colors duration-150 border-b-2 -mb-px ${
              active === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.id === "notifications" &&
              unreadCount > 0 &&
              !notificationsLoading && (
                <span className="absolute top-0 left-0 w-4 h-4 z-10 rounded-full bg-danger flex items-center justify-center text-xs font-700 text-white">
                  {unreadCount > 9 ? "۹+" : unreadCount.toLocaleString("fa-IR")}
                </span>
              )}
          </button>
        ))}
      </div>

      {active === "overview" && <OwnerOverview />}
      {active === "users" && (
        <UserManagementTable
          users={apiUsers}
          loading={usersLoading}
          emptyText={usersError ?? "کاربری یافت نشد."}
          total={usersTotal}
          page={usersPage}
          pageSize={usersLimit}
          onPageChange={goToPage}
          onPageSizeChange={setPageSize}
        />
      )}
      {active === "posts" && <ProductsCatalog />}
      {active === "admins" && <AdminAssignments />}
      {active === "options" && <TaxonomyManager />}
      {active === "notifications" && (
        <OwnerNotifications
          initialNotifications={notifications}
          onNotificationsChange={setNotifications}
        />
      )}
    </div>
  );
}
