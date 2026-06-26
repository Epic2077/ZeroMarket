import { brandFa, cityFa, fuelTypeFa } from "@/context/marketFilters";
import { colorOptions, transmissionOptions, yearOptions } from "@/context/newPostForm";

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
