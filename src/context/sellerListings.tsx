import BrandIcon from "@/components/shared/BrandIcon";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatPrice } from "@/context/data";
import { listingViews } from "@/context/sellerDashboard";
import { Listing } from "@/types/dataTypes";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Edit2, Eye, Handshake, Trash2 } from "lucide-react";
import Link from "next/link";

export const sellerListingColumns: ColumnDef<Listing>[] = [
  {
    id: "logo",
    header: () => <span />,
    cell: ({ row }) => (
      <div className="mr-5">
        <BrandIcon brand={row.original.brand} size="md" />
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "car",
    header: () => (
      <span className="text-sm font-semibold vazir-matn">خودرو</span>
    ),
    cell: ({ row }) => (
      <div>
        <div className="text-sm font-700 text-foreground">
          {row.original.brand} {row.original.model}
        </div>
        <div className="text-xs text-muted-foreground">
          {row.original.trim} · {row.original.year}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: () => (
      <span className="text-sm font-semibold vazir-matn">قیمت</span>
    ),
    cell: ({ getValue }) => (
      <div>
        <div className="text-price text-sm text-foreground">
          {formatPrice(getValue() as number)}
        </div>
        <div className="text-2xs text-muted-foreground">تومان</div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="text-sm font-semibold vazir-matn">وضعیت</span>
    ),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "views",
    header: () => (
      <span className="text-sm font-semibold vazir-matn">بازدید</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Eye size={12} className="text-muted-foreground" />
        <span className="text-sm font-600 text-foreground">
          {listingViews(row.original.id)}
        </span>
      </div>
    ),
    enableSorting: false,
  },
  {
    id: "requests",
    header: () => (
      <span className="text-sm font-semibold vazir-matn">پیشنهادها</span>
    ),
    cell: ({ row }) => (
      <button
        onClick={row.getToggleExpandedHandler()}
        aria-label="پیشنهادها"
        title="پیشنهادها"
        className="flex items-center gap-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
      >
        <Handshake size={18} />
        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${row.getIsExpanded() ? "rotate-180" : ""}`}
        />
      </button>
    ),
  },
  {
    id: "actions",
    header: () => (
      <span className="text-sm font-semibold vazir-matn">عملیات</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 justify-start">
        <button
          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors duration-150"
          title="ویرایش"
        >
          <Edit2 size={13} />
        </button>
        <Link
          href={`/market/listings/${row.original.id}`}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-accent hover:bg-accent/8 transition-colors duration-150"
          title="مشاهده"
        >
          <Eye size={13} />
        </Link>
        <button
          className="p-1.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/8 transition-colors duration-150"
          title="حذف"
        >
          <Trash2 size={13} />
        </button>
      </div>
    ),
    enableSorting: false,
  },
];
