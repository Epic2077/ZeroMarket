import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import VerifiedBadge from "@/components/shared/VerifiedBadeg";
import { Listing } from "@/types/dataTypes";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

/* ----------------------------- Farsi helpers ----------------------------- */

// Convert latin digits to Persian digits (no thousands separator added).
const toFa = (value: string | number): string =>
  String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

// Persian (Jalali) calendar date for the upload time.
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});
const formatUploadDate = (iso: string): string =>
  dateFormatter.format(new Date(iso));

function formatPriceFa(price: number): string {
  if (price >= 1_000_000_000) {
    return `${toFa((price / 1_000_000_000).toFixed(2))} میلیارد`;
  }
  if (price >= 1_000_000) {
    return `${toFa((price / 1_000_000).toFixed(0))} میلیون`;
  }
  return toFa(price.toLocaleString("en-US"));
}

/* ------------------------------ Farsi maps ------------------------------- */

// Brand + model → Persian name. Falls back to the latin "<brand> <model>".
const brandModelFa: Record<string, string> = {
  "Toyota Camry": "تویوتا کمری",
  "Hyundai Tucson": "هیوندای توسان",
  "Kia Sportage": "کیا اسپورتیج",
  "BMW 3 Series": "بی‌ام‌و سری ۳",
  "Geely Coolray": "جیلی کول‌ری",
  "Haval H6": "هاوال H6",
  "Jetour X70 Plus": "جتور X70 پلاس",
  "Chery Tiggo 8 Pro": "چری تیگو ۸ پرو",
  "MVM 550": "ام‌وی‌ام ۵۵۰",
  "Honda CR-V": "هوندا CR-V",
  "IKCO Dena Plus": "ایران‌خودرو دنا پلاس",
  "Volkswagen Tiguan": "فولکس‌واگن تیگوان",
};

const colorFa: Record<string, string> = {
  "Pearl White": "سفید صدفی",
  "Midnight Black": "مشکی",
  "Steel Gray": "خاکستری فولادی",
  "Alpine White": "سفید",
  "Ocean Blue": "آبی اقیانوسی",
  "Crimson Red": "قرمز",
  "Champagne Gold": "طلایی شامپاینی",
  "Glacier White": "سفید یخی",
  "Deep Blue": "آبی سیر",
  "Sonic Gray Pearl": "خاکستری",
  "Silver Metallic": "نقره‌ای متالیک",
  "Deep Black Pearl": "مشکی صدفی",
};

const bodyTypeFa: Record<string, string> = {
  Sedan: "سدان",
  SUV: "شاسی‌بلند",
};

const cityFa: Record<string, string> = {
  Tehran: "تهران",
  Isfahan: "اصفهان",
  Mashhad: "مشهد",
  Shiraz: "شیراز",
  Tabriz: "تبریز",
  Karaj: "کرج",
};

const sellerFa: Record<string, string> = {
  "Aria Motors": "آریا موتورز",
  "Parsian Auto": "پارسیان خودرو",
  "Mehr Khodro": "مهر خودرو",
  "Bavarian Motors TH": "باواریان موتورز",
  "Star Auto Group": "استار خودرو",
  "Haval Center NW": "مرکز هاوال",
  "Capital Auto TH": "کاپیتال خودرو",
  "Sina Motors": "سینا موتورز",
  "Tehran Auto Mall": "اتومال تهران",
  "IKCO Direct": "ایران‌خودرو دایرکت",
  "Euro Motors Tehran": "یورو موتورز تهران",
};

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

export const listingColumns: ColumnDef<Listing>[] = [
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
      return (
        <div dir="rtl" className="flex flex-col gap-0.5">
          <span className="font-medium">{brandModelFa[key] ?? key}</span>
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
    cell: ({ getValue }) => (
      <span className="tabular-nums">{toFa(getValue() as number)}</span>
    ),
  },
  {
    accessorKey: "color",
    header: () => <span className="text-sm font-semibold vazir-matn">رنگ</span>,
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
    header: () => <span className="text-sm font-semibold vazir-matn">نوع</span>,
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
    header: () => <span className="text-sm font-semibold vazir-matn">شهر</span>,
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
    cell: ({ row }) => (
      <div dir="rtl" className="flex items-center gap-1.5">
        <span>
          {sellerFa[row.original.sellerName] ?? row.original.sellerName}
        </span>
        {row.original.sellerVerified && <VerifiedBadge size="sm" />}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => <SortHeader label="قیمت (تومان)" column={column} />,
    cell: ({ getValue }) => (
      <span className="font-medium tabular-nums">
        {formatPriceFa(getValue() as number)}
      </span>
    ),
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
