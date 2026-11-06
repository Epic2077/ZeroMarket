"use client";

import { Car } from "lucide-react";
import { Section } from "@/components/shared/Section";
import { SearchSelect } from "@/components/shared/SearchSelect";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Controller, type Control } from "react-hook-form";
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
    family?: string | null;
    model?: string;
    year?: number;
    bodyType?: string;
  };
  selectedBrand: string;
  selectedFamily: string;
  familyValues: string[];
  familiesLoading?: boolean;
  onBrandChange: (brand: string) => void;
  onFamilyChange: (family: string) => void;
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
  selectedFamily,
  familyValues,
  familiesLoading = false,
  onBrandChange,
  onFamilyChange,
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
        <Field className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field data-invalid={!!errors.brand}>
            <Controller
              control={control}
              name="brand"
              render={({ field }) => (
                <SearchSelect
                  id="p-brand"
                  label="برند"
                  value={field.value ?? ""}
                  options={brandOptions}
                  placeholder="انتخاب برند"
                  onChange={(value) => {
                    field.onChange(value);
                    onBrandChange(value);
                  }}
                />
              )}
            />
            <FieldError>{errors.brand?.message}</FieldError>
          </Field>
          <Field>
            <Controller
              control={control}
              name="family"
              render={({ field }) => (
                <SearchSelect
                  id="p-family"
                  label="خانواده"
                  value={field.value ?? ""}
                  options={withCurrent(familyValues, listing?.family ?? undefined)}
                  placeholder={
                    familiesLoading
                      ? "در حال بارگذاری…"
                      : !selectedBrand
                        ? "ابتدا برند را انتخاب کنید"
                        : "انتخاب خانواده"
                  }
                  loading={familiesLoading}
                  disabled={!selectedBrand || familiesLoading}
                  onChange={(value) => {
                    field.onChange(value);
                    onFamilyChange(value);
                  }}
                />
              )}
            />
            <FieldError>{errors.family?.message}</FieldError>
          </Field>
          <Field data-invalid={!!errors.model}>
            <Controller
              control={control}
              name="model"
              render={({ field }) => (
                <SearchSelect
                  id="p-model"
                  label="مدل"
                  value={field.value ?? ""}
                  options={withCurrent(modelValues, listing?.model)}
                  placeholder={
                    modelsLoading
                      ? "در حال بارگذاری…"
                      : !selectedBrand
                        ? "ابتدا برند را انتخاب کنید"
                        : modelValues.length === 0
                          ? "مدلی یافت نشد"
                          : "انتخاب مدل"
                  }
                  emptyText="مدلی یافت نشد"
                  loading={modelsLoading}
                  disabled={!selectedBrand || modelsLoading}
                  onChange={field.onChange}
                />
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
          <Controller
            control={control}
            name="year"
            render={({ field }) => (
              <SearchSelect
                id="p-year"
                label="سال ساخت"
                value={field.value ?? ""}
                options={withCurrent(yearOptions, listing?.year ? toPersianYear(listing.year) : undefined)}
                placeholder="انتخاب سال"
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="bodyType"
            render={({ field }) => (
              <SearchSelect
                id="p-body"
                label="نوع بدنه"
                value={field.value ?? ""}
                options={withCurrent(bodyTypeOptions, listing?.bodyType)}
                placeholder="بر اساس مدل انتخاب می‌شود"
                disabled
                onChange={field.onChange}
              />
            )}
          />
        </Field>
      </FieldGroup>
    </Section>
  );
}
