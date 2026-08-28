import {
  brandFa,
  bodyTypeFa,
  cityFa,
  fuelTypeFa,
} from "@/context/marketFilters";

export type SelectOption = { value: string; label: string };

// ── Brands (Persian) ────────────────────────────────────────────────────
export const brandOptions: SelectOption[] = Object.values(brandFa).map(
  (label) => ({
    value: label,
    label,
  }),
);

// ── Models, keyed by Persian brand (static data) ────────────────────────
export const modelsByBrand: Record<string, string[]> = {
  "تویوتا": ["Camry", "Corolla", "RAV4", "Prius", "Yaris"],
  "هیوندای": ["Tucson", "Elantra", "Santa Fe", "Sonata", "Kona"],
  "کیا": ["Sportage", "Sorento", "Cerato", "Picanto", "Seltos"],
  "بی‌ام‌و": ["3 Series", "5 Series", "X3", "X5", "X1"],
  "جیلی": ["Coolray", "Emgrand", "Atlas", "Binrui", "Okavango"],
  "هاوال": ["H6", "H9", "Jolion", "Dargo", "H2"],
  "جتور": ["X70 Plus", "X90", "Dashing", "T2", "T1"],
  "چری": ["Tiggo 8 Pro", "Tiggo 7 Pro", "Tiggo 4 Pro", "Arrizo 6", "Arrizo 5"],
  "ایران‌خودرو": ["Dena Plus", "Runna", "Tara", "Soren", "Arisun"],
  "ام‌وی‌ام": ["550", "X22", "X33", "X55", "X55 Pro"],
  "هوندا": ["CR-V", "Civic", "Accord", "HR-V", "City"],
  "فولکس‌واگن": ["Tiguan", "Passat", "Jetta", "T-Roc", "Golf"],
};

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
/** Static car specs mapping by Persian brand and model. */
const carSpecsByBrandModel: Record<string, Record<string, CarSpecs>> = {
  "تویوتا": {
    "Camry": { engine: "2.5L 4-Cyl Hybrid", transmission: "اتوماتیک", fuelType: "هیبریدی", bodyType: "سدان" },
    "Corolla": { engine: "1.8L 4-Cyl Petrol", transmission: "CVT", fuelType: "بنزینی", bodyType: "سدان" },
    "RAV4": { engine: "2.5L 4-Cyl Hybrid", transmission: "اتوماتیک", fuelType: "هیبریدی", bodyType: "شاسی‌بلند" },
    "Prius": { engine: "1.8L 4-Cyl Hybrid", transmission: "CVT", fuelType: "هیبریدی", bodyType: "سدان" },
    "Yaris": { engine: "1.5L 4-Cyl Petrol", transmission: "CVT", fuelType: "بنزینی", bodyType: "سدان" },
  },
  "هیوندای": {
    "Tucson": { engine: "2.0L Turbo", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "Elantra": { engine: "1.6L 4-Cyl Petrol", transmission: "CVT", fuelType: "بنزینی", bodyType: "سدان" },
    "Santa Fe": { engine: "2.5L Turbo", transmission: "اتوماتیک", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "Sonata": { engine: "2.5L 4-Cyl Petrol", transmission: "اتوماتیک", fuelType: "بنزینی", bodyType: "سدان" },
    "Kona": { engine: "1.6L Turbo", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
  },
  "کیا": {
    "Sportage": { engine: "1.6L Turbo GDI", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "Sorento": { engine: "2.5L Turbo", transmission: "اتوماتیک", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "Cerato": { engine: "2.0L 4-Cyl Petrol", transmission: "CVT", fuelType: "بنزینی", bodyType: "سدان" },
    "Picanto": { engine: "1.2L 4-Cyl Petrol", transmission: "CVT", fuelType: "بنزینی", bodyType: "هاچ‌بک" },
    "Seltos": { engine: "1.6L Turbo", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
  },
  "بی‌ام‌و": {
    "3 Series": { engine: "2.0L TwinPower Turbo", transmission: "اتوماتیک", fuelType: "بنزینی", bodyType: "سدان" },
    "5 Series": { engine: "3.0L TwinPower Turbo", transmission: "اتوماتیک", fuelType: "بنزینی", bodyType: "سدان" },
    "X3": { engine: "2.0L TwinPower Turbo", transmission: "اتوماتیک", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "X5": { engine: "3.0L TwinPower Turbo", transmission: "اتوماتیک", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "X1": { engine: "2.0L TwinPower Turbo", transmission: "اتوماتیک", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
  },
  "جیلی": {
    "Coolray": { engine: "1.5L Turbo", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "Emgrand": { engine: "1.5L 4-Cyl Petrol", transmission: "CVT", fuelType: "بنزینی", bodyType: "سدان" },
    "Atlas": { engine: "2.0L Turbo", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "Binrui": { engine: "1.4L Turbo", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "سدان" },
    "Okavango": { engine: "2.0L Turbo", transmission: "اتوماتیک", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
  },
  "هاوال": {
    "H6": { engine: "1.5L PHEV", transmission: "دو کلاچه (DCT)", fuelType: "پلاگین هیبرید", bodyType: "شاسی‌بلند" },
    "H9": { engine: "2.0L Turbo", transmission: "اتوماتیک", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "Jolion": { engine: "1.5L Turbo", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "Dargo": { engine: "2.0L Turbo", transmission: "اتوماتیک", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "H2": { engine: "1.5L 4-Cyl Petrol", transmission: "CVT", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
  },
  "جتور": {
    "X70 Plus": { engine: "2.0L Turbo", transmission: "اتوماتیک", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "X90": { engine: "2.0L Turbo", transmission: "اتوماتیک", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "Dashing": { engine: "1.6L Turbo", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "T2": { engine: "1.5L Turbo", transmission: "CVT", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "T1": { engine: "1.5L 4-Cyl Petrol", transmission: "CVT", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
  },
  "چری": {
    "Tiggo 8 Pro": { engine: "2.0T TGDI", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "Tiggo 7 Pro": { engine: "1.6L Turbo", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "Tiggo 4 Pro": { engine: "1.5L Turbo", transmission: "CVT", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "Arrizo 6": { engine: "1.6L Turbo", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "سدان" },
    "Arrizo 5": { engine: "1.5L 4-Cyl Petrol", transmission: "CVT", fuelType: "بنزینی", bodyType: "سدان" },
  },
  "ایران‌خودرو": {
    "Dena Plus": { engine: "1.65T Turbo", transmission: "اتوماتیک", fuelType: "بنزینی", bodyType: "سدان" },
    "Runna": { engine: "1.6L 4-Cyl Petrol", transmission: "دستی", fuelType: "بنزینی", bodyType: "سدان" },
    "Tara": { engine: "1.5L Turbo", transmission: "CVT", fuelType: "بنزینی", bodyType: "سدان" },
    "Soren": { engine: "1.8L 4-Cyl Petrol", transmission: "دستی", fuelType: "بنزینی", bodyType: "سدان" },
    "Arisun": { engine: "1.5L 4-Cyl Petrol", transmission: "دستی", fuelType: "بنزینی", bodyType: "ون" },
  },
  "ام‌وی‌ام": {
    "550": { engine: "1.5L Naturally Aspirated", transmission: "دستی", fuelType: "بنزینی", bodyType: "سدان" },
    "X22": { engine: "1.5L Turbo", transmission: "CVT", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "X33": { engine: "1.5L Turbo", transmission: "CVT", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "X55": { engine: "1.5L Turbo", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "X55 Pro": { engine: "1.5L Turbo", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
  },
  "هوندا": {
    "CR-V": { engine: "2.0L i-MMD Hybrid", transmission: "CVT", fuelType: "هیبریدی", bodyType: "شاسی‌بلند" },
    "Civic": { engine: "1.5L Turbo", transmission: "CVT", fuelType: "بنزینی", bodyType: "سدان" },
    "Accord": { engine: "2.0L Hybrid", transmission: "CVT", fuelType: "هیبریدی", bodyType: "سدان" },
    "HR-V": { engine: "1.5L 4-Cyl Petrol", transmission: "CVT", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "City": { engine: "1.5L 4-Cyl Petrol", transmission: "CVT", fuelType: "بنزینی", bodyType: "سدان" },
  },
  "فولکس‌واگن": {
    "Tiguan": { engine: "2.0L TSI", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "Passat": { engine: "2.0L TSI", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "سدان" },
    "Jetta": { engine: "1.4L TSI", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "سدان" },
    "T-Roc": { engine: "1.5L TSI", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "شاسی‌بلند" },
    "Golf": { engine: "1.5L TSI", transmission: "دو کلاچه (DCT)", fuelType: "بنزینی", bodyType: "هاچ‌بک" },
  },
};

/**
 * Given a Persian brand label, a model name, and optionally a Persian year
 * (e.g. "۱۴۰۵"), return the known specs from the static catalog.
 * Returns null when the combo is unknown.
 */
export function getCarSpecs(
  persianBrand: string,
  model: string,
  persianYear?: string,
): CarSpecs | null {
  const brandSpecs = carSpecsByBrandModel[persianBrand];
  if (!brandSpecs) return null;
  const specs = brandSpecs[model];
  if (!specs) return null;
  return specs;
}
