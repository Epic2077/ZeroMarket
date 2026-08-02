import { brandFa, bodyTypeFa, fuelTypeFa } from "@/context/marketFilters";
import { listings } from "@/context/data";
import type { Listing } from "@/types/dataTypes";

export interface CarSpecs {
  engine: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
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
  return transmissionFa.AT;
}

/** Convert Persian digits (۰۱۲۳۴۵۶۷۸۹) to ASCII digits (0123456789). */
function toEnglishDigits(s: string): string {
  return s.replace(/[۰-۹]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 1728),
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
  const englishBrand = Object.entries(brandFa).find(
    ([, fa]) => fa === persianBrand,
  )?.[0];
  if (!englishBrand) return null;

  const gregorianYear = persianYear
    ? Number(toEnglishDigits(persianYear)) + 621
    : undefined;

  let match: Listing | undefined;

  if (gregorianYear && !Number.isNaN(gregorianYear)) {
    match = listings.find(
      (l) =>
        l.brand === englishBrand &&
        l.model === model &&
        l.year === gregorianYear,
    );
  }

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
