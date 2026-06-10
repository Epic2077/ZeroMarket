import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, BadgeCheck, ExternalLink } from "lucide-react";

type Data = {
  id: string;
  brand: string;
  trim: string;
  year: number;
  color: string;
  seller: string;
  verified: boolean;
  cost: string;
  status: "Available" | "Sold" | "Pending";
};

export const latestTableData: Data[] = [
  {
    id: "1",
    brand: "Toyota Camry",
    trim: "XLE 2.5L",
    year: 2026,
    color: "مشکی",
    seller: "Aria Motors",
    verified: true,
    cost: "16,000,000,000",
    status: "Available",
  },
  {
    id: "2",
    brand: "BMW 3 Series",
    trim: "330i xDrive",
    year: 2025,
    color: "سفید",
    seller: "Tehran Auto",
    verified: false,
    cost: "28,500,000,000",
    status: "Pending",
  },
  {
    id: "3",
    brand: "Mercedes C-Class",
    trim: "C200 AMG Line",
    year: 2026,
    color: "نقره‌ای",
    seller: "Aria Motors",
    verified: true,
    cost: "34,000,000,000",
    status: "Available",
  },
  {
    id: "4",
    brand: "Hyundai Tucson",
    trim: "N Line 1.6T",
    year: 2025,
    color: "آبی",
    seller: "Khodro Plus",
    verified: true,
    cost: "9,200,000,000",
    status: "Sold",
  },
  {
    id: "5",
    brand: "Toyota Camry",
    trim: "XSE V6",
    year: 2026,
    color: "خاکستری",
    seller: "Aria Motors",
    verified: false,
    cost: "18,000,000,000",
    status: "Available",
  },
  {
    id: "6",
    brand: "Toyota Camry",
    trim: "XSE V6",
    year: 2026,
    color: "خاکستری",
    seller: "Aria Motors",
    verified: false,
    cost: "18,000,000,000",
    status: "Available",
  },
];

export type columnsType = {
  id: string;
  brand: string;
  trim: string;
  year: number;
  color: string;
  seller: string;
  verified: boolean;
  cost: string;
  status: string;
};

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
  const saturation = 60;
  const lightness = 48;

  // WCAG-style relative luminance: dark bg → white text, light bg → black text
  // For HSL we approximate: lightness < 55 is dark enough for white text
  const textColor = lightness < 55 ? "#ffffff" : "#000000";

  return {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    color: textColor,
  };
}

function formatCost(cost: string): string {
  const num = parseInt(cost.replace(/,/g, ""), 10);
  if (num >= 1_000_000_000) {
    const val = num / 1_000_000_000;
    const display = Number.isInteger(val) ? val.toString() : val.toFixed(1);
    return `${display} میلیارد`;
  }
  if (num >= 1_000_000) {
    const val = num / 1_000_000;
    const display = Number.isInteger(val) ? val.toString() : val.toFixed(1);
    return `${display} میلیون`;
  }
  return cost;
}

const statusMap: Record<string, { label: string; className: string }> = {
  Available: {
    label: "موجود",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  Sold: {
    label: "فروخته شد",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  Pending: {
    label: "در انتظار",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
};

export const LatestTableColumns: ColumnDef<columnsType>[] = [
  {
    id: "logo",
    header: () => <span />,
    cell: ({ row }) => {
      const brand = row.original.brand;
      const initials = brand.slice(0, 3).toUpperCase();
      return (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 select-none"
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
        <span className="font-medium text">{row.original.brand}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.trim}
        </span>
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
        className="hover:bg-transparent w-full justify-start gap-1 px-0 text-sm font-semibold  hover:text-foreground vazir-matn"
      >
        سال
        <ArrowUpDown className="h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <span className="tabular-nums">{getValue() as number}</span>
    ),
  },
  {
    accessorKey: "color",
    header: () => (
      <span className="text-sm font-semibold  vazir-matn">رنگ</span>
    ),
  },
  {
    accessorKey: "seller",
    header: () => (
      <span className="text-sm font-semibold  vazir-matn">فروشنده</span>
    ),
    cell: ({ row }) => (
      <div dir="rtl" className="flex items-center gap-1.5">
        <span className="">{row.original.seller}</span>
        {row.original.verified && (
          <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />
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
        className="w-full justify-start gap-1 px-0 text-sm font-semibold hover:text-foreground vazir-matn hover:bg-transparent"
      >
        قیمت (تومان)
        <ArrowUpDown className="h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <span className="tabular-nums font-medium">
        {formatCost(getValue() as string)}
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
          className={`vazir-matn text-xs font-medium px-2.5 py-0.5 ${s.className}`}
        >
          {s.label}
        </Badge>
      ) : null;
    },
  },
  {
    id: "actions",
    header: () => <span />,
    cell: () => (
      <Button
        variant="default"
        size="sm"
        className="hover:bg-transparent gap-1.5 text-xs text-white cursor-pointer hover:text-foreground vazir-matn"
      >
        مشاهده
        <ExternalLink className="h-3.5 w-3.5" />
      </Button>
    ),
  },
];
