import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  brandModelLabel,
  colorLabel,
  sellerFa,
  toFa,
} from "@/context/carLabels";
import { listings } from "@/context/data";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

export type LatestRow = {
  id: string;
  brand: string;
  trim: string;
  year: number;
  color: string;
  seller: string;
  verified: boolean;
  cost: number;
  status: string;
};

const statusMap: Record<string, { label: string; className: string }> = {
  active: {
    label: "موجود",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  sold: {
    label: "فروخته شد",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  pending: {
    label: "در انتظار",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  negotiable: {
    label: "قابل مذاکره",
    className: "bg-violet-100 text-violet-700 border-violet-200",
  },
  reserved: {
    label: "رزرو شده",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export const latestTableData: LatestRow[] = listings.slice(0, 8).map((l) => ({
  id: l.id,
  brand: brandModelLabel(l),
  trim: l.trim,
  year: l.year,
  color: colorLabel(l.color),
  seller: sellerFa[l.sellerName] ?? l.sellerName,
  verified: l.sellerVerified,
  cost: l.price,
  status: l.status,
}));

function formatCost(cost: number): string {
  if (cost >= 1_000_000_000) {
    const val = cost / 1_000_000_000;
    return `${toFa(Number.isInteger(val) ? val : val.toFixed(1))} میلیارد`;
  }
  if (cost >= 1_000_000) {
    const val = cost / 1_000_000;
    return `${toFa(Number.isInteger(val) ? val : val.toFixed(1))} میلیون`;
  }
  return toFa(cost);
}

// Deterministic hue from brand name so the color is stable across renders
function brandLogoStyle(brand: string): {
  backgroundColor: string;
  color: string;
} {
  let hash = 0;
  for (let i = 0; i < brand.length; i++) {
    hash = brand.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return {
    backgroundColor: `hsl(${hue}, 55%, 45%)`,
    color: "#ffffff",
  };
}

export const LatestTableColumns: ColumnDef<LatestRow>[] = [
  {
    id: "logo",
    header: () => <span />,
    cell: ({ row }) => {
      const brand = row.original.brand;
      const initials = brand.slice(0, 2);
      return (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-700 shrink-0 select-none"
          style={brandLogoStyle(brand)}
        >
          {initials}
        </div>
      );
    },
  },
  {
    accessorKey: "brand",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        dir="rtl"
        className="hover:bg-transparent w-full justify-start gap-1 px-0 text-sm font-semibold hover:text-foreground vazir-matn"
      >
        برند / مدل / تریم
        <ArrowUpDown className="h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <div dir="rtl" className="flex flex-col gap-0.5">
        <span className="font-600">{row.original.brand}</span>
        <span className="text-xs text-muted-foreground">{row.original.trim}</span>
      </div>
    ),
  },
  {
    accessorKey: "year",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        dir="rtl"
        className="hover:bg-transparent w-full justify-start gap-1 px-0 text-sm font-semibold hover:text-foreground vazir-matn"
      >
        سال
        <ArrowUpDown className="h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <span className="font-mono-nums">{toFa(getValue() as number)}</span>
    ),
  },
  {
    accessorKey: "color",
    header: () => <span className="text-sm font-semibold vazir-matn">رنگ</span>,
  },
  {
    accessorKey: "seller",
    header: () => (
      <span className="text-sm font-semibold vazir-matn">فروشنده</span>
    ),
    cell: ({ row }) => (
      <div dir="rtl" className="flex items-center gap-1.5">
        <span>{row.original.seller}</span>
        {row.original.verified && (
          <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
        )}
      </div>
    ),
  },
  {
    accessorKey: "cost",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        dir="rtl"
        className="hover:bg-transparent w-full justify-start gap-1 px-0 text-sm font-semibold hover:text-foreground vazir-matn"
      >
        قیمت (تومان)
        <ArrowUpDown className="h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <span className="font-mono-nums font-600">
        {formatCost(getValue() as number)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="text-sm font-semibold vazir-matn">وضعیت</span>
    ),
    cell: ({ getValue }) => {
      const s = statusMap[getValue() as string];
      return s ? (
        <Badge
          variant="outline"
          className={`vazir-matn text-xs font-600 px-2.5 py-0.5 ${s.className}`}
        >
          {s.label}
        </Badge>
      ) : null;
    },
  },
  {
    id: "actions",
    header: () => <span />,
    cell: ({ row }) => (
      <Link
        href={`/market/listings/${row.original.id}`}
        className="btn-secondary text-xs px-2.5 py-1.5 inline-flex items-center gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        مشاهده
        <ExternalLink className="h-3 w-3" />
      </Link>
    ),
  },
];
