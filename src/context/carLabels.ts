import type { Listing } from "@/types/dataTypes";

/* --------------------------- Persian digit helpers ----------------------- */

// Convert latin digits to Persian digits (no thousands separator added).
export const toFa = (value: string | number): string =>
  String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

// Convert Persian/Arabic-Indic digits to latin digits.
export const toEn = (value: string | number): string =>
  String(value).replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());

/* ------------------------------ Label maps ------------------------------- */

// English source data → Persian display label. Filtering/UI compares against
// these mapped labels, so keep them in sync when adding listings.

export const brandModelFa: Record<string, string> = {
  "Toyota Camry": "تویوتا کمری",
  "Hyundai Tucson": "هیوندای توسان",
  "Kia Sportage": "کیا اسپورتیج",
  "BMW 3 Series": "بی‌ام‌و سری ۳",
  "Geely Coolray": "جیلی کول‌ری",
  "Haval H6": "هاوال H6",
  "Jetour X70 Plus": "جتور X70 پلاس",
  "Chery Tiggo 8 Pro": "چری تیگو ۸ پرو",
  "MVM 550": "ام‌وی‌ام ۵۵۰",
  "Honda CR-V": "هوندا CR-V",
  "IKCO Dena Plus": "ایران‌خودرو دنا پلاس",
  "Volkswagen Tiguan": "فولکس‌واگن تیگوان",
};

export const colorFa: Record<string, string> = {
  "Pearl White": "سفید صدفی",
  "Midnight Black": "مشکی",
  "Steel Gray": "خاکستری فولادی",
  "Alpine White": "سفید",
  "Ocean Blue": "آبی اقیانوسی",
  "Crimson Red": "قرمز",
  "Champagne Gold": "طلایی شامپاینی",
  "Glacier White": "سفید یخی",
  "Deep Blue": "آبی سیر",
  "Sonic Gray Pearl": "خاکستری",
  "Silver Metallic": "نقره‌ای متالیک",
  "Deep Black Pearl": "مشکی صدفی",
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

export const sellerFa: Record<string, string> = {
  "Aria Motors": "آریا موتورز",
  "Parsian Auto": "پارسیان خودرو",
  "Mehr Khodro": "مهر خودرو",
  "Bavarian Motors TH": "باواریان موتورز",
  "Star Auto Group": "استار خودرو",
  "Haval Center NW": "مرکز هاوال",
  "Capital Auto TH": "کاپیتال خودرو",
  "Sina Motors": "سینا موتورز",
  "Tehran Auto Mall": "اتومال تهران",
  "IKCO Direct": "ایران‌خودرو دایرکت",
  "Euro Motors Tehran": "یورو موتورز تهران",
};

/* ----------------------------- Label getters ----------------------------- */
// Each falls back to the latin source when no Persian label is registered.

export const brandModelLabel = (listing: Pick<Listing, "brand" | "model">): string => {
  const key = `${listing.brand} ${listing.model}`;
  return brandModelFa[key] ?? key;
};

export const colorLabel = (color: string): string => colorFa[color] ?? color;

export const bodyTypeLabel = (bodyType: string): string =>
  bodyTypeFa[bodyType] ?? bodyType;

export const cityLabel = (city: string): string => cityFa[city] ?? city;

export const sellerLabel = (sellerName: string): string =>
  sellerFa[sellerName] ?? sellerName;
