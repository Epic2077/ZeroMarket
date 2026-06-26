"use client";

import { useAdmin } from "@/context/AdminProvider";
import { CURRENT_ADMIN_ID } from "@/context/adminData";
import { useSession } from "@/context/SessionProvider";
import { Crown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import TaxonomyManager from "../management/TaxonomyManager";
import UserManagementTable from "../management/UserManagementTable";
import AdminAssignments from "./AdminAssignments";
import OwnerOverview from "./OwnerOverview";
import ProductsCatalog from "./ProductsCatalog";

const tabs = [
  { id: "overview", label: "مرور کلی" },
  { id: "users", label: "کاربران" },
  { id: "posts", label: "آگهی‌ها" },
  { id: "admins", label: "مدیران و دسترسی‌ها" },
  { id: "options", label: "گزینه‌های ثبت آگهی" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function OwnerDashboard() {
  const { users } = useAdmin();
  const { setViewer } = useSession();
  const [active, setActive] = useState<TabId>("overview");

  // Acting as the owner while on this panel.
  useEffect(() => {
    setViewer({ role: "owner", adminId: CURRENT_ADMIN_ID });
  }, [setViewer]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center text-warning flex-shrink-0">
            <Crown size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-800 text-foreground">پنل مالک</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              دسترسی کامل به کاربران، آگهی‌ها و مدیران پلتفرم
            </p>
          </div>
        </div>
        <Link href="/dashboard/admin" className="btn-secondary text-sm">
          نمای پنل مدیر
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto overflow-y-hidden">
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

      {active === "overview" && <OwnerOverview />}
      {active === "users" && <UserManagementTable users={users} />}
      {active === "posts" && <ProductsCatalog />}
      {active === "admins" && <AdminAssignments />}
      {active === "options" && <TaxonomyManager />}
    </div>
  );
}
