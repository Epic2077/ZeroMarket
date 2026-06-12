import { listings, formatPrice } from "@/context/data";
import { bodyTypeFa, brandFa, cityFa, fuelTypeFa } from "@/context/marketFilters";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const toFa = (value: number | string) =>
  String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export default async function SinglePage({ params }: PageProps) {
  const { id } = await params;
  const listing = listings.find((l) => l.id === id);

  if (!listing) notFound();

  const specs = [
    { label: "برند", value: brandFa[listing.brand] ?? listing.brand },
    { label: "مدل", value: listing.model },
    { label: "تریم", value: listing.trim },
    { label: "سال", value: toFa(listing.year) },
    { label: "نوع بدنه", value: bodyTypeFa[listing.bodyType] ?? listing.bodyType },
    { label: "سوخت", value: fuelTypeFa[listing.fuelType] ?? listing.fuelType },
    { label: "شهر", value: cityFa[listing.city] ?? listing.city },
    { label: "موتور", value: listing.engine },
    { label: "گیربکس", value: listing.transmission },
  ];

  return (
    <section
      dir="rtl"
      className="max-w-screen-lg mx-auto px-4 lg:px-8 py-8 vazir-matn"
    >
      <Link
        href="/market"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowRight size={16} />
        بازگشت به بازار
      </Link>

      <div className="card-elevated p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-700 text-foreground">
              {brandFa[listing.brand] ?? listing.brand} {listing.model}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{listing.trim}</p>
          </div>
          <div className="text-left">
            <div className="text-xl font-700 text-primary tabular-nums">
              {formatPrice(listing.price)}
            </div>
            <div className="text-xs text-muted-foreground">تومان</div>
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {specs.map((spec) => (
            <div key={spec.label}>
              <dt className="text-xs text-muted-foreground mb-0.5">
                {spec.label}
              </dt>
              <dd className="text-sm font-600 text-foreground">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
