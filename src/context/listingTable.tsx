import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import {
  bodyTypeFa,
  brandModelFa,
  cityFa,
  colorFa,
  toFa,
} from "@/context/carLabels";
import type { Listing, SellerSummary } from "@/types/dataTypes";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, HandCoins, ShoppingCart } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

// Re-exported for existing consumers importing the digit helper from here.
export { toFa };

/* ----------------------------- Farsi helpers ----------------------------- */

// Persian (Jalali) calendar date for the upload time.
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});
// listedDate may already be a Persian display string (Supabase rows) — only
// re-format values that actually parse as dates.
const formatUploadDate = (iso: string): string => {
  const date = new Date(iso);
  return isNaN(date.getTime()) ? iso : dateFormatter.format(date);
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

/* ------------------------------ Farsi maps ------------------------------- */
// Brand/model, color, body type, city and seller label maps now live in
// `@/context/carLabels` so the listing cards and seller pages share them.

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

// Deterministic hue from brand name so the logo color is stable across renders.
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

/* ------------------------------- Columns --------------------------------- */

// Reusable sortable header button (RTL, ghost styling matching LatestTable).
function SortHeader({
  label,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column,
}: {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: any;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      dir="rtl"
      className="w-full justify-start gap-1 px-0 text-sm font-semibold hover:bg-transparent hover:text-foreground vazir-matn"
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" />
    </Button>
  );
}

export function listingColumns(
  sellersMap: Map<string, Pick<SellerSummary, "name" | "verified">>,
): ColumnDef<Listing>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          className="mr-2"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="انتخاب همه"
        />
      ),
      cell: ({ row }) => (
        // Stop the click from bubbling to the row's navigate-on-click handler.
        <span
          className="flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            className="mr-2"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="انتخاب ردیف"
          />
        </span>
      ),
      enableSorting: false,
    },
    {
      id: "logo",
      header: () => <span />,
      cell: ({ row }) => {
        const brand = row.original.brand;
        const initials = brand.slice(0, 3).toUpperCase();
        return (
          <div
            className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-lg text-xs font-bold -mr-5"
            style={brandLogoStyle(brand)}
          >
            {initials}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "brandModel",
      accessorFn: (row) => `${row.brand} ${row.model}`,
      header: ({ column }) => (
        <SortHeader label="برند / مدل / تریم" column={column} />
      ),
      cell: ({ row }) => {
        const key = `${row.original.brand} ${row.original.model}`;
        const isBuy = row.original.listingType === "BUY";
        return (
          <div dir="rtl" className="flex flex-col gap-0.5">
            <span className="font-medium">
              {brandModelFa[key] ?? key}
              <Badge
                variant="outline"
                className={`mr-1.5 inline-flex items-center gap-0.5 text-2xs align-middle ${
                  isBuy
                    ? "bg-accent/10 text-accent border-accent/25"
                    : "bg-primary/10 text-primary border-primary/25"
                }`}
              >
                {isBuy ? <HandCoins size={9} /> : <ShoppingCart size={9} />}
                {isBuy ? "خرید" : "فروش"}
              </Badge>
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.trim}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "year",
      header: ({ column }) => <SortHeader label="سال" column={column} />,
      cell: ({ getValue }) => {
        const gYear = getValue() as number;
        const persianYear = gYear - 621;
        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <Badge
                variant="outline"
                className="cursor-default font-mono text-xs px-2"
              >
                {gYear}
              </Badge>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto px-3 py-2 text-xs" side="top">
              سال {toFa(persianYear)} شمسی
            </HoverCardContent>
          </HoverCard>
        );
      },
    },
    {
      accessorKey: "color",
      header: () => (
        <span className="text-sm font-semibold vazir-matn">رنگ</span>
      ),
      cell: ({ row }) => (
        <div dir="rtl" className="flex items-center gap-2">
          <span
            className="h-4 w-4 shrink-0 rounded-full border border-border"
            style={{ backgroundColor: row.original.colorHex }}
          />
          <span>{colorFa[row.original.color] ?? row.original.color}</span>
        </div>
      ),
    },
    {
      accessorKey: "bodyType",
      header: () => (
        <span className="text-sm font-semibold vazir-matn">سگمنت</span>
      ),
      cell: ({ getValue }) => {
        const type = getValue() as string;
        return (
          <Badge variant="secondary" className="vazir-matn text-xs font-medium">
            {bodyTypeFa[type] ?? type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "city",
      header: () => (
        <span className="text-sm font-semibold vazir-matn">شهر</span>
      ),
      cell: ({ getValue }) => {
        const city = getValue() as string;
        return <span>{cityFa[city] ?? city}</span>;
      },
    },
    {
      accessorKey: "sellerName",
      header: () => (
        <span className="text-sm font-semibold vazir-matn">فروشنده</span>
      ),
      cell: ({ row }) => {
        const seller = sellersMap.get(row.original.seller_id ?? "");
        return (
          <div dir="rtl" className="flex items-center gap-1.5">
            <span>{seller?.name ?? row.original.sellerName}</span>
            {(seller?.verified ?? row.original.sellerVerified) && (
              <VerifiedBadge size="sm" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <SortHeader label="قیمت (تومان)" column={column} />
      ),
      cell: ({ row }) => {
        const price = row.original.price;
        const vs = row.original.priceVsMarket;
        return (
          <div className="flex flex-col">
            <span className="font-medium tabular-nums">
              {formatPriceFa(price)}
            </span>
            {vs !== 0 && (
              <span
                className={`text-[12px] font-600 ${vs >= 0 ? "text-danger" : "text-success"}`}
              >
                {vs > 0 ? "+" : ""}
                {toFa(vs)}٪ {vs >= 0 ? "بالاتر" : "پایین‌تر"}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => (
        <span className="text-sm font-semibold vazir-matn">وضعیت</span>
      ),
      cell: ({ getValue }) => {
        const s = statusFa[getValue() as Listing["status"]];
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
      accessorKey: "listedDate",
      header: ({ column }) => <SortHeader label="تاریخ ثبت" column={column} />,
      cell: ({ getValue }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatUploadDate(getValue() as string)}
        </span>
      ),
    },
  ];
}
