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
import { requiredText } from "@/lib/validation";
import type { ProductInput } from "@/types/admin";
import type { Listing } from "@/types/dataTypes";
import {
  brandOptions,
  bodyTypeOptions,
  cityOptions,
  colorOptions,
  getCarSpecs,
  getColorHex,
  getModelsForBrand,
  productStatusOptions,
  toPersianYear,
  withCurrent,
  yearOptions,
} from "@/context/productFormOptions";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Car,
  CheckCircle,
  Gauge,
  NotebookPen,
  Palette,
  Plus,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { UserProfileRow } from "@/types/user-profile-types";

interface Props {
  // Edit mode when a listing is provided; create mode otherwise.
  listing?: Listing;
  // The seller this product belongs to (drives create + back link).
  owner: UserProfileRow;
  backHref: string;
}

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
  sellerNotes: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const groupThousands = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("en-US") : "";
};

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
      year: listing ? toPersianYear(listing.year) : "",
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
      sellerNotes: listing?.sellerNotes ?? "",
    },
  });

  // Watch brand to cascade model options
  const selectedBrand = useWatch({ control, name: "brand" });
  const selectedModel = useWatch({ control, name: "model" });
  const selectedYear = useWatch({ control, name: "year" });
  const modelOpts = selectedBrand ? getModelsForBrand(selectedBrand) : [];
  const modelValues = modelOpts.map((o) => o.value);

  // Cache specs so the effect and display stay in perfect sync
  const carSpecs = useMemo(
    () =>
      selectedBrand && selectedModel
        ? getCarSpecs(selectedBrand, selectedModel, selectedYear || undefined)
        : null,
    [selectedBrand, selectedModel, selectedYear],
  );

  // Auto-fill engine, transmission, fuel & body when brand+model are chosen
  useEffect(() => {
    if (!carSpecs) return;
    setValue("engine", carSpecs.engine, { shouldValidate: true });
    setValue("transmission", carSpecs.transmission, { shouldValidate: true });
    setValue("fuelType", carSpecs.fuelType, { shouldValidate: true });
    setValue("bodyType", carSpecs.bodyType, { shouldValidate: true });
  }, [carSpecs, setValue]);

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
      sellerNotes: values.sellerNotes || undefined,
    };

    if (listing) {
      updateListing(listing.id, input);
      toast.success("محصول به‌روزرسانی شد");
      router.push(`/market/listings/${listing.id}`);
    } else {
      const id = createListing(
        owner.id,
        {
          sellerName: owner.full_name,
          sellerAvatar: owner.avatar_path,
          sellerVerified: owner.verified === true,
          sellerMemberSince: owner.created_at,
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
          فروشنده: {owner.full_name}
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
                options={withCurrent(
                  brandOptions.map((o) => o.value),
                  listing?.brand,
                )}
                placeholder="انتخاب برند"
                error={errors.brand?.message}
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
                      disabled={!selectedBrand || modelOpts.length === 0}
                    >
                      <SelectTrigger id="p-model" className="w-full vazir-matn">
                        <SelectValue
                          placeholder={
                            !selectedBrand
                              ? "ابتدا برند را انتخاب کنید"
                              : modelOpts.length === 0
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
                  yearOptions.map((o) => o.value),
                  listing ? String(listing.year) : undefined,
                )}
                placeholder="انتخاب سال"
                error={errors.year?.message}
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
                        {withCurrent(
                          bodyTypeOptions.map((o) => o.value),
                          listing?.bodyType,
                        ).map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>{errors.bodyType?.message}</FieldError>
              </Field>
            </Field>
          </FieldGroup>
        </Section>

        {/* Technical specs — auto-filled from brand + model */}
        <Section
          icon={<Gauge size={16} className="text-accent" />}
          title="مشخصات فنی"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-muted rounded-xl p-3">
              <div className="text-2xs text-muted-foreground mb-1">
                حجم موتور
              </div>
              <div className="text-sm font-700 text-foreground">
                {carSpecs?.engine ?? "—"}
              </div>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <div className="text-2xs text-muted-foreground mb-1">گیربکس</div>
              <div className="text-sm font-700 text-foreground">
                {carSpecs?.transmission ?? "—"}
              </div>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <div className="text-2xs text-muted-foreground mb-1">
                نوع سوخت
              </div>
              <div className="text-sm font-700 text-foreground">
                {carSpecs?.fuelType ?? "—"}
              </div>
            </div>
          </div>
          <p className="text-2xs text-muted-foreground mt-3">
            مشخصات فنی بر اساس برند و مدل انتخاب‌شده به‌صورت خودکار تکمیل
            می‌شود.
          </p>
        </Section>

        {/* Color */}
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
                        {withCurrent(
                          colorOptions.map((o) => o.value),
                          listing?.color,
                        ).map((c) => (
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
                options={withCurrent(
                  cityOptions.map((o) => o.value),
                  listing?.city,
                )}
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
        <Section
          icon={<NotebookPen size={16} className="text-negotiable" />}
          title="یادداشت های شخصی فروشنده"
        >
          <textarea
            {...register("sellerNotes")}
            rows={4}
            placeholder="یادداشت‌های داخلی درباره این آگهی…"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-2xs text-muted-foreground mt-1.5">
            این یادداشت‌ها فقط برای شما قابل مشاهده است و در آگهی عمومی نمایش
            داده نمی‌شود.
          </p>
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
