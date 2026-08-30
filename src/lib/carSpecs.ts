import { brandFa, bodyTypeFa, fuelTypeFa } from "@/context/marketFilters";

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
