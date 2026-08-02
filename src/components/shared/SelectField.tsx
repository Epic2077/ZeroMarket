"use client";

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFieldProps<T extends FieldValues> {
  id: string;
  label: string;
  control: Control<T>;
  name: FieldPath<T>;
  options: string[];
  placeholder: string;
  error?: string;
  disabled?: boolean;
  withCurrent?: (options: string[], current?: string) => string[];
  currentValue?: string;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function SelectField<T extends FieldValues>({
  id,
  label,
  control,
  name,
  options,
  placeholder,
  error,
  disabled = false,
  withCurrent,
  currentValue,
  className,
  onValueChange,
}: SelectFieldProps<T>) {
  const finalOptions = withCurrent
    ? withCurrent(options, currentValue)
    : options;

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id} className="font-bold">
        {label}
      </FieldLabel>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            dir="rtl"
            value={(field.value as string) || undefined}
            onValueChange={(v) => {
              field.onChange(v);
              onValueChange?.(v);
            }}
            disabled={disabled}
          >
            <SelectTrigger
              id={id}
              className={`w-full vazir-matn ${className ?? ""}`}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {finalOptions.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}
