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
import type { AdminUserRow, ProfileRole, ProfileStatus } from "@/types/admin";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import RoleBadge from "./RoleBadge";
import Avatar from "../shared/Avatar";

interface Props {
  users: AdminUserRow[];
  loading?: boolean;
  emptyText?: string;
  /** Server-side pagination */
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

type RoleFilter = "all" | ProfileRole;
type StatusFilter = "all" | ProfileStatus;

const roleFilters: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "همه نقش‌ها" },
  { value: "USER", label: roleLabel.USER },
  { value: "ADMIN", label: roleLabel.ADMIN },
  { value: "OWNER", label: roleLabel.OWNER },
];

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "ACTIVE", label: "فعال" },
  { value: "SUSPENDED", label: "معلق" },
];

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("");
}

export default function UserManagementTable({
  users,
  loading = false,
  emptyText = "کاربری یافت نشد.",
  total,
  page = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const faNum = (n: number) => n.toLocaleString("fa-IR");

  const totalPages =
    total != null ? Math.max(1, Math.ceil(total / pageSize)) : null;
  const hasPagination = total != null && onPageChange != null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (status !== "all" && u.status !== status) return false;
      if (!q) return true;
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.city ?? "").toLowerCase().includes(q)
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

        {loading ? (
          <div className="py-14 text-center text-sm text-muted-foreground">
            در حال بارگذاری…
          </div>
        ) : filtered.length === 0 ? (
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
                <TableHead className="hidden md:table-cell text-right text-2xs font-700 text-muted-foreground">
                  شهر
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
                <TableHead className="hidden md:table-cell text-right text-2xs font-700 text-muted-foreground">
                  وضعیت
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
                      <Avatar
                        src={user.avatar_path}
                        name={user.full_name}
                        size="w-10 h-10"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-700 text-foreground truncate">
                            {user.full_name}
                          </span>
                          {user.status === "SUSPENDED" && (
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

                  {/* City */}
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {user.city ?? "—"}
                  </TableCell>

                  {/* Posts — placeholder until backend endpoint is ready */}
                  <TableCell className="hidden md:table-cell text-center text-sm text-muted-foreground">
                    —
                  </TableCell>

                  {/* Requests — placeholder until backend endpoint is ready */}
                  <TableCell className="hidden md:table-cell text-center text-sm text-muted-foreground">
                    —
                  </TableCell>

                  {/* Sales volume — placeholder until backend endpoint is ready */}
                  <TableCell className="hidden md:table-cell text-center text-sm text-muted-foreground">
                    —
                  </TableCell>

                  {/* Status */}
                  <TableCell className="hidden md:table-cell">
                    <span
                      className={
                        user.status === "ACTIVE"
                          ? "status-active"
                          : "status-pending"
                      }
                    >
                      {user.status === "ACTIVE" ? "فعال" : "معلق"}
                    </span>
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

      {/* Pagination */}
      {hasPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {faNum(total!)} کاربر
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xs text-muted-foreground">
                تعداد در صفحه
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  onPageSizeChange?.(newSize);
                }}
                className="h-7 rounded-lg border border-border bg-card px-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {faNum(size)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              صفحه {faNum(page)} از {faNum(totalPages!)}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange!(1)}
                disabled={page <= 1}
                className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="صفحه اول"
              >
                <ChevronsRight size={15} />
              </button>
              <button
                onClick={() => onPageChange!(page - 1)}
                disabled={page <= 1}
                className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="صفحه قبلی"
              >
                <ChevronRight size={15} />
              </button>
              <button
                onClick={() => onPageChange!(page + 1)}
                disabled={page >= totalPages!}
                className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="صفحه بعدی"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => onPageChange!(totalPages!)}
                disabled={page >= totalPages!}
                className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="صفحه آخر"
              >
                <ChevronsLeft size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
