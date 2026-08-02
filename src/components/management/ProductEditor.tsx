"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useListings } from "@/context/ListingsProvider";
import { requiredText } from "@/lib/validation";
import type { ProductInput } from "@/types/admin";
import type { Listing } from "@/types/dataTypes";
import { fetchCarSpecsByBrandModel } from "@/lib/supabase/carSpecs";
import { toPersianYear } from "@/lib/utils";
import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
import { fetchModelsByBrand, type TaxonomyRow } from "@/lib/supabase/taxonomy";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  IdentitySection,
  TechnicalSpecsSection,
  ColorSection,
  AvailabilityPriceSection,
  FactoryOptionsSection,
  SellerNotesSection,
  FormActions,
} from "./product-editor";

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

export type ProductFormValues = z.infer<typeof productSchema>;
export type ProductFormErrors = FieldErrors<ProductFormValues>;

/** Listing status options — static UI labels, not taxonomy data. */
const productStatusOptions = [
  { value: "active", label: "موجود" },
  { value: "pending", label: "در انتظار" },
  { value: "negotiable", label: "قابل مذاکره" },
  { value: "reserved", label: "رزرو شده" },
  { value: "sold", label: "فروخته شد" },
] as const;

/** Build a color-name → hex lookup from taxonomy COLOR rows. */
function buildColorHexMap(colors: TaxonomyRow[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const c of colors) {
    const hex = (c.metadata as { hex?: string } | null)?.hex ?? "#1b4fd8";
    map[c.value] = hex;
  }
  return map;
}

interface ProductEditorOwner {
  id: string;
  full_name?: string;
  name?: string;
  avatar_path?: string | null;
  avatar?: string | null;
  verified?: boolean;
  created_at?: string;
}

interface Props {
  listing?: Listing;
  owner: ProductEditorOwner;
  backHref: string;
}

export default function ProductEditor({ listing, owner, backHref }: Props) {
  const router = useRouter();
  const { createListing, updateListing } = useListings();
  const [factoryOptions, setFactoryOptions] = useState<string[]>(
    listing?.factoryOptions ?? [],
  );
  const [optDraft, setOptDraft] = useState("");

  // ── Supabase taxonomy ───────────────────────────────────────────────
  const {
    taxonomy,
    values,
    loading: taxonomyLoading,
    error: taxonomyError,
  } = useTaxonomyOptions();

  // Derived option lists from live taxonomy
  const brandOptions = useMemo(() => values("BRAND"), [values]);
  const yearOptions = useMemo(() => values("YEAR"), [values]);
  const colorOptions = useMemo(() => values("COLOR"), [values]);
  const cityOptions = useMemo(() => values("CITY"), [values]);
  const bodyTypeOptions = useMemo(() => values("BODY_TYPE"), [values]);

  const colorHexMap = useMemo(
    () => buildColorHexMap(taxonomy.COLOR ?? []),
    [taxonomy.COLOR],
  );

  /** Look up hex for a Persian color name. */
  const getColorHex = useCallback(
    (name: string) => colorHexMap[name] ?? "#1b4fd8",
    [colorHexMap],
  );

  // ── Form ─────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
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

  const selectedBrand = useWatch({ control, name: "brand" });
  const selectedModel = useWatch({ control, name: "model" });
  const selectedYear = useWatch({ control, name: "year" });

  // ── Async model fetch when brand changes ────────────────────────────
  const [modelValues, setModelValues] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const brand = selectedBrand;
    if (!brand) {
      setModelValues([]);
      return;
    }
    setModelsLoading(true);
    fetchModelsByBrand(brand)
      .then((rows) => {
        if (cancelled) return;
        setModelValues(rows.map((r) => r.value));
      })
      .catch(() => {
        if (cancelled) return;
        setModelValues([]);
      })
      .finally(() => {
        if (!cancelled) setModelsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBrand]);

  // ── Async car specs fetch when brand/model/year change ──────────────
  const [carSpecs, setCarSpecs] = useState<{
    engine: string;
    transmission: string;
    fuelType: string;
    bodyType: string;
  } | null>(null);
  const [carSpecsLoading, setCarSpecsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!selectedBrand || !selectedModel) {
      setCarSpecs(null);
      return;
    }
    setCarSpecsLoading(true);
    fetchCarSpecsByBrandModel(
      selectedBrand,
      selectedModel,
      selectedYear || null,
    )
      .then((row) => {
        if (cancelled) return;
        setCarSpecs(
          row
            ? {
                engine: row.engine,
                transmission: row.transmission,
                fuelType: row.fuel_type,
                bodyType: row.body_type,
              }
            : null,
        );
      })
      .catch(() => {
        if (!cancelled) setCarSpecs(null);
      })
      .finally(() => {
        if (!cancelled) setCarSpecsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedBrand, selectedModel, selectedYear]);

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

  const handleDraftKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addOption();
    }
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
          sellerName: owner.full_name ?? owner.name ?? "ناشناس",
          sellerAvatar: owner.avatar_path ?? owner.avatar ?? null,
          sellerVerified: owner.verified === true,
          sellerMemberSince: owner.created_at ?? "",
        },
        input,
      );
      toast.success("محصول جدید ثبت شد");
      router.push(`/dashboard/manage/users/${owner.id}`);
      void id;
    }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
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
          فروشنده: {owner.full_name ?? owner.name ?? "ناشناس"}
        </p>
      </div>

      {taxonomyLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 size={18} className="animate-spin text-primary" />
          در حال بارگذاری گزینه‌ها…
        </div>
      ) : taxonomyError ? (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-6 text-center">
          <p className="text-sm text-danger mb-2">
            خطا در دریافت گزینه‌ها: {taxonomyError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary text-xs"
          >
            تلاش مجدد
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-6">
          <IdentitySection
            control={control}
            errors={errors}
            listing={listing}
            selectedBrand={selectedBrand}
            modelValues={modelValues}
            modelsLoading={modelsLoading}
            brandOptions={brandOptions}
            yearOptions={yearOptions}
            bodyTypeOptions={bodyTypeOptions}
          />

          <TechnicalSpecsSection
            engine={carSpecs?.engine}
            transmission={carSpecs?.transmission}
            fuelType={carSpecs?.fuelType}
            loading={carSpecsLoading}
          />

          <ColorSection
            control={control}
            errors={errors}
            listing={listing}
            setValue={setValue}
            colorOptions={colorOptions}
            getColorHex={getColorHex}
          />

          <AvailabilityPriceSection
            control={control}
            errors={errors}
            listing={listing}
            setValue={setValue}
            cityOptions={cityOptions}
          />

          <FactoryOptionsSection
            factoryOptions={factoryOptions}
            onAddOption={addOption}
            onRemoveOption={(opt) =>
              setFactoryOptions((prev) => prev.filter((o) => o !== opt))
            }
            draftValue={optDraft}
            onDraftChange={setOptDraft}
            onDraftKeyDown={handleDraftKeyDown}
          />

          <SellerNotesSection control={control} />

          <FormActions
            backHref={backHref}
            isSubmitting={isSubmitting}
            listing={listing}
          />
        </form>
      )}
    </div>
  );
}
