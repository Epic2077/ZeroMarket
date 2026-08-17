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
import { useState } from "react";
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

const formatFa = (n: number) =>
  n ? new Intl.NumberFormat("fa-IR").format(n) : "";

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
  const [showModal, setShowModal] = useState(false);

  const hasAverage =
    !!market && (market.marketAvgBuy > 0 || market.marketAvgSell > 0);

  const suggestPrice = (value?: number) => {
    if (!market && !value) return;
    const v = value ?? market!.marketAvgBuy;
    setValue("price", v.toLocaleString("en-US"), {
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
              <>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  disabled={marketLoading}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-600 bg-negotiable/10 border border-negotiable/25 text-negotiable hover:bg-negotiable/20 transition-colors duration-150"
                  title={
                    market?.marketAvgBuy
                      ? `میانگین بازار: ${market.marketAvgBuy.toLocaleString("en-US")} تومان`
                      : undefined
                  }
                >
                  <Sparkles size={13} />
                  پیشنهاد قیمت
                </button>

                {showModal && (
                  <div
                    className="fixed inset-0 z-70 flex items-center justify-center p-4 vazir-matn"
                    dir="rtl"
                    role="dialog"
                    aria-modal="true"
                    aria-label="پیشنهاد قیمت"
                  >
                    <div
                      className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
                      onClick={() => setShowModal(false)}
                    />
                    <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                      <div className="px-6 pt-6 pb-3">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 text-primary flex items-center justify-center shadow-sm">
                            <Sparkles size={20} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-base font-800 text-foreground">
                              پیشنهاد قیمت هوشمند
                            </h3>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                              این اعداد بر اساس داده‌های واقعی بازار و رفتار
                              کاربران محاسبه شده‌اند تا به شما کمک کنند در خرید
                              و فروش تصمیمی دقیق‌تر بگیرید.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowModal(false)}
                            aria-label="بستن"
                            className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-3">
                        <div className="flex flex-col gap-4">
                          {market?.marketAvgBuy > 0 && (
                            <button
                              onClick={() => {
                                suggestPrice(market.marketAvgBuy);
                                setShowModal(false);
                              }}
                              className="w-full flex items-center justify-between gap-4 px-5 py-4 rounded-xl bg-white/50 border border-border shadow hover:shadow-md transition-shadow duration-200"
                            >
                              <div className="text-right">
                                <div className="text-sm font-800">
                                  میانگین بازار
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  میانگینی از آگهی‌های فعال
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-800 text-primary">
                                  {formatFa(market.marketAvgBuy)} تومان
                                </div>
                                <div className="text-2xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  پیشنهاد
                                </div>
                              </div>
                            </button>
                          )}

                          {market?.marketAvgSell > 0 && (
                            <button
                              onClick={() => {
                                suggestPrice(market.marketAvgSell);
                                setShowModal(false);
                              }}
                              className="w-full flex items-center justify-between gap-4 px-5 py-4 rounded-xl bg-gradient-to-r from-success/10 to-success/5 border border-success/20 shadow hover:shadow-md transition-shadow duration-200"
                            >
                              <div className="text-right">
                                <div className="text-sm font-800">
                                  میانگین قیمت‌های فروش
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  قیمت‌هایی که بیشترین منجر به فروش شده‌اند
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-800 text-foreground">
                                  {formatFa(market.marketAvgSell)} تومان
                                </div>
                                <div className="text-2xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                                  پرفروش
                                </div>
                              </div>
                            </button>
                          )}

                          <div className="pt-2">
                            <button
                              onClick={() => setShowModal(false)}
                              className="w-full flex items-center justify-center text-center px-4 py-3 rounded-lg btn-secondary"
                            >
                              انصراف
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <FieldError>{errors.price?.message}</FieldError>
        </Field>
      </FieldGroup>
    </Section>
  );
}
