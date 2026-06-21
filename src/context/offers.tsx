import { Button } from "@/components/ui/button";
import { formatPrice } from "@/context/data";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle, MessageSquare, XCircle } from "lucide-react";

export type OfferStatus = "pending" | "accepted" | "rejected" | "negotiable";

export interface CarOffer {
  id: string;
  buyer: string;
  initials: string;
  offer: number;
  date: string;
  status: OfferStatus;
}

// Mock buyers who sent a deal for the car being viewed.
export const carOffers: CarOffer[] = [
  {
    id: "of-1",
    buyer: "علی رضایی",
    initials: "ع",
    offer: 2800000000,
    date: "۲ ساعت پیش",
    status: "pending",
  },
  {
    id: "of-2",
    buyer: "سارا محمدی",
    initials: "س",
    offer: 2750000000,
    date: "۵ ساعت پیش",
    status: "negotiable",
  },
  {
    id: "of-3",
    buyer: "محمد کریمی",
    initials: "م",
    offer: 2700000000,
    date: "دیروز",
    status: "rejected",
  },
  {
    id: "of-4",
    buyer: "نیلوفر احمدی",
    initials: "ن",
    offer: 2850000000,
    date: "۲ روز پیش",
    status: "accepted",
  },
  {
    id: "of-5",
    buyer: "رضا قاسمی",
    initials: "ر",
    offer: 2680000000,
    date: "۳ روز پیش",
    status: "pending",
  },
];

export const offerStatusMap: Record<
  OfferStatus,
  { label: string; className: string }
> = {
  pending: { label: "در انتظار", className: "status-pending" },
  accepted: { label: "تأیید شده", className: "status-active" },
  rejected: { label: "رد شده", className: "status-sold" },
  negotiable: { label: "قابل مذاکره", className: "status-negotiable" },
};

// The status-change controls the seller uses to respond to an offer.
const statusActions: {
  status: OfferStatus;
  title: string;
  icon: typeof CheckCircle;
  className: string;
}[] = [
  {
    status: "accepted",
    title: "تأیید",
    icon: CheckCircle,
    className: "bg-success/10 text-success hover:bg-success/20",
  },
  {
    status: "negotiable",
    title: "مذاکره",
    icon: MessageSquare,
    className: "bg-negotiable/10 text-negotiable hover:bg-negotiable/20",
  },
  {
    status: "rejected",
    title: "رد",
    icon: XCircle,
    className: "bg-danger/10 text-danger hover:bg-danger/20",
  },
];

// Columns are built with a callback so the seller can change an offer's status.
export const getOfferColumns = (
  onStatusChange: (id: string, status: OfferStatus) => void,
): ColumnDef<CarOffer>[] => [
  {
    accessorKey: "buyer",
    header: () => (
      <span className="text-sm font-semibold vazir-matn">پیشنهاددهنده</span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-700 text-foreground">
          {row.original.initials}
        </div>
        <span className="font-600 text-foreground">{row.original.buyer}</span>
      </div>
    ),
  },
  {
    accessorKey: "offer",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        dir="rtl"
        className="w-full justify-start gap-1 px-0 text-sm font-semibold hover:bg-transparent hover:text-foreground vazir-matn"
      >
        مبلغ پیشنهادی
        <ArrowUpDown className="h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <span className="font-mono font-700 text-foreground">
        {formatPrice(getValue() as number)}{" "}
        <span className="text-2xs text-muted-foreground">تومان</span>
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: () => <span className="text-sm font-semibold vazir-matn">زمان</span>,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="text-sm font-semibold vazir-matn">وضعیت</span>
    ),
    cell: ({ row }) => {
      const current = offerStatusMap[row.original.status];
      return (
        <div className="flex items-center gap-2">
          <span className={current.className}>{current.label}</span>
          <div className="flex items-center gap-1">
            {statusActions.map((action) => {
              const Icon = action.icon;
              const isActive = row.original.status === action.status;
              return (
                <button
                  key={action.status}
                  onClick={() => onStatusChange(row.original.id, action.status)}
                  title={action.title}
                  aria-label={action.title}
                  className={`p-1 rounded-md transition-colors duration-150 ${action.className} ${isActive ? "ring-1 ring-current" : ""}`}
                >
                  <Icon size={13} />
                </button>
              );
            })}
          </div>
        </div>
      );
    },
  },
];
