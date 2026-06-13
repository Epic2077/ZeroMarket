import { CheckCircle, Settings2, Car, Gauge, Package } from "lucide-react";
import { Listing } from "@/types/dataTypes";

interface Props {
  listing: Listing;
}

const specGroups = (listing: Listing) => [
  {
    id: "specs-identity",
    title: "مشخصات خودرو",
    icon: <Car size={15} className="text-primary" />,
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
    id: "specs-powertrain",
    title: "موتور و انتقال قدرت",
    icon: <Gauge size={15} className="text-accent" />,
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
      {/* Color */}
      <div className="card-elevated p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 size={15} className="text-muted-foreground" />
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

      {/* Spec groups */}
      {specGroups(listing).map((group) => (
        <div key={group.id} className="card-elevated p-5">
          <div className="flex items-center gap-2 mb-4">
            {group.icon}
            <h2 className="text-sm font-700 text-foreground">{group.title}</h2>
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
      ))}

      {/* Factory options */}
      <div className="card-elevated p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={15} className="text-success" />
          <h2 className="text-sm font-700 text-foreground">
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
              <span className="text-xs font-600 text-foreground">{opt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
