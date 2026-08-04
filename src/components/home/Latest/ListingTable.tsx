"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import {
  bodyTypeLabel,
  brandModelLabel,
  cityLabel,
  colorLabel,
  toFa,
} from "@/context/carLabels";
import { listingColumns } from "@/context/listingTable";
import { Listing } from "@/types/dataTypes";
import { useSellers } from "@/hooks/useSellers";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PAGE_SIZE_OPTIONS = [50, 100];
const faNum = (n: number) => n.toLocaleString("fa-IR");

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});
const formatUploadDate = (iso: string): string =>
  dateFormatter.format(new Date(iso));

const statusFa: Record<
  Listing["status"],
  { label: string; className: string }
> = {
  active: {
    label: "موجود",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "در انتظار",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  sold: {
    label: "فروخته شد",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  negotiable: {
    label: "قابل مذاکره",
    className: "bg-violet-100 text-violet-700 border-violet-200",
  },
  reserved: {
    label: "رزرو شده",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

function formatPriceFa(price: number): string {
  if (price >= 1_000_000_000) {
    return `${toFa((price / 1_000_000_000).toFixed(3))} میلیارد`;
  }
  if (price >= 1_000_000) {
    return `${toFa((price / 1_000_000).toFixed(0))} میلیون`;
  }
  return toFa(price.toLocaleString("en-US"));
}

function brandLogoStyle(brand: string): {
  backgroundColor: string;
  color: string;
} {
  let hash = 0;
  for (let i = 0; i < brand.length; i++) {
    hash = brand.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return { backgroundColor: `hsl(${hue}, 60%, 48%)`, color: "#ffffff" };
}

interface ListingTableProps {
  data: Listing[];
}

export default function ListingTable({ data }: ListingTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "listedDate", desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { sellers } = useSellers();
  const sellersMap = new Map(sellers.map((s) => [s.id, s]));

  const columns = listingColumns(sellersMap);

  const navigate = useRouter();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    state: { sorting, rowSelection },
  });

  const selectedCount = table.getSelectedRowModel().rows.length;

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div dir="rtl" className="space-y-3">
      <div className="lg:hidden space-y-3">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => {
            const listing = row.original;
            const status = statusFa[listing.status];
            const seller = sellersMap.get(listing.seller_id ?? "");
            return (
              <div
                key={row.id}
                className="group cursor-pointer rounded-2xl border border-border/70 bg-gradient-to-br from-background via-background to-muted/30 p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                onClick={() => navigate.push(`/market/listings/${listing.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate.push(`/market/listings/${listing.id}`);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                      style={brandLogoStyle(listing.brand)}
                    >
                      {listing.brand.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-foreground">
                          {brandModelLabel(listing)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {listing.trim}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className="md:inline-flex items-center gap-2 hidden"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="انتخاب ردیف"
                      />
                    </span>
                    <div className="text-left">
                      <div className="text-xs text-muted-foreground">قیمت</div>
                      <div className="text-sm font-semibold tabular-nums">
                        {formatPriceFa(listing.price)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {status && (
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    تاریخ ثبت {formatUploadDate(listing.listedDate)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground">سال ساخت</span>
                    <span className="font-medium tabular-nums">
                      {toFa(listing.year)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground">شهر</span>
                    <span className="font-medium">
                      {cityLabel(listing.city)}
                    </span>
                  </div>
                  <div className="hidden md:flex flex-col gap-0.5">
                    <span className="text-muted-foreground">سگمنت</span>
                    <span className="font-medium">
                      {bodyTypeLabel(listing.bodyType)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground">رنگ</span>
                    <span className="font-medium">
                      {colorLabel(listing.color)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground">فروشنده</span>
                    <span className="flex items-center gap-1 font-medium">
                      {seller?.name ?? listing.sellerName}
                      {(seller?.verified ?? listing.sellerVerified) && (
                        <VerifiedBadge size="sm" />
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground">شناسه آگهی</span>
                    <span className="font-medium tabular-nums">
                      {toFa(listing.id)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            داده‌ای یافت نشد
          </div>
        )}
      </div>

      <div className="hidden lg:block overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <Table>
          <TableHeader className="bg-secondary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-border hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-4 py-3 text-right text-sm font-semibold vazir-matn"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="cursor-pointer border-b border-border/50 transition-colors hover:bg-accent/10 data-[state=selected]:bg-accent/15"
                  onClick={() =>
                    navigate.push(`/market/listings/${row.original.id}`)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-3 text-sm vazir-matn"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground vazir-matn"
                >
                  داده‌ای یافت نشد
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div
        dir="rtl"
        className="flex flex-col gap-3 py-2 vazir-matn sm:flex-row sm:items-center sm:justify-between"
      >
        {/* Rows per page + selection info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">تعداد در صفحه</span>
            <Select
              dir="rtl"
              value={String(pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[72px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {faNum(size)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {faNum(selectedCount)} مورد انتخاب شده
            </span>
          )}
        </div>

        {/* Range + navigation */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            نمایش {faNum(from)}–{faNum(to)} از {faNum(totalRows)}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label="صفحه اول"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="صفحه قبلی"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="px-1 text-sm text-muted-foreground tabular-nums">
              صفحه {faNum(pageIndex + 1)} از {faNum(table.getPageCount() || 1)}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="صفحه بعدی"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              aria-label="صفحه آخر"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
