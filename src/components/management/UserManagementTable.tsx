"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { roleLabel } from "@/context/adminData";
import { toFa } from "@/context/carLabels";
import { formatPrice } from "@/context/data";
import { useListings } from "@/context/ListingsProvider";
import type { PlatformRole, PlatformUser } from "@/types/admin";
import { Ban, ChevronLeft, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import RoleBadge from "./RoleBadge";

interface Props {
  users: PlatformUser[];
  emptyText?: string;
}

type RoleFilter = "all" | PlatformRole;
type StatusFilter = "all" | "active" | "suspended";

const roleFilters: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "همه نقش‌ها" },
  { value: "buyer", label: roleLabel.buyer },
  { value: "seller", label: roleLabel.seller },
  { value: "confirmed_seller", label: roleLabel.confirmed_seller },
];

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "active", label: "فعال" },
  { value: "suspended", label: "معلق" },
];

export default function UserManagementTable({
  users,
  emptyText = "کاربری یافت نشد.",
}: Props) {
  const router = useRouter();
  const { listingsByOwner } = useListings();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (status !== "all" && u.status !== status) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q)
      );
    });
  }, [users, query, role, status]);

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جست‌وجوی نام، ایمیل یا شهر…"
            className="w-full h-10 rounded-xl border border-border bg-card pr-9 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="پاک کردن"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {roleFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setRole(f.value)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-600 transition-colors duration-150 ${
                role === f.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
          <div className="w-px h-5 bg-border mx-0.5 shrink-0" />
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-600 transition-colors duration-150 ${
                status === f.value
                  ? "bg-foreground text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="px-4 py-2.5 text-2xs font-700 text-muted-foreground bg-muted/40 border-b border-border">
          {filtered.length.toLocaleString("fa-IR")} کاربر
        </div>

        {filtered.length === 0 ? (
          <div className="py-14 text-center text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right text-2xs font-700 text-muted-foreground">
                  کاربر
                </TableHead>
                <TableHead className="hidden md:table-cell text-right text-2xs font-700 text-muted-foreground">
                  نقش
                </TableHead>
                <TableHead className="hidden md:table-cell text-center text-2xs font-700 text-muted-foreground">
                  آگهی
                </TableHead>
                <TableHead className="hidden md:table-cell text-center text-2xs font-700 text-muted-foreground">
                  درخواست
                </TableHead>
                <TableHead className="hidden md:table-cell text-right text-2xs font-700 text-muted-foreground">
                  حجم فروش
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow
                  key={user.id}
                  onClick={() =>
                    router.push(`/dashboard/manage/users/${user.id}`)
                  }
                  className="cursor-pointer group"
                >
                  {/* User */}
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-700 text-foreground shrink-0">
                        {user.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-700 text-foreground truncate">
                            {user.name}
                          </span>
                          {user.status === "suspended" && (
                            <Ban size={11} className="text-danger shrink-0" />
                          )}
                        </div>
                        <div
                          className="text-2xs text-muted-foreground truncate"
                          dir="ltr"
                        >
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell className="hidden md:table-cell">
                    <RoleBadge role={user.role} />
                  </TableCell>

                  {/* Posts */}
                  <TableCell className="hidden md:table-cell text-center text-sm font-700 text-foreground">
                    {toFa(listingsByOwner(user.id).length)}
                  </TableCell>

                  {/* Requests */}
                  <TableCell className="hidden md:table-cell text-center text-sm font-700 text-foreground">
                    {toFa(user.analytics.requests)}
                  </TableCell>

                  {/* Sales */}
                  <TableCell className="hidden md:table-cell text-price text-xs text-foreground">
                    {user.analytics.salesVolume > 0
                      ? formatPrice(user.analytics.salesVolume)
                      : "—"}
                  </TableCell>

                  {/* Manage chevron */}
                  <TableCell className="text-left">
                    <span className="inline-flex items-center gap-1 text-xs font-600 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      مدیریت
                      <ChevronLeft size={14} />
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
