"use client";

import { useListings } from "@/context/ListingsProvider";
import { formatPrice } from "@/context/data";
import {
  BadgeCheck,
  Ban,
  FileText,
  ShieldHalf,
  Store,
  Users,
} from "lucide-react";
import { type ReactNode } from "react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Spinner } from "../ui/spinner";

const faNum = (n: number) => n.toLocaleString("fa-IR");

export default function OwnerOverview() {
  const { listings } = useListings();

  // ── Live admin API demo ──────────────────────────────────────────────
  const {
    users: apiUsers,
    total: apiTotal,
    loading: apiLoading,
    error: apiError,
  } = useAdminUsers(1, 5);

  const totalUsers = apiLoading || apiError ? null : apiTotal;

  const verified = new Set(apiUsers.filter((l) => l.verified).map((l) => l.id))
    .size;
  const regularUsers =
    totalUsers === null ? null : Math.max(totalUsers - verified, 0);
  const suspended = apiUsers.filter((u) => u.status === "SUSPENDED");
  const totalPosts = listings.length;
  const salesVolume = 0;

  const admins = apiUsers.filter((u) => u.role === "ADMIN");

  const stats: {
    id: string;
    label: string;
    value: ReactNode;
    icon: ReactNode;
  }[] = [
    {
      id: "users",
      label: "کل کاربران",
      value: totalUsers === null ? "—" : faNum(totalUsers),
      icon: <Users size={18} className="text-primary" />,
    },
    {
      id: "Sells",
      label: "کاربران عادی",
      value: regularUsers === null ? "—" : faNum(regularUsers),
      icon: <Store size={18} className="text-accent" />,
    },
    {
      id: "confirmed",
      label: "فروشندگان تأییدشده",
      value: verified === null ? "—" : faNum(verified),
      icon: <BadgeCheck size={18} className="text-success" />,
    },
    {
      id: "posts",
      label: "کل آگهی‌ها",
      value: faNum(totalPosts),
      icon: <FileText size={18} className="text-warning" />,
    },
    {
      id: "admins",
      label: "مدیران",
      value: faNum(admins.length),
      icon: <ShieldHalf size={18} className="text-negotiable" />,
    },
    {
      id: "suspended",
      label: "حساب‌های معلق",
      value: faNum(suspended.length),
      icon: <Ban size={18} className="text-danger" />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.id} className="card-elevated p-5">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mb-3">
              {stat.icon}
            </div>
            {apiLoading || apiError ? (
              <Spinner className="size-6 text-2xl" />
            ) : (
              <div className="stat-value text-2xl">{stat.value}</div>
            )}
            <div className="text-xs text-muted-foreground mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="card-elevated p-6 flex items-center justify-between bg-foreground text-white">
        <div>
          <div className="text-xs text-muted-foreground">
            حجم کل فروش پلتفرم
          </div>
          <div className="text-foreground text-3xl mt-1">
            {salesVolume.toLocaleString()}{" "}
            <span className="text-sm text-slate-400">تومان</span>
            <p className="text-sm text-muted-foreground">
              {formatPrice(salesVolume)}
            </p>
          </div>
        </div>
        <Store size={40} className="text-accent/70" />
      </div>
    </div>
  );
}
