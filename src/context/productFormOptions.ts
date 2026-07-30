import {
  brandFa,
  bodyTypeFa,
  cityFa,
  fuelTypeFa,
} from "@/context/marketFilters";
import { listings } from "@/context/data";
import type { Listing } from "@/types/dataTypes";

export type SelectOption = { value: string; label: string };

// ── Brands (Persian) ────────────────────────────────────────────────────
export const brandOptions: SelectOption[] = Object.values(brandFa).map(
  (label) => ({
    value: label,
    label,
  }),
);

// ── Models, keyed by Persian brand ──────────────────────────────────────
export const modelsByBrand: Record<string, string[]> = {};
for (const l of listings) {
  const brandLabel = brandFa[l.brand];
  if (!brandLabel) continue;
  (modelsByBrand[brandLabel] ??= []).push(l.model);
}
// Deduplicate
for (const key of Object.keys(modelsByBrand)) {
  modelsByBrand[key] = [...new Set(modelsByBrand[key])];
}

export function getModelsForBrand(brand: string): SelectOption[] {
  const models = modelsByBrand[brand] ?? [];
  return models.map((m) => ({ value: m, label: m }));
}

// ── Years ───────────────────────────────────────────────────────────────
export const yearOptions: SelectOption[] = [
  "۱۴۰۵",
  "۱۴۰۴",
  "۱۴۰۳",
  "۱۴۰۲",
  "۱۴۰۱",
].map((y) => ({
  value: y,
  label: y,
}));

// ── Colors ──────────────────────────────────────────────────────────────
export const colorOptions: SelectOption[] = [
  "سفید",
  "مشکی",
  "خاکستری",
  "نقره‌ای",
  "آبی",
  "قرمز",
  "طلایی",
  "سبز",
  "قهوه‌ای",
].map((c) => ({ value: c, label: c }));

/** Maps Persian color name → default hex code. */
export const colorHexMap: Record<string, string> = {
  سفید: "#FAFAFA",
  مشکی: "#1A1A1A",
  خاکستری: "#9CA3AF",
  نقره‌ای: "#C0C0C0",
  آبی: "#2563EB",
  قرمز: "#DC2626",
  طلایی: "#C9A96E",
  سبز: "#16A34A",
  قهوه‌ای: "#8B4513",
};

/** Look up the hex for a given Persian color name. Falls back to #1b4fd8. */
export function getColorHex(colorName: string): string {
  return colorHexMap[colorName] ?? "#1b4fd8";
}

// ── Cities ──────────────────────────────────────────────────────────────
export const cityOptions: SelectOption[] = Object.values(cityFa).map(
  (label) => ({
    value: label,
    label,
  }),
);

// ── Body types ──────────────────────────────────────────────────────────
export const bodyTypeOptions: SelectOption[] = [
  { value: "سدان", label: "سدان" },
  { value: "شاسی‌بلند", label: "شاسی‌بلند" },
  { value: "هاچ‌بک", label: "هاچ‌بک" },
  { value: "کوپه", label: "کوپه" },
  { value: "ون", label: "ون" },
];

// ── Fuel types ──────────────────────────────────────────────────────────
export const fuelTypeOptions: SelectOption[] = Object.values(fuelTypeFa).map(
  (label) => ({
    value: label,
    label,
  }),
);

// ── Transmissions ───────────────────────────────────────────────────────
export const transmissionOptions: SelectOption[] = [
  { value: "اتوماتیک", label: "اتوماتیک" },
  { value: "دستی", label: "دستی" },
  { value: "CVT", label: "CVT" },
  { value: "دو کلاچه (DCT)", label: "دو کلاچه (DCT)" },
];

// ── Status ──────────────────────────────────────────────────────────────
export const productStatusOptions: SelectOption[] = [
  { value: "active", label: "موجود" },
  { value: "pending", label: "در انتظار" },
  { value: "negotiable", label: "قابل مذاکره" },
  { value: "reserved", label: "رزرو شده" },
  { value: "sold", label: "فروخته شد" },
];

// ── Helper ──────────────────────────────────────────────────────────────
/** Add the current value to the front of the list if it's not already present. */
export function withCurrent(list: string[], current?: string): string[] {
  if (current && !list.includes(current)) return [current, ...list];
  return list;
}

// ── Transmission English → Persian ──────────────────────────────────────
const transmissionFa: Record<string, string> = {
  CVT: "CVT",
  DCT: "دو کلاچه (DCT)",
  DSG: "دو کلاچه (DCT)",
  Manual: "دستی",
  Automatic: "اتوماتیک",
  AT: "اتوماتیک",
  Steptronic: "اتوماتیک",
};

function translateTransmission(english: string): string {
  const upper = english.toUpperCase();
  if (upper.includes("CVT") || upper.includes("E-CVT"))
    return transmissionFa.CVT;
  if (upper.includes("DCT") || upper.includes("DSG")) return transmissionFa.DCT;
  if (upper.includes("MANUAL")) return transmissionFa.Manual;
  return transmissionFa.AT; // default: automatic
}

// ── Auto-fill specs from listing data ───────────────────────────────────
export interface CarSpecs {
  engine: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
}

/** Convert Persian digits (۰۱۲۳۴۵۶۷۸۹) to ASCII digits (0123456789). */
function toEnglishDigits(s: string): string {
  return s.replace(/[۰-۹]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 1728),
  );
}

/** Convert a Gregorian year number (e.g. 2026) to a Persian year string (e.g. "۱۴۰۵"). */
export function toPersianYear(gregorian: number): string {
  const persianNum = gregorian - 621;
  return String(persianNum).replace(/[0-9]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 1728),
  );
}

/**
 * Given a Persian brand label, a model name, and optionally a Persian year
 * (e.g. "۱۴۰۵"), return the known specs from the listing catalog.
 * When a year is provided the lookup prefers an exact brand+model+year match
 * and falls back to matching on brand+model only.  Returns null when the
 * combo is unknown.
 */
export function getCarSpecs(
  persianBrand: string,
  model: string,
  persianYear?: string,
): CarSpecs | null {
  // Find the English brand key for this Persian label
  const englishBrand = Object.entries(brandFa).find(
    ([, fa]) => fa === persianBrand,
  )?.[0];
  if (!englishBrand) return null;

  // Convert Persian year → Gregorian (approx. Persian + 621 = Gregorian)
  const gregorianYear = persianYear
    ? Number(toEnglishDigits(persianYear)) + 621
    : undefined;

  let match: Listing | undefined;

  if (gregorianYear && !Number.isNaN(gregorianYear)) {
    // Prefer exact brand + model + year match
    match = listings.find(
      (l) =>
        l.brand === englishBrand &&
        l.model === model &&
        l.year === gregorianYear,
    );
  }

  // Fallback to brand + model only
  if (!match) {
    match = listings.find((l) => l.brand === englishBrand && l.model === model);
  }

  if (!match) return null;

  return {
    engine: match.engine,
    transmission: translateTransmission(match.transmission),
    fuelType: fuelTypeFa[match.fuelType] ?? match.fuelType,
    bodyType: bodyTypeFa[match.bodyType] ?? match.bodyType,
  };
}
