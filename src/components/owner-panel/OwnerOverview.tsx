"use client";

import { useAdmin } from "@/context/AdminProvider";
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
import type { ReactNode } from "react";

const faNum = (n: number) => n.toLocaleString("fa-IR");

export default function OwnerOverview() {
  const { users, admins } = useAdmin();
  const { listings } = useListings();

  const sellers = users.filter((u) => u.role !== "buyer");
  const confirmed = users.filter((u) => u.role === "confirmed_seller");
  const suspended = users.filter((u) => u.status === "suspended");
  const totalPosts = listings.length;
  const salesVolume = users.reduce(
    (sum, u) => sum + u.analytics.salesVolume,
    0,
  );

  const stats: {
    id: string;
    label: string;
    value: ReactNode;
    icon: ReactNode;
  }[] = [
    {
      id: "users",
      label: "کل کاربران",
      value: faNum(users.length),
      icon: <Users size={18} className="text-primary" />,
    },
    {
      id: "sellers",
      label: "فروشندگان",
      value: faNum(sellers.length),
      icon: <Store size={18} className="text-accent" />,
    },
    {
      id: "confirmed",
      label: "فروشندگان تأییدشده",
      value: faNum(confirmed.length),
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
            <div className="stat-value text-2xl">{stat.value}</div>
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
