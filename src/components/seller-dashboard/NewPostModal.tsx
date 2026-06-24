"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/context/data";
import {
  bodyTypeOptions,
  brandOptions,
  cityOptions,
  fuelTypeOptions,
  statusOptions,
  type SelectOption,
} from "@/context/marketFilters";
import {
  colorOptions,
  modelOptions,
  suggestedPrice,
  transmissionOptions,
  yearOptions,
} from "@/context/newPostForm";
import { requiredText } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, X } from "lucide-react";
import type { ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
  onClose: () => void;
}

const newPostSchema = z.object({
  brand: requiredText("برند را انتخاب کنید"),
  model: requiredText("مدل را انتخاب کنید"),
  year: z.string().optional(),
  bodyType: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  color: z.string().optional(),
  city: z.string().optional(),
  status: z.string(),
  price: z
    .string()
    .trim()
    .min(1, "قیمت را وارد کنید")
    .refine((v) => Number(v) > 0, "قیمت نامعتبر است"),
});

type NewPostValues = z.infer<typeof newPostSchema>;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-600 text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function FormSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder: string;
}) {
  return (
    <Select dir="rtl" value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="w-full h-9 text-sm vazir-matn">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function NewPostModal({ onClose }: Props) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewPostValues>({
    resolver: zodResolver(newPostSchema),
    defaultValues: {
      brand: "",
      model: "",
      year: "",
      bodyType: "",
      fuelType: "",
      transmission: "",
      color: "",
      city: "",
      status: "active",
      price: "",
    },
  });

  const brand = useWatch({ control, name: "brand", defaultValue: "" });
  const suggestion = brand ? suggestedPrice(brand) : null;

  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success("آگهی جدید ثبت شد");
    onClose();
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 vazir-matn"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="ثبت آگهی جدید"
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <form
        onSubmit={onSubmit}
        noValidate
        className="relative bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-800 text-foreground">ثبت آگهی جدید</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150"
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="برند" error={errors.brand?.message}>
            <Controller
              control={control}
              name="brand"
              render={({ field }) => (
                <FormSelect
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    setValue("model", ""); // reset dependent model on brand change
                  }}
                  options={brandOptions}
                  placeholder="انتخاب برند"
                />
              )}
            />
          </Field>
          <Field label="مدل" error={errors.model?.message}>
            <Controller
              control={control}
              name="model"
              render={({ field }) => (
                <FormSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={modelOptions(brand)}
                  placeholder="انتخاب مدل"
                />
              )}
            />
          </Field>
          <Field label="سال تولید">
            <Controller
              control={control}
              name="year"
              render={({ field }) => (
                <FormSelect
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={yearOptions}
                  placeholder="انتخاب سال"
                />
              )}
            />
          </Field>
          <Field label="نوع بدنه">
            <Controller
              control={control}
              name="bodyType"
              render={({ field }) => (
                <FormSelect
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={bodyTypeOptions}
                  placeholder="انتخاب بدنه"
                />
              )}
            />
          </Field>
          <Field label="سوخت">
            <Controller
              control={control}
              name="fuelType"
              render={({ field }) => (
                <FormSelect
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={fuelTypeOptions}
                  placeholder="انتخاب سوخت"
                />
              )}
            />
          </Field>
          <Field label="گیربکس">
            <Controller
              control={control}
              name="transmission"
              render={({ field }) => (
                <FormSelect
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={transmissionOptions}
                  placeholder="انتخاب گیربکس"
                />
              )}
            />
          </Field>
          <Field label="رنگ">
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <FormSelect
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={colorOptions}
                  placeholder="انتخاب رنگ"
                />
              )}
            />
          </Field>
          <Field label="شهر">
            <Controller
              control={control}
              name="city"
              render={({ field }) => (
                <FormSelect
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={cityOptions}
                  placeholder="انتخاب شهر"
                />
              )}
            />
          </Field>
          <Field label="وضعیت">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <FormSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={statusOptions}
                  placeholder="انتخاب وضعیت"
                />
              )}
            />
          </Field>

          {/* Price + market suggestion */}
          <div className="sm:col-span-2">
            <Field label="قیمت (تومان)" error={errors.price?.message}>
              <input
                type="number"
                placeholder="مبلغ را وارد کنید"
                aria-invalid={!!errors.price}
                className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                {...register("price")}
              />
            </Field>
            {suggestion != null ? (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                <span className="flex items-center gap-1.5 text-xs text-foreground">
                  <Sparkles size={13} className="text-primary" />
                  قیمت پیشنهادی بازار:{" "}
                  <span className="font-mono font-700">
                    {formatPrice(suggestion)} تومان
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setValue("price", String(suggestion), {
                      shouldValidate: true,
                    })
                  }
                  className="text-xs font-700 text-primary hover:underline"
                >
                  اعمال
                </button>
              </div>
            ) : (
              brand && (
                <p className="mt-2 text-2xs text-muted-foreground">
                  برای این برند داده‌ای برای تحلیل قیمت موجود نیست.
                </p>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-sm"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-sm"
          >
            ثبت آگهی
          </button>
        </div>
      </form>
    </div>
  );
}
