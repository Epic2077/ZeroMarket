import { Listing } from "@/types/dataTypes";
import { FilterState } from "@/types/marketplace";

export type SelectOption = { value: string; label: string };

/* Persian labels keyed by the raw (english) value stored on a Listing. */
export const brandFa: Record<string, string> = {
  Toyota: "تویوتا",
  Hyundai: "هیوندای",
  Kia: "کیا",
  BMW: "بی‌ام‌و",
  Geely: "جیلی",
  Haval: "هاوال",
  Jetour: "جتور",
  Chery: "چری",
  IKCO: "ایران‌خودرو",
  MVM: "ام‌وی‌ام",
  Honda: "هوندا",
  Volkswagen: "فولکس‌واگن",
};

export const bodyTypeFa: Record<string, string> = {
  Sedan: "سدان",
  SUV: "شاسی‌بلند",
};

export const cityFa: Record<string, string> = {
  Tehran: "تهران",
  Isfahan: "اصفهان",
  Mashhad: "مشهد",
  Shiraz: "شیراز",
  Tabriz: "تبریز",
  Karaj: "کرج",
};

export const fuelTypeFa: Record<string, string> = {
  Petrol: "بنزینی",
  Hybrid: "هیبریدی",
  "Plug-in Hybrid": "پلاگین هیبرید",
  Electric: "برقی",
};

const toOptions = (labels: string[]): SelectOption[] =>
  labels.map((label) => ({ value: label, label }));

/* Filter dropdown options. brand/body/city/fuel filter on the Persian label;
   status filters on the raw value but shows a Persian label. */
export const brandOptions = toOptions(Object.values(brandFa));
export const bodyTypeOptions = toOptions([
  "سدان",
  "شاسی‌بلند",
  "هاچ‌بک",
  "کوپه",
  "ون",
]);
export const cityOptions = toOptions(Object.values(cityFa));
export const fuelTypeOptions = toOptions(["بنزینی", "هیبریدی", "پلاگین هیبرید", "برقی"]);
export const statusOptions: SelectOption[] = [
  { value: "active", label: "موجود" },
  { value: "pending", label: "در انتظار" },
  { value: "negotiable", label: "قابل مذاکره" },
  { value: "reserved", label: "رزرو شده" },
];

const BILLION = 1_000_000_000;

export function applyFilters(listings: Listing[], f: FilterState): Listing[] {
  const search = f.search.trim().toLowerCase();
  const min = parseFloat(f.priceMin);
  const max = parseFloat(f.priceMax);

  return listings.filter((l) => {
    if (search) {
      const haystack =
        `${l.brand} ${l.model} ${l.trim} ${l.sellerName}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (f.brand && brandFa[l.brand] !== f.brand) return false;
    if (f.bodyType && bodyTypeFa[l.bodyType] !== f.bodyType) return false;
    if (f.city && cityFa[l.city] !== f.city) return false;
    if (f.fuelType && fuelTypeFa[l.fuelType] !== f.fuelType) return false;
    if (f.status && l.status !== f.status) return false;
    if (f.verifiedOnly && !l.sellerVerified) return false;
    if (!Number.isNaN(min) && l.price < min * BILLION) return false;
    if (!Number.isNaN(max) && l.price > max * BILLION) return false;
    return true;
  });
}

export function activeFilterCount(f: FilterState): number {
  return [
    f.search.trim(),
    f.brand,
    f.bodyType,
    f.city,
    f.fuelType,
    f.status,
    f.priceMin,
    f.priceMax,
    f.verifiedOnly,
  ].filter(Boolean).length;
}
