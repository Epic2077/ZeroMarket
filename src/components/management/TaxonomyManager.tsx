"use client";

import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import {
  TaxonomyCategory,
  taxonomyCategoryMeta,
} from "@/lib/supabase/taxonomy";
import { useTaxonomyManager } from "@/hooks/useTaxonomyManager";
import { CategorySidebar } from "./CategorySidebar";
import { AddOptionForm } from "./AddOptionForm";
import { ColorsGrid } from "./ColorsGrid";
import { OptionsGrid } from "./OptionsGrid";
import { BrandAccordion } from "./BrandAccordion";
import CarSpecsManager from "./CarSpecsManager";

type Tab = "options" | "specs";

export default function TaxonomyManager() {
  const {
    taxonomy,
    values,
    loading,
    error,
    refresh,
    active,
    setActive,
    draft,
    setDraft,
    saving,
    expandedBrands,
    modelsByBrand,
    modelsLoading,
    modelDrafts,
    setModelDrafts,
    canEdit,
    isOwner,
    isAdmin,
    handleAdd,
    handleRemove,
    handleRename,
    handleAddModel,
    toggleBrand,
  } = useTaxonomyManager();

  const [tab, setTab] = useState<Tab>("options");

  const meta = taxonomyCategoryMeta.find((c) => c.id === active)!;
  const options = values(active);
  const isBrandView = active === "BRAND";
  const isColorView = active === "COLOR";

  const handleCategorySelect = (cat: TaxonomyCategory) => {
    setActive(cat);
    setDraft("");
  };

  const getCount = (cat: TaxonomyCategory) => values(cat).length;

  const handleModelDraftChange = (brand: string, value: string) => {
    setModelDrafts((prev) => ({ ...prev, [brand]: value }));
  };

  // ── Tab bar shared by both views ───────────────────────────────────
  const tabBar = (
    <div className="flex items-center gap-1 mb-5 p-1 rounded-xl bg-muted w-fit">
      <button
        onClick={() => setTab("options")}
        className={`px-4 py-1.5 rounded-lg text-sm font-600 transition-colors duration-150 ${
          tab === "options"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        گزینه‌ها
      </button>
      <button
        onClick={() => setTab("specs")}
        className={`px-4 py-1.5 rounded-lg text-sm font-600 transition-colors duration-150 ${
          tab === "specs"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        مشخصات فنی
      </button>
    </div>
  );

  // ── Specs tab — standalone, no sidebar ─────────────────────────────
  if (tab === "specs") {
    return (
      <div>
        {tabBar}
        <CarSpecsManager />
      </div>
    );
  }

  // ── Options tab — loading / error / content ────────────────────────
  if (loading) {
    return (
      <div>
        {tabBar}
        <div className="card-elevated p-8 lg:col-span-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={18} className="animate-spin text-primary" />
          در حال بارگذاری گزینه‌ها…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {tabBar}
        <div className="card-elevated p-5 lg:col-span-4 text-center">
          <p className="text-sm text-danger mb-3">خطا: {error}</p>
          <button onClick={refresh} className="btn-secondary text-sm">
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {tabBar}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <CategorySidebar
          active={active}
          onSelect={handleCategorySelect}
          getCount={getCount}
        />

        <div className="card-elevated p-5 lg:col-span-3">
          <h3 className="mb-1 text-sm font-700 text-foreground">
            {meta.label}
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            {isOwner
              ? `گزینه‌های «${meta.label}» مستقیماً ویرایش می‌شوند.`
              : isAdmin
                ? `تغییرات «${meta.label}» برای تایید مالک ارسال می‌شود.`
                : `شما دسترسی ویرایش گزینه‌ها را ندارید.`}
          </p>

          <AddOptionForm
            value={draft}
            onChange={setDraft}
            onSubmit={handleAdd}
            placeholder={`افزودن ${meta.noun} جدید…`}
            disabled={saving}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder={`افزودن ${meta.noun} جدید…`}
              className="flex-1 h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={saving}
            />
            <button
              onClick={handleAdd}
              disabled={!draft.trim() || saving}
              className="btn-primary text-sm shrink-0 disabled:pointer-events-none disabled:opacity-40"
            >
              <Plus size={14} />
              افزودن
            </button>
          </AddOptionForm>

          {isBrandView ? (
            <BrandAccordion
              brands={options}
              modelsByBrand={modelsByBrand}
              modelsLoading={modelsLoading}
              expandedBrands={expandedBrands}
              onToggleBrand={toggleBrand}
              modelDrafts={modelDrafts}
              onModelDraftChange={handleModelDraftChange}
              onAddModel={handleAddModel}
              canEdit={canEdit}
              onRemoveBrand={handleRemove}
              onRenameBrand={handleRename}
              onRemoveModel={(model) => handleRemove(model, "MODEL")}
              onRenameModel={(oldVal, newVal) =>
                handleRename(oldVal, newVal, "MODEL")
              }
            />
          ) : (
            <>
              {options.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                  گزینه‌ای ثبت نشده است.
                </p>
              ) : isColorView ? (
                <ColorsGrid
                  colors={options}
                  taxonomy={taxonomy}
                  canEdit={canEdit}
                  onRemove={handleRemove}
                  onRename={handleRename}
                />
              ) : (
                <OptionsGrid
                  options={options}
                  canEdit={canEdit}
                  onRemove={handleRemove}
                  onRename={handleRename}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
