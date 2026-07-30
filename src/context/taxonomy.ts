import { brandFa, cityFa, fuelTypeFa } from "@/context/marketFilters";
import {
  colorOptions,
  transmissionOptions,
  yearOptions,
} from "@/context/newPostForm";
import { listings } from "@/context/data";

// The editable option lists that power the "make a post" selects. Owners and
// admins can add / rename / remove entries; the post form reads them live.
export type TaxonomyCategory =
  | "brands"
  | "years"
  | "colors"
  | "cities"
  | "bodyTypes"
  | "fuelTypes"
  | "transmissions";

export type TaxonomyState = Record<TaxonomyCategory, string[]>;

// Display metadata per category (used by the management UI).
export const taxonomyCategories: {
  id: TaxonomyCategory;
  label: string;
  noun: string;
}[] = [
  { id: "brands", label: "برندها", noun: "برند" },
  { id: "years", label: "سال تولید", noun: "سال" },
  { id: "colors", label: "رنگ‌ها", noun: "رنگ" },
  { id: "cities", label: "شهرها", noun: "شهر" },
  { id: "bodyTypes", label: "نوع بدنه", noun: "نوع بدنه" },
  { id: "fuelTypes", label: "نوع سوخت", noun: "سوخت" },
  { id: "transmissions", label: "گیربکس", noun: "گیربکس" },
];

// Status labels for the product editor.
export const statusOptions: { value: string; label: string }[] = [
  { value: "active", label: "موجود" },
  { value: "pending", label: "در انتظار" },
  { value: "negotiable", label: "قابل مذاکره" },
  { value: "reserved", label: "رزرو شده" },
  { value: "sold", label: "فروخته شد" },
];

// ── Brand → models ─────────────────────────────────────────────────────
// Keyed by Persian brand name (e.g. "تویوتا"), values are model names from
// the listing catalog. Derived automatically so it stays in sync with data.
export const modelsByBrand: Record<string, string[]> = {};
for (const l of listings) {
  const brand = brandFa[l.brand];
  if (!brand) continue;
  if (!modelsByBrand[brand]) modelsByBrand[brand] = [];
  if (!modelsByBrand[brand].includes(l.model)) {
    modelsByBrand[brand].push(l.model);
  }
}

// Return the models available for the given (Persian) brand, defaulting to an
// empty array when the brand has no known models.
export function getModelsForBrand(brand: string): string[] {
  return modelsByBrand[brand] ?? [];
}

// Seeded from the existing static option sources so the panels start in sync
// with the rest of the app.
export const initialTaxonomy: TaxonomyState = {
  brands: Object.values(brandFa),
  years: yearOptions.map((o) => o.value),
  colors: colorOptions.map((o) => o.value),
  cities: Object.values(cityFa),
  bodyTypes: ["سدان", "شاسی‌بلند", "هاچ‌بک", "کوپه", "ون"],
  fuelTypes: Object.values(fuelTypeFa),
  transmissions: transmissionOptions.map((o) => o.value),
};
