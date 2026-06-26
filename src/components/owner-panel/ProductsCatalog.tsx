"use client";

import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmDialog from "@/components/management/ConfirmDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdmin } from "@/context/AdminProvider";
import { brandModelLabel, cityLabel } from "@/context/carLabels";
import { formatPrice } from "@/context/data";
import { useListings } from "@/context/ListingsProvider";
import type { Listing } from "@/types/dataTypes";
import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type StatusFilter = "all" | Listing["status"];

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "active", label: "موجود" },
  { value: "pending", label: "در انتظار" },
  { value: "negotiable", label: "قابل مذاکره" },
  { value: "reserved", label: "رزرو شده" },
  { value: "sold", label: "فروخته شد" },
];

export default function ProductsCatalog() {
  const { listings, deleteListing } = useListings();
  const { users } = useAdmin();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [pendingDelete, setPendingDelete] = useState<Listing | null>(null);

  const ownerName = (l: Listing) =>
    users.find((u) => u.id === l.ownerId)?.name ?? l.sellerName;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings
      .filter((l) => status === "all" || l.status === status)
      .filter(
        (l) =>
          !q ||
          brandModelLabel(l).toLowerCase().includes(q) ||
          l.trim.toLowerCase().includes(q) ||
          ownerName(l).toLowerCase().includes(q),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, query, status, users]);

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
            placeholder="جست‌وجوی محصول یا فروشنده…"
            className="w-full h-10 rounded-xl border border-border bg-card pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-600 transition-colors duration-150 ${
                status === f.value
                  ? "bg-primary text-white"
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
          {rows.length.toLocaleString("fa-IR")} محصول
        </div>

        {rows.length === 0 ? (
          <div className="py-14 text-center text-sm text-muted-foreground">
            محصولی یافت نشد.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right text-2xs font-700 text-muted-foreground">
                  محصول
                </TableHead>
                <TableHead className="hidden md:table-cell text-right text-2xs font-700 text-muted-foreground">
                  قیمت
                </TableHead>
                <TableHead className="hidden md:table-cell text-right text-2xs font-700 text-muted-foreground">
                  فروشنده
                </TableHead>
                <TableHead className="hidden lg:table-cell text-right text-2xs font-700 text-muted-foreground">
                  شهر
                </TableHead>
                <TableHead className="text-right text-2xs font-700 text-muted-foreground">
                  وضعیت
                </TableHead>
                <TableHead className="text-left text-2xs font-700 text-muted-foreground">
                  عملیات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="text-sm font-600 text-foreground truncate max-w-55">
                      {brandModelLabel(p)} · {p.trim}
                    </div>
                    <div className="md:hidden text-2xs text-muted-foreground mt-0.5">
                      {formatPrice(p.price)} تومان · {ownerName(p)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-price text-xs text-foreground">
                    {formatPrice(p.price)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {p.ownerId ? (
                      <Link
                        href={`/dashboard/manage/users/${p.ownerId}`}
                        className="text-xs font-600 text-primary hover:underline"
                      >
                        {ownerName(p)}
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {ownerName(p)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {cityLabel(p.city)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/market/listings/${p.id}`}
                        aria-label="مشاهده محصول"
                        title="مشاهده در بازار"
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors duration-150"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        href={`/dashboard/manage/products/${p.id}`}
                        aria-label="ویرایش محصول"
                        title="ویرایش"
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors duration-150"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => setPendingDelete(p)}
                        aria-label="حذف محصول"
                        title="حذف"
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-danger hover:border-danger/40 transition-colors duration-150"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="حذف محصول"
          description={`«${brandModelLabel(pendingDelete)} ${pendingDelete.trim}» حذف می‌شود.`}
          confirmLabel="حذف"
          onConfirm={() => {
            deleteListing(pendingDelete.id);
            toast.success("محصول حذف شد");
          }}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
