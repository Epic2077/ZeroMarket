import {
  brandOptions,
  colorOptions,
  cityOptions,
  bodyTypeOptions,
  fuelTypeOptions,
  transmissionOptions,
  yearOptions,
  getModelsForBrand,
  getCarSpecs,
  type SelectOption,
} from "@/context/productFormOptions";
import { brandFa } from "@/context/marketFilters";
import { formatPrice } from "@/context/data";

export {
  brandOptions,
  colorOptions,
  cityOptions,
  bodyTypeOptions,
  fuelTypeOptions,
  transmissionOptions,
  yearOptions,
  type SelectOption,
};

export function modelOptions(brand: string): SelectOption[] {
  return getModelsForBrand(brand);
}

// Average price per brand (in Tomans) - approximate market values
const BRAND_AVG_PRICE: Record<string, number> = {
  "تویوتا": 3_000_000_000,
  "هیوندای": 2_800_000_000,
  "کیا": 2_500_000_000,
  "بی‌ام‌و": 7_500_000_000,
  "جیلی": 1_500_000_000,
  "هاوال": 2_100_000_000,
  "جتور": 1_800_000_000,
  "چری": 2_300_000_000,
  "ایران‌خودرو": 900_000_000,
  "ام‌وی‌ام": 700_000_000,
  "هوندا": 5_000_000_000,
  "فولکس‌واگن": 6_000_000_000,
};

export function suggestedPrice(brand: string): number | null {
  return BRAND_AVG_PRICE[brand] ?? null;
}