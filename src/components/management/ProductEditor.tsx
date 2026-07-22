"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListings } from "@/context/ListingsProvider";
import { useTaxonomy } from "@/context/TaxonomyProvider";
import { requiredText } from "@/lib/validation";
import type { PlatformUser, ProductInput } from "@/types/admin";
import type { Listing } from "@/types/dataTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Car,
  CheckCircle,
  Gauge,
  Palette,
  Plus,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
  // Edit mode when a listing is provided; create mode otherwise.
  listing?: Listing;
  // The seller this product belongs to (drives create + back link).
  owner: PlatformUser;
  backHref: string;
}

const YEARS = [2027, 2026, 2025, 2024, 2023, 2022];

const productSchema = z.object({
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
});

type ProductFormValues = z.infer<typeof productSchema>;

const statusOptions: { value: ProductFormValues["status"]; label: string }[] = [
  { value: "active", label: "موجود" },
  { value: "pending", label: "در انتظار" },
  { value: "negotiable", label: "قابل مذاکره" },
  { value: "reserved", label: "رزرو شده" },
  { value: "sold", label: "فروخته شد" },
];

const groupThousands = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("en-US") : "";
};

// Ensure the current value is selectable even if it isn't in the taxonomy yet
// (seeded listings use English source values).
const withCurrent = (list: string[], current?: string) =>
  current && !list.includes(current) ? [current, ...list] : list;

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-base font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SelectField({
  id,
  label,
  control,
  name,
  options,
  placeholder,
  error,
}: {
  id: string;
  label: string;
  control: ReturnType<typeof useForm<ProductFormValues>>["control"];
  name: keyof ProductFormValues;
  options: string[];
  placeholder: string;
  error?: string;
}) {
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
            onValueChange={field.onChange}
          >
            <SelectTrigger id={id} className="w-full vazir-matn">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
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

export default function ProductEditor({ listing, owner, backHref }: Props) {
  const router = useRouter();
  const { taxonomy } = useTaxonomy();
  const { createListing, updateListing } = useListings();
  const [factoryOptions, setFactoryOptions] = useState<string[]>(
    listing?.factoryOptions ?? [],
  );
  const [optDraft, setOptDraft] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      brand: listing?.brand ?? "",
      model: listing?.model ?? "",
      trim: listing?.trim ?? "",
      year: listing ? String(listing.year) : "",
      color: listing?.color ?? "",
      colorHex: listing?.colorHex ?? "#1b4fd8",
      engine: listing?.engine ?? "",
      transmission: listing?.transmission ?? "",
      fuelType: listing?.fuelType ?? "",
      bodyType: listing?.bodyType ?? "",
      city: listing?.city ?? "",
      deliveryDays: listing ? String(listing.deliveryDays) : "0",
      price: listing ? listing.price.toLocaleString("en-US") : "",
      status: listing?.status ?? "active",
    },
  });

  const addOption = () => {
    const value = optDraft.trim();
    if (!value || factoryOptions.includes(value)) return;
    setFactoryOptions((prev) => [...prev, value]);
    setOptDraft("");
  };

  const submit = handleSubmit((values) => {
    const input: ProductInput = {
      brand: values.brand,
      model: values.model,
      trim: values.trim,
      year: Number(values.year),
      color: values.color,
      colorHex: values.colorHex,
      engine: values.engine,
      transmission: values.transmission,
      fuelType: values.fuelType,
      bodyType: values.bodyType,
      city: values.city,
      deliveryDays: Number(values.deliveryDays),
      price: Number(values.price.replace(/\D/g, "")),
      status: values.status,
      factoryOptions,
    };

    if (listing) {
      updateListing(listing.id, input);
      toast.success("محصول به‌روزرسانی شد");
      router.push(`/market/listings/${listing.id}`);
    } else {
      const id = createListing(
        owner.id,
        {
          sellerName: owner.name,
          sellerAvatar: owner.avatar,
          sellerVerified: owner.role === "confirmed_seller",
          sellerMemberSince: owner.joinedAt,
        },
        input,
      );
      toast.success("محصول جدید ثبت شد");
      router.push(`/dashboard/manage/users/${owner.id}`);
      // surface the created id for clarity
      void id;
    }
  });

  return (
    <div className="max-w-screen-lg mx-auto px-4 lg:px-8 xl:px-10 py-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-xs font-600 text-muted-foreground hover:text-foreground transition-colors duration-150 mb-4"
      >
        <ArrowRight size={14} />
        بازگشت
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-800 text-foreground">
          {listing ? "ویرایش محصول" : "ثبت محصول جدید"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          فروشنده: {owner.name}
        </p>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        {/* Identity */}
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
                options={withCurrent(taxonomy.brands, listing?.brand)}
                placeholder="انتخاب برند"
                error={errors.brand?.message}
              />
              <Field data-invalid={!!errors.model}>
                <FieldLabel htmlFor="p-model">مدل</FieldLabel>
                <Input
                  id="p-model"
                  aria-invalid={!!errors.model}
                  placeholder="مدل"
                  {...register("model")}
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
                  {...register("trim")}
                />
                <FieldError>{errors.trim?.message}</FieldError>
              </Field>
              <SelectField
                id="p-year"
                label="سال ساخت"
                control={control}
                name="year"
                options={withCurrent(
                  YEARS.map(String),
                  listing ? String(listing.year) : undefined,
                )}
                placeholder="انتخاب سال"
                error={errors.year?.message}
              />
              <SelectField
                id="p-body"
                label="نوع بدنه"
                control={control}
                name="bodyType"
                options={withCurrent(taxonomy.bodyTypes, listing?.bodyType)}
                placeholder="انتخاب بدنه"
                error={errors.bodyType?.message}
              />
            </Field>
          </FieldGroup>
        </Section>

        {/* Powertrain */}
        <Section
          icon={<Gauge size={16} className="text-accent" />}
          title="موتور و انتقال قدرت"
        >
          <FieldGroup>
            <Field className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field data-invalid={!!errors.engine}>
                <FieldLabel htmlFor="p-engine">حجم موتور</FieldLabel>
                <Input
                  id="p-engine"
                  placeholder="مثلاً ۲.۵ لیتر هیبریدی"
                  aria-invalid={!!errors.engine}
                  {...register("engine")}
                />
                <FieldError>{errors.engine?.message}</FieldError>
              </Field>
              <SelectField
                id="p-transmission"
                label="گیربکس"
                control={control}
                name="transmission"
                options={withCurrent(
                  taxonomy.transmissions,
                  listing?.transmission,
                )}
                placeholder="انتخاب گیربکس"
                error={errors.transmission?.message}
              />
              <SelectField
                id="p-fuel"
                label="نوع سوخت"
                control={control}
                name="fuelType"
                options={withCurrent(taxonomy.fuelTypes, listing?.fuelType)}
                placeholder="انتخاب سوخت"
                error={errors.fuelType?.message}
              />
            </Field>
          </FieldGroup>
        </Section>

        {/* Color */}
        <Section
          icon={<Palette size={16} className="text-negotiable" />}
          title="رنگ و ظاهر"
        >
          <FieldGroup>
            <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                id="p-color"
                label="رنگ"
                control={control}
                name="color"
                options={withCurrent(taxonomy.colors, listing?.color)}
                placeholder="انتخاب رنگ"
                error={errors.color?.message}
              />
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

        {/* Availability & price */}
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
                options={withCurrent(taxonomy.cities, listing?.city)}
                placeholder="انتخاب شهر"
                error={errors.city?.message}
              />
              <Field data-invalid={!!errors.deliveryDays}>
                <FieldLabel htmlFor="p-delivery">زمان تحویل (روز)</FieldLabel>
                <Input
                  id="p-delivery"
                  inputMode="numeric"
                  dir="ltr"
                  className="text-right"
                  aria-invalid={!!errors.deliveryDays}
                  {...register("deliveryDays")}
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
                      <SelectTrigger
                        id="p-status"
                        className="w-full vazir-matn"
                      >
                        <SelectValue placeholder="انتخاب وضعیت" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((o) => (
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
              <Input
                id="p-price"
                inputMode="numeric"
                dir="ltr"
                className="text-right font-mono"
                placeholder="۹۰۰٬۰۰۰٬۰۰۰"
                aria-invalid={!!errors.price}
                {...register("price", {
                  onChange: (e) =>
                    setValue("price", groupThousands(e.target.value), {
                      shouldValidate: true,
                    }),
                })}
              />
              <FieldError>{errors.price?.message}</FieldError>
            </Field>
          </FieldGroup>
        </Section>

        {/* Factory options */}
        <Section
          icon={<CheckCircle size={16} className="text-success" />}
          title="امکانات و تجهیزات کارخانه"
        >
          <div className="flex items-center gap-2 mb-3">
            <input
              value={optDraft}
              onChange={(e) => setOptDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOption();
                }
              }}
              placeholder="افزودن امکانات (مثلاً سانروف)…"
              className="flex-1 h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={addOption}
              disabled={!optDraft.trim()}
              className="btn-primary text-sm shrink-0 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Plus size={14} />
              افزودن
            </button>
          </div>
          {factoryOptions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3 text-center rounded-lg border border-dashed border-border">
              امکاناتی افزوده نشده است.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {factoryOptions.map((opt) => (
                <span
                  key={opt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/8 border border-success/20 rounded-lg text-xs font-600 text-foreground"
                >
                  {opt}
                  <button
                    type="button"
                    onClick={() =>
                      setFactoryOptions((prev) => prev.filter((o) => o !== opt))
                    }
                    aria-label={`حذف ${opt}`}
                    className="text-muted-foreground hover:text-danger"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Link href={backHref} className="btn-secondary text-sm">
            انصراف
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-sm"
          >
            {listing ? "ذخیره تغییرات" : "ثبت محصول"}
          </button>
        </div>
      </form>
    </div>
  );
}
