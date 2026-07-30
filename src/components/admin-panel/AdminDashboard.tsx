"use client";

import { useAdmin } from "@/context/AdminProvider";
import { CURRENT_ADMIN_ID } from "@/context/adminData";
import { useSession } from "@/context/SessionProvider";
import { FileText, ShieldHalf, Users } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import TaxonomyManager from "../management/TaxonomyManager";
import UserManagementTable from "../management/UserManagementTable";
import { useAdminUsers } from "@/hooks/useAdminUsers";

const faNum = (n: number) => n.toLocaleString("fa-IR");

const tabs = [
  { id: "users", label: "کاربران من" },
  { id: "options", label: "گزینه‌های ثبت آگهی" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function AdminDashboard() {
  const { admins } = useAdmin();
  const { setViewer } = useSession();
  const [active, setActive] = useState<TabId>("users");
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

  // Acting as this admin while on the admin panel.
  useEffect(() => {
    setViewer({ role: "admin", adminId: CURRENT_ADMIN_ID });
  }, [setViewer]);

  const admin = admins.find((a) => a.id === CURRENT_ADMIN_ID) ?? admins[0];

  const totalUsers = usersTotal;
  const adminCount = apiUsers.filter(
    (u) => u.role === "ADMIN" || u.role === "OWNER",
  ).length;

  const stats: { id: string; label: string; value: string; icon: ReactNode }[] =
    [
      {
        id: "assigned",
        label: "کل کاربران",
        value: faNum(totalUsers),
        icon: <Users size={18} className="text-primary" />,
      },
      {
        id: "admins",
        label: "مدیران",
        value: faNum(adminCount),
        icon: <ShieldHalf size={18} className="text-negotiable" />,
      },
      {
        id: "posts",
        label: "آگهی‌های تحت مدیریت",
        value: faNum(0),
        icon: <FileText size={18} className="text-warning" />,
      },
    ];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-negotiable/15 text-negotiable flex items-center justify-center font-800 text-lg shrink-0">
            {admin?.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-800 text-foreground">پنل مدیر</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-negotiable/10 text-negotiable text-2xs font-700">
                <ShieldHalf size={11} />
                {admin?.name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              مدیریت پروفایل و آگهی‌های همه کاربران پلتفرم
            </p>
          </div>
        </div>
        {/* <Link href="/dashboard/owner" className="btn-secondary text-sm">
          نمای پنل مالک
        </Link> */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="card-elevated p-5">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mb-3">
              {stat.icon}
            </div>
            <div className="stat-value text-2xl">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-600 transition-colors duration-150 border-b-2 -mb-px ${
              active === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
      {active === "options" && <TaxonomyManager />}
    </div>
  );
}
