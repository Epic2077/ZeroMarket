"use client";

import { Tag, Sparkles } from "lucide-react";
import { Section } from "@/components/shared/Section";
import { SelectField } from "@/components/shared/SelectField";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Controller,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { withCurrent, fromPersianYear } from "@/lib/utils";
import { useMarketInsight } from "@/hooks/useMarketInsight";
import type {
  ProductFormErrors,
  ProductFormValues,
} from "@/lib/validation/product";

/** Listing status options — static UI labels, not taxonomy data. */
const productStatusOptions = [
  { value: "active", label: "موجود" },
  { value: "pending", label: "در انتظار" },
  { value: "negotiable", label: "قابل مذاکره" },
  { value: "reserved", label: "رزرو شده" },
  { value: "sold", label: "فروخته شد" },
] as const;

interface AvailabilityPriceSectionProps {
  control: Control<ProductFormValues>;
  errors: ProductFormErrors;
  listing?: { city?: string };
  setValue: UseFormSetValue<ProductFormValues>;
  cityOptions: string[];
  /** Current form values needed for market insight lookup. */
  brand: string;
  model: string;
  year: string; // Persian year string (e.g. "۱۴۰۲")
}

const groupThousands = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("en-US") : "";
};

export function AvailabilityPriceSection({
  control,
  errors,
  listing,
  setValue,
  cityOptions,
  brand,
  model,
  year,
}: AvailabilityPriceSectionProps) {
  // Convert Persian year to Gregorian for the market insight lookup
  const gYear = fromPersianYear(year || "۱۴۰۴");

  const { market, loading: marketLoading } = useMarketInsight(
    brand,
    model,
    gYear,
    0, // price not needed — we only read marketAvgBuy
  );

  const hasAverage = market !== null;

  const suggestPrice = () => {
    if (!market) return;
    setValue("price", market.marketAvgBuy.toLocaleString("en-US"), {
      shouldValidate: true,
    });
  };
  return (
    <Section
      icon={<Tag size={16} className="text-success" />}
      title="موجودی و قیمت"
    >
      <FieldGroup>
        <Field className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectField
            id="p-city"
            label="شهر"
            control={control}
            name="city"
            options={cityOptions}
            placeholder="انتخاب شهر"
            error={errors.city?.message}
            withCurrent={withCurrent}
            currentValue={listing?.city}
          />
          <Field data-invalid={!!errors.deliveryDays}>
            <FieldLabel htmlFor="p-delivery">زمان تحویل (روز)</FieldLabel>
            <Input
              id="p-delivery"
              inputMode="numeric"
              dir="ltr"
              className="text-right"
              aria-invalid={!!errors.deliveryDays}
              {...control.register("deliveryDays")}
            />
            <FieldError>{errors.deliveryDays?.message}</FieldError>
          </Field>
          <Field data-invalid={!!errors.status}>
            <FieldLabel htmlFor="p-status">وضعیت</FieldLabel>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  dir="rtl"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="p-status" className="w-full vazir-matn">
                    <SelectValue placeholder="انتخاب وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    {productStatusOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.status?.message}</FieldError>
          </Field>
        </Field>
        <Field data-invalid={!!errors.price}>
          <FieldLabel htmlFor="p-price">قیمت (تومان)</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="p-price"
              inputMode="numeric"
              dir="ltr"
              className="text-right font-mono flex-1"
              placeholder="۹۰۰٬۰۰۰٬۰۰۰"
              aria-invalid={!!errors.price}
              {...control.register("price", {
                onChange: (e) =>
                  setValue("price", groupThousands(e.target.value), {
                    shouldValidate: true,
                  }),
              })}
            />
            {hasAverage && (
              <button
                type="button"
                onClick={suggestPrice}
                disabled={marketLoading}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-600 bg-negotiable/10 border border-negotiable/25 text-negotiable hover:bg-negotiable/20 transition-colors duration-150"
                title={`میانگین بازار: ${market?.marketAvgBuy.toLocaleString("en-US")} تومان`}
              >
                <Sparkles size={13} />
                پیشنهاد قیمت
              </button>
            )}
          </div>
          <FieldError>{errors.price?.message}</FieldError>
        </Field>
      </FieldGroup>
    </Section>
  );
}
