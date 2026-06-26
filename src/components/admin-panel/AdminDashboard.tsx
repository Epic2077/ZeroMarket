"use client";

import { useAdmin } from "@/context/AdminProvider";
import { CURRENT_ADMIN_ID } from "@/context/adminData";
import { useListings } from "@/context/ListingsProvider";
import { useSession } from "@/context/SessionProvider";
import { FileText, ShieldHalf, Store, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import TaxonomyManager from "../management/TaxonomyManager";
import UserManagementTable from "../management/UserManagementTable";

const faNum = (n: number) => n.toLocaleString("fa-IR");

const tabs = [
  { id: "users", label: "کاربران من" },
  { id: "options", label: "گزینه‌های ثبت آگهی" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function AdminDashboard() {
  const { admins, users } = useAdmin();
  const { listingsByOwner } = useListings();
  const { setViewer } = useSession();
  const [active, setActive] = useState<TabId>("users");

  // Acting as this admin while on the admin panel.
  useEffect(() => {
    setViewer({ role: "admin", adminId: CURRENT_ADMIN_ID });
  }, [setViewer]);

  const admin = admins.find((a) => a.id === CURRENT_ADMIN_ID) ?? admins[0];
  const assignedUsers = users.filter((u) =>
    admin?.assignedUserIds.includes(u.id),
  );

  const sellerCount = assignedUsers.filter((u) => u.role !== "buyer").length;
  const postCount = assignedUsers.reduce(
    (sum, u) => sum + listingsByOwner(u.id).length,
    0,
  );

  const stats: { id: string; label: string; value: string; icon: ReactNode }[] =
    [
      {
        id: "assigned",
        label: "کاربران اختصاص‌یافته",
        value: faNum(assignedUsers.length),
        icon: <Users size={18} className="text-primary" />,
      },
      {
        id: "sellers",
        label: "فروشندگان",
        value: faNum(sellerCount),
        icon: <Store size={18} className="text-accent" />,
      },
      {
        id: "posts",
        label: "آگهی‌های تحت مدیریت",
        value: faNum(postCount),
        icon: <FileText size={18} className="text-warning" />,
      },
    ];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-negotiable/15 text-negotiable flex items-center justify-center font-800 text-lg flex-shrink-0">
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
              مدیریت پروفایل و آگهی‌های کاربرانِ اختصاص‌یافته
            </p>
          </div>
        </div>
        <Link href="/dashboard/owner" className="btn-secondary text-sm">
          نمای پنل مالک
        </Link>
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
          users={assignedUsers}
          emptyText="هنوز کاربری به شما اختصاص نیافته است."
        />
      )}
      {active === "options" && <TaxonomyManager />}
    </div>
  );
}
