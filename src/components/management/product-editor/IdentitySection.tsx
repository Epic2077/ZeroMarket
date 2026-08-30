"use client";

import { Car } from "lucide-react";
import { Section } from "@/components/shared/Section";
import { SelectField } from "@/components/shared/SelectField";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Controller, type Control } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toPersianYear, withCurrent } from "@/lib/utils";
import type {
  ProductFormErrors,
  ProductFormValues,
} from "@/lib/validation/product";

interface IdentitySectionProps {
  control: Control<ProductFormValues>;
  errors: ProductFormErrors;
  listing?: {
    brand?: string;
    model?: string;
    year?: number;
    bodyType?: string;
  };
  selectedBrand: string;
  modelValues: string[];
  modelsLoading?: boolean;
  brandOptions: string[];
  yearOptions: string[];
  bodyTypeOptions: string[];
}

export function IdentitySection({
  control,
  errors,
  listing,
  selectedBrand,
  modelValues,
  modelsLoading = false,
  brandOptions,
  yearOptions,
  bodyTypeOptions,
}: IdentitySectionProps) {
  return (
    <Section
      icon={<Car size={16} className="text-primary" />}
      title="مشخصات خودرو"
    >
      <FieldGroup>
        <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            id="p-brand"
            label="برند"
            control={control}
            name="brand"
            options={brandOptions}
            placeholder="انتخاب برند"
            error={errors.brand?.message}
            withCurrent={withCurrent}
            currentValue={listing?.brand}
          />
          <Field data-invalid={!!errors.model}>
            <FieldLabel htmlFor="p-model" className="font-bold">
              مدل
            </FieldLabel>
            <Controller
              control={control}
              name="model"
              render={({ field }) => (
                <Select
                  dir="rtl"
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={
                    !selectedBrand || modelValues.length === 0 || modelsLoading
                  }
                >
                  <SelectTrigger id="p-model" className="w-full vazir-matn">
                    <SelectValue
                      placeholder={
                        modelsLoading
                          ? "در حال بارگذاری…"
                          : !selectedBrand
                            ? "ابتدا برند را انتخاب کنید"
                            : modelValues.length === 0
                              ? "مدلی یافت نشد"
                              : "انتخاب مدل"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {withCurrent(modelValues, listing?.model).map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.model?.message}</FieldError>
          </Field>
        </Field>
        <Field className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field data-invalid={!!errors.trim}>
            <FieldLabel htmlFor="p-trim">تریم / نسخه</FieldLabel>
            <Input
              id="p-trim"
              placeholder="تریم / نسخه"
              aria-invalid={!!errors.trim}
              {...control.register("trim")}
            />
            <FieldError>{errors.trim?.message}</FieldError>
          </Field>
          <SelectField
            id="p-year"
            label="سال ساخت"
            control={control}
            name="year"
            options={yearOptions}
            placeholder="انتخاب سال"
            error={errors.year?.message}
            withCurrent={withCurrent}
            currentValue={listing?.year ? toPersianYear(listing.year) : undefined}
          />
          <Field data-invalid={!!errors.bodyType}>
            <FieldLabel htmlFor="p-body">نوع بدنه</FieldLabel>
            <Controller
              control={control}
              name="bodyType"
              render={({ field }) => (
                <Select
                  dir="rtl"
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled
                >
                  <SelectTrigger
                    id="p-body"
                    className="w-full vazir-matn opacity-70"
                  >
                    <SelectValue placeholder="بر اساس مدل انتخاب می‌شود" />
                  </SelectTrigger>
                  <SelectContent>
                    {withCurrent(bodyTypeOptions, listing?.bodyType).map(
                      (b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.bodyType?.message}</FieldError>
          </Field>
        </Field>
      </FieldGroup>
    </Section>
  );
}
