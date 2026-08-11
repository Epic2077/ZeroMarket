"use client";

import { ArrowRight, Loader2, ShoppingCart, HandCoins } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase/client";
import { checkDuplicateListing } from "@/lib/supabase/listings";
import { useUserInfo } from "@/context/UserInfoProvider";
import type { Listing } from "@/types/dataTypes";
import { fetchCarSpecsByBrandModel } from "@/lib/supabase/carSpecs";

/** Maps frontend status → Supabase listings.status enum. */
const STATUS_TO_DB: Record<string, string> = {
  active: "AVAILABLE",
  pending: "WAITING",
  negotiable: "NEGOTIABLE",
  sold: "SOLD",
  reserved: "RESERVED",
};
import { fromPersianYear, toPersianYear } from "@/lib/utils";
import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
import { fetchModelsByBrand, type TaxonomyRow } from "@/lib/supabase/taxonomy";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productSchema,
  type ProductFormValues,
} from "@/lib/validation/product";

import {
  IdentitySection,
  TechnicalSpecsSection,
  ColorSection,
  AvailabilityPriceSection,
  FactoryOptionsSection,
  SellerNotesSection,
  FormActions,
} from "./product-editor";
import { Controller } from "react-hook-form";

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
  const { user } = useUserInfo();
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
      listingType: listing?.listingType ?? "SELL",
    },
  });

  const selectedBrand = useWatch({ control, name: "brand" });
  const selectedModel = useWatch({ control, name: "model" });
  const selectedYear = useWatch({ control, name: "year" });

  // ── Fetch existing private note when editing ────────────────────────
  useEffect(() => {
    if (!listing?.id) return;
    let cancelled = false;
    supabase
      .from("listing_private_notes")
      .select("note")
      .eq("listing_id", listing.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setValue("sellerNotes", (data as { note: string }).note ?? "", {
          shouldValidate: false,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [listing?.id, setValue]);

  // ── Async model fetch when brand changes ────────────────────────────
  const [modelValues, setModelValues] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!selectedBrand) return;
    setModelsLoading(true);
    fetchModelsByBrand(selectedBrand)
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

  // Derive: clear model values when brand is empty
  const displayModelValues = selectedBrand ? modelValues : [];

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
    if (!selectedBrand || !selectedModel) return;
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

  // Derive: clear specs when brand or model is empty
  const displayCarSpecs = selectedBrand && selectedModel ? carSpecs : null;

  useEffect(() => {
    if (!displayCarSpecs) return;
    setValue("engine", displayCarSpecs.engine, { shouldValidate: true });
    setValue("transmission", displayCarSpecs.transmission, {
      shouldValidate: true,
    });
    setValue("fuelType", displayCarSpecs.fuelType, { shouldValidate: true });
    setValue("bodyType", displayCarSpecs.bodyType, { shouldValidate: true });
  }, [displayCarSpecs, setValue]);

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

  const submit = handleSubmit(async (values) => {
    const userId = user?.id;
    if (!userId) {
      toast.error("ابتدا وارد حساب کاربری خود شوید");
      return;
    }

    // Build a unique slug (for new listings only)
    const shortId = crypto.randomUUID().slice(0, 8);
    const slug =
      `${values.brand}-${values.model}-${values.year}-${shortId}`.replace(
        /\s+/g,
        "-",
      );

    const basePayload = {
      brand: values.brand,
      model: values.model,
      trim: values.trim,
      year: fromPersianYear(values.year),
      price: Number(values.price.replace(/\D/g, "")),
      price_unit: "تومان",
      color: values.color,
      color_hex: values.colorHex,
      city: values.city,
      shipment_days: Number(values.deliveryDays),
      body_type: values.bodyType,
      engine_power: values.engine,
      gearbox: values.transmission,
      fuel: values.fuelType,
      other_options: factoryOptions,
      listing_type: values.listingType,
    };

    try {
      // ── Duplicate check ──────────────────────────────────────────
      const gYear = fromPersianYear(values.year);
      const duplicateId = await checkDuplicateListing(
        supabase,
        userId,
        values.brand,
        values.model,
        gYear,
        values.trim,
        values.color,
        values.city,
        listing?.id, // exclude self when editing
      );

      if (duplicateId) {
        toast.error(
          "شما قبلاً یک آگهی فعال با این مشخصات و رنگ ثبت کرده‌اید. لطفاً آن را ویرایش یا حذف کنید.",
          { duration: 6000 },
        );
        return;
      }

      if (listing) {
        // ── Update existing listing ──────────────────────────────────
        const dbStatus = STATUS_TO_DB[values.status] ?? "WAITING";
        const { error: updateError } = await supabase
          .from("listings")
          .update({ ...basePayload, status: dbStatus })
          .eq("id", listing.id);

        if (updateError) throw updateError;

        // Upsert private note
        if (values.sellerNotes?.trim()) {
          await supabase.from("listing_private_notes").upsert(
            {
              listing_id: listing.id,
              seller_id: userId,
              note: values.sellerNotes.trim(),
            },
            { onConflict: "listing_id" },
          );
        }

        toast.success("محصول به‌روزرسانی شد");
        router.push(`/market/listings/${listing.id}`);
      } else {
        // ── Create new listing ───────────────────────────────────────
        const dbStatus = STATUS_TO_DB[values.status] ?? "WAITING";
        const { data: created, error: insertError } = await supabase
          .from("listings")
          .insert({
            ...basePayload,
            slug,
            seller_id: userId,
            status: dbStatus,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;

        // Insert private note
        if (values.sellerNotes?.trim()) {
          const { error: noteError } = await supabase
            .from("listing_private_notes")
            .insert({
              listing_id: created.id,
              seller_id: userId,
              note: values.sellerNotes.trim(),
            });

          if (noteError) {
            console.error("Error saving private note:", noteError);
          }
        }

        toast.success("محصول جدید ثبت شد");
        router.push(`/dashboard/manage/users/${userId}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در ثبت محصول");
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

        {/* Listing type toggle */}
        <div className="mt-4">
          <Controller
            control={control}
            name="listingType"
            render={({ field }) => (
              <div
                className="inline-flex gap-1 p-1 bg-muted rounded-xl"
                role="radiogroup"
                aria-label="نوع آگهی"
              >
                {[
                  {
                    value: "SELL" as const,
                    label: "آگهی فروش",
                    icon: ShoppingCart,
                  },
                  {
                    value: "BUY" as const,
                    label: "آگهی خرید",
                    icon: HandCoins,
                  },
                ].map((opt) => {
                  const active = field.value === opt.value;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => field.onChange(opt.value)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg text-sm font-600 transition-all duration-200 ${
                        active
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon
                        size={16}
                        className={active ? "text-primary" : ""}
                      />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>
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
            modelValues={displayModelValues}
            modelsLoading={modelsLoading}
            brandOptions={brandOptions}
            yearOptions={yearOptions}
            bodyTypeOptions={bodyTypeOptions}
          />

          <TechnicalSpecsSection
            engine={displayCarSpecs?.engine}
            transmission={displayCarSpecs?.transmission}
            fuelType={displayCarSpecs?.fuelType}
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
            brand={selectedBrand}
            model={selectedModel}
            year={selectedYear}
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
