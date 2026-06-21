import { listings } from "@/context/data";
import { brandFa, type SelectOption } from "@/context/marketFilters";

const toOptions = (values: string[]): SelectOption[] =>
  values.map((v) => ({ value: v, label: v }));

export const yearOptions = toOptions(["۱۴۰۵", "۱۴۰۴", "۱۴۰۳"]);

export const transmissionOptions = toOptions([
  "اتوماتیک",
  "دستی",
  "CVT",
  "دو کلاچه (DCT)",
]);

export const colorOptions = toOptions([
  "سفید",
  "مشکی",
  "خاکستری",
  "نقره‌ای",
  "آبی",
  "قرمز",
  "طلایی",
]);

// Distinct models, optionally narrowed to the chosen (Persian) brand.
export function modelOptions(brand: string): SelectOption[] {
  const models = new Set<string>();
  for (const l of listings) {
    if (!brand || brandFa[l.brand] === brand) models.add(l.model);
  }
  return toOptions([...models]);
}

// Suggested price = average analyzed market sell price across listings of the
// selected brand. Returns null when there's no data to analyze.
export function suggestedPrice(brand: string): number | null {
  const matches = listings.filter((l) => brandFa[l.brand] === brand);
  if (!matches.length) return null;
  const avg =
    matches.reduce((sum, l) => sum + l.marketAvgSell, 0) / matches.length;
  return Math.round(avg);
}
