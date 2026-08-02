"use client";

import { Palette } from "lucide-react";
import { Section } from "@/components/shared/Section";
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
import { withCurrent } from "@/lib/utils";
import type { ProductFormErrors, ProductFormValues } from "../ProductEditor";

interface ColorSectionProps {
  control: Control<ProductFormValues>;
  errors: ProductFormErrors;
  listing?: { color?: string };
  setValue: UseFormSetValue<ProductFormValues>;
  colorOptions: string[];
  getColorHex: (name: string) => string;
}

export function ColorSection({
  control,
  errors,
  listing,
  setValue,
  colorOptions,
  getColorHex,
}: ColorSectionProps) {
  return (
    <Section
      icon={<Palette size={16} className="text-negotiable" />}
      title="رنگ و ظاهر"
    >
      <FieldGroup>
        <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field data-invalid={!!errors.color}>
            <FieldLabel htmlFor="p-color" className="font-bold">
              رنگ
            </FieldLabel>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <Select
                  dir="rtl"
                  value={field.value || undefined}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue("colorHex", getColorHex(v), {
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger id="p-color" className="w-full vazir-matn">
                    <SelectValue placeholder="انتخاب رنگ" />
                  </SelectTrigger>
                  <SelectContent>
                    {withCurrent(colorOptions, listing?.color).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.color?.message}</FieldError>
          </Field>
          <Field data-invalid={!!errors.colorHex}>
            <FieldLabel htmlFor="p-colorhex">کد رنگ</FieldLabel>
            <Controller
              control={control}
              name="colorHex"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-9 w-12 rounded-lg border border-border bg-card cursor-pointer"
                    aria-label="انتخابگر رنگ"
                  />
                  <Input
                    id="p-colorhex"
                    dir="ltr"
                    className="font-mono"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </div>
              )}
            />
            <FieldError>{errors.colorHex?.message}</FieldError>
          </Field>
        </Field>
      </FieldGroup>
    </Section>
  );
}
