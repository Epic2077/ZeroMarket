import type { FieldErrors } from "react-hook-form";
import { z } from "zod";
import { requiredText } from "../validation";

export const productSchema = z.object({
  brand: requiredText("برند را انتخاب کنید"),
  model: requiredText("مدل الزامی است"),
  trim: requiredText("تریم الزامی است"),
  year: requiredText("سال را انتخاب کنید"),
  color: requiredText("رنگ را انتخاب کنید"),
  colorHex: z.string().regex(/^#([0-9a-fA-F]{6})$/, "کد رنگ نامعتبر است"),
  engine: requiredText("موتور الزامی است"),
  transmission: requiredText("گیربکس را انتخاب کنید"),
  fuelType: requiredText("نوع سوخت را انتخاب کنید"),
  bodyType: requiredText("نوع بدنه را انتخاب کنید"),
  city: requiredText("شهر را انتخاب کنید"),
  deliveryDays: z
    .string()
    .refine((v) => /^\d+$/.test(v), "تعداد روز نامعتبر است"),
  price: z
    .string()
    .min(1, "قیمت الزامی است")
    .refine((v) => Number(v.replace(/\D/g, "")) > 0, "قیمت نامعتبر است"),
  status: z.enum(["active", "pending", "sold", "negotiable", "reserved"]),
  sellerNotes: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductFormErrors = FieldErrors<ProductFormValues>;
