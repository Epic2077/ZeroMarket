import {
  Calendar,
  Car,
  CheckCircle,
  Fuel,
  Gauge,
  Package,
  Settings2,
  Sparkles,
  Truck,
} from "lucide-react";
import { Listing } from "@/types/dataTypes";

interface Props {
  listing: Listing;
}

// The headline specs, surfaced in the summary card up top.
const keySpecs = (listing: Listing) => [
  {
    label: "سال مدل",
    value: String(listing.year),
    icon: <Calendar size={15} />,
    color: "text-sky-600",
  },
  {
    label: "موتور",
    value: listing.engine,
    icon: <Gauge size={15} />,
    color: "text-violet-600",
  },
  {
    label: "نوع سوخت",
    value: listing.fuelType,
    icon: <Fuel size={15} />,
    color: "text-emerald-600",
  },
  {
    label: "زمان تحویل",
    value:
      listing.deliveryDays === 0
        ? "موجود — فوری"
        : `${listing.deliveryDays} روز`,
    icon: <Truck size={15} />,
    color: "text-amber-600",
  },
];

const specGroups = (listing: Listing) => [
  {
    id: "specs-identity",
    title: "مشخصات خودرو",
    icon: <Car size={15} className="text-primary" />,
    tint: "bg-primary/10",
    dark: false,
    items: [
      { label: "برند", value: listing.brand },
      { label: "مدل", value: listing.model },
      { label: "تریم / نسخه", value: listing.trim },
      { label: "سال مدل", value: String(listing.year) },
      { label: "نوع بدنه", value: listing.bodyType },
      { label: "وضعیت", value: "۰ کیلومتر — کارخانه‌ای" },
    ],
  },
  {
    // The standout dark section.
    id: "specs-powertrain",
    title: "موتور و انتقال قدرت",
    icon: <Gauge size={15} className="text-accent" />,
    tint: "bg-white/10",
    dark: true,
    items: [
      { label: "موتور", value: listing.engine },
      { label: "گیربکس", value: listing.transmission },
      { label: "نوع سوخت", value: listing.fuelType },
      {
        label: "دیفرانسیل",
        value: listing.trim.includes("AWD")
          ? "چهار چرخ محرک"
          : "دو چرخ محرک جلو",
      },
    ],
  },
  {
    id: "specs-availability",
    title: "موجودی و تحویل",
    icon: <Package size={15} className="text-success" />,
    tint: "bg-success/10",
    dark: false,
    items: [
      { label: "شهر / موقعیت", value: listing.city },
      {
        label: "زمان تحویل",
        value:
          listing.deliveryDays === 0
            ? "موجود — فوری"
            : `${listing.deliveryDays} روز کاری`,
      },
      { label: "تاریخ ثبت", value: listing.listedDate },
      {
        label: "وضعیت آگهی",
        value: listing.status.charAt(0).toUpperCase() + listing.status.slice(1),
      },
    ],
  },
];

export default function ListingDetailSpecs({ listing }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {/* Key specs summary */}
      <div className="card-elevated p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10">
            <Sparkles size={15} className="text-accent" />
          </span>
          <h2 className="text-sm font-700 text-foreground">مشخصات کلیدی</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {keySpecs(listing).map((spec) => (
            <div
              key={`key-${spec.label}`}
              className="rounded-xl bg-muted/40 border border-border p-3"
            >
              <div className="flex items-center gap-1.5">
                <span className={spec.color}>{spec.icon}</span>
                <span className="text-2xs text-muted-foreground">
                  {spec.label}
                </span>
              </div>
              <div className="mt-1.5 text-sm font-700 text-foreground">
                {spec.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="card-elevated p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
            <Settings2 size={15} className="text-muted-foreground" />
          </span>
          <h2 className="text-sm font-700 text-foreground">رنگ و ظاهر</h2>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl border-2 border-border shadow-card"
            style={{ backgroundColor: listing.colorHex }}
            title={listing.color}
          />
          <div>
            <div className="text-sm font-700 text-foreground">
              {listing.color}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              رنگ کارخانه‌ای
            </div>
          </div>
        </div>
      </div>

      {/* Spec groups — one of them (powertrain) is dark for contrast */}
      {specGroups(listing).map((group) =>
        group.dark ? (
          <div
            key={group.id}
            className="relative overflow-hidden rounded-2xl bg-foreground p-5 text-white shadow-lg ring-1 ring-white/10"
          >
            <div
              className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl"
              aria-hidden
            />
            <div className="relative flex items-center gap-2 mb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                {group.icon}
              </span>
              <h2 className="text-sm font-700 text-white">{group.title}</h2>
            </div>
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {group.items.map((item) => (
                <div
                  key={`spec-${group.id}-${item.label}`}
                  className="flex flex-col gap-0.5"
                >
                  <span className="text-2xs font-600 text-slate-400 uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-sm font-600 text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div key={group.id} className="card-elevated p-5">
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${group.tint}`}
              >
                {group.icon}
              </span>
              <h2 className="text-sm font-700 text-foreground">
                {group.title}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {group.items.map((item) => (
                <div
                  key={`spec-${group.id}-${item.label}`}
                  className="flex flex-col gap-0.5"
                >
                  <span className="text-2xs font-600 text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-sm font-600 text-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ),
      )}

      {/* Factory options */}
      <div className="relative overflow-hidden rounded-2xl bg-foreground p-5 text-white shadow-lg ring-1 ring-white/10">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/10">
            <CheckCircle size={15} className="text-success" />
          </span>
          <h2 className="text-sm font-700 text-background">
            امکانات و تجهیزات کارخانه
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {listing.factoryOptions.map((opt) => (
            <div
              key={`opt-${listing.id}-${opt}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-success/8 border border-success/20 rounded-lg"
            >
              <CheckCircle size={11} className="text-success flex-shrink-0" />
              <span className="text-xs font-600 text-background">{opt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
