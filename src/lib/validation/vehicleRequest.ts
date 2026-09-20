import { z } from "zod";
import { requiredText } from "../validation";

export const vehicleRequestSchema = z.object({
  brand: requiredText("برند را انتخاب کنید"),
  model: requiredText("مدل را انتخاب کنید"),
  purchaseMethod: requiredText("روش خرید را انتخاب کنید"),
  firstName: requiredText("نام الزامی است"),
  lastName: requiredText("نام خانوادگی الزامی است"),
  city: requiredText("شهر را انتخاب کنید"),
  phone: requiredText("شماره تماس الزامی است")
    .refine((v) => /^09\d{9}$/.test(v), "شماره تماس نامعتبر است"),
});

export type VehicleRequestFormValues = z.infer<typeof vehicleRequestSchema>;