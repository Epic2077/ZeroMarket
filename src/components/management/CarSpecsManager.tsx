"use client";

import { ChevronRight, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useCarSpecsManager, type SpecEntry } from "@/hooks/useCarSpecsManager";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";

// ── Helpers ────────────────────────────────────────────────────────────

const YEAR_LABEL: Record<string, string> = {};
function yearLabel(year: string | null): string {
  if (!year) return "همه سال‌ها";
  YEAR_LABEL[year] ??= `سال ${year}`;
  return YEAR_LABEL[year];
}

// ── Sub-component: Spec row ────────────────────────────────────────────

function SpecRow({
  spec,
  canEdit,
  onEdit,
  onDelete,
  deleting,
}: {
  spec: SpecEntry;
  canEdit: boolean;
  onEdit: (s: SpecEntry) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs group">
      <span className="shrink-0 font-600 text-muted-foreground min-w-18">
        {yearLabel(spec.year)}
      </span>
      <span className="text-foreground truncate" title={spec.engine}>
        {spec.engine}
      </span>
      <span className="text-muted-foreground">/</span>
      <span className="text-foreground truncate" title={spec.transmission}>
        {spec.transmission}
      </span>
      <span className="text-muted-foreground">/</span>
      <span className="text-foreground truncate" title={spec.fuelType}>
        {spec.fuelType}
      </span>
      <span className="text-muted-foreground">/</span>
      <span className="text-foreground truncate" title={spec.bodyType}>
        {spec.bodyType}
      </span>

      {canEdit && (
        <div className="ml-auto flex items-center gap-0.5  transition-opacity">
          <button
            onClick={() => onEdit(spec)}
            aria-label="ویرایش"
            className="flex items-center justify-center w-8 h-8 rounded text-muted-foreground hover:text-primary hover:bg-muted"
          >
            <Pencil size={11} />
          </button>
          <ConfirmDeleteModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={() => onDelete(spec.id)}
            loading={deleting}
            title="حذف مشخصات فنی"
            message={`آیا مطمئن هستید که می‌خواهید مشخصات «${spec.engine}» را حذف کنید؟`}
          />
          <button
            onClick={() => setShowConfirm(true)}
            aria-label="حذف"
            className="flex items-center justify-center w-8 h-8 rounded text-muted-foreground hover:text-danger hover:bg-danger/10"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────

export default function CarSpecsManager() {
  const {
    grouped,
    brandOptions,
    yearOptions,
    modelOptions,
    modelsLoading,
    transmissionOptions,
    fuelTypeOptions,
    bodyTypeOptions,
    loading,
    error,
    refresh,
    canEdit,
    isOwner,
    isAdmin,
    saving,
    expandedBrands,
    toggleBrand,
    editingSpec,
    setEditingSpec,
    formBrand,
    setFormBrand,
    formModel,
    setFormModel,
    formYear,
    setFormYear,
    formEngine,
    setFormEngine,
    formTransmission,
    setFormTransmission,
    formFuelType,
    setFormFuelType,
    formBodyType,
    setFormBodyType,
    handleSaveSpec,
    handleDeleteSpec,
    resetForm,
  } = useCarSpecsManager();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const startEdit = (spec: SpecEntry) => {
    // Find the brand/model from grouped data
    for (const g of grouped) {
      for (const m of g.models) {
        const found = m.specs.find((s) => s.id === spec.id);
        if (found) {
          setFormBrand(g.brand);
          setFormModel(m.model);
          break;
        }
      }
    }
    setFormYear(spec.year ?? "");
    setFormEngine(spec.engine);
    setFormTransmission(spec.transmission);
    setFormFuelType(spec.fuelType);
    setFormBodyType(spec.bodyType);
    setEditingSpec(spec);
    setFormOpen(true);
  };

  const startNew = () => {
    resetForm();
    setFormOpen(true);
  };

  const cancelForm = () => {
    resetForm();
    setFormOpen(false);
  };

  const onSave = async () => {
    await handleSaveSpec();
    setFormOpen(false);
  };

  const onDelete = async (id: string) => {
    setDeleteTarget(id);
    await handleDeleteSpec(id);
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 size={18} className="animate-spin text-primary" />
        در حال بارگذاری مشخصات فنی…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-danger mb-3">خطا: {error}</p>
        <button onClick={refresh} className="btn-secondary text-sm">
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-700 text-foreground">
            مشخصات فنی خودروها
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isOwner
              ? "مشخصات فنی مستقیماً ویرایش می‌شوند."
              : isAdmin
                ? "تغییرات مشخصات فنی برای تایید مالک ارسال می‌شود."
                : "شما دسترسی ویرایش مشخصات فنی را ندارید."}
          </p>
        </div>
        {canEdit && !formOpen && (
          <button onClick={startNew} className="btn-primary text-sm shrink-0">
            <Plus size={14} />
            افزودن مشخصات جدید
          </button>
        )}
      </div>

      {/* Add / Edit form */}
      {formOpen && canEdit && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-600 text-foreground">
              {editingSpec ? "ویرایش مشخصات فنی" : "ثبت مشخصات فنی جدید"}
            </p>
            <button
              onClick={cancelForm}
              className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="انصراف"
            >
              <X size={14} />
            </button>
          </div>

          {/* Row 1: brand, model, year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-2xs text-muted-foreground">برند</label>
              <select
                value={formBrand}
                onChange={(e) => {
                  setFormBrand(e.target.value);
                  setFormModel("");
                }}
                className="w-full h-9 rounded-lg border border-border bg-card px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={saving || !!editingSpec}
              >
                <option value="">انتخاب برند…</option>
                {brandOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-2xs text-muted-foreground">مدل</label>
              <select
                value={formModel}
                onChange={(e) => setFormModel(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-card px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                disabled={
                  saving || !!editingSpec || !formBrand || modelsLoading
                }
              >
                <option value="">
                  {!formBrand
                    ? "ابتدا برند را انتخاب کنید"
                    : modelsLoading
                      ? "در حال بارگذاری…"
                      : "انتخاب مدل…"}
                </option>
                {modelOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-2xs text-muted-foreground">
                سال (اختیاری)
              </label>
              <select
                value={formYear}
                onChange={(e) => setFormYear(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-card px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={saving}
              >
                <option value="">همه سال‌ها (پیش‌فرض)</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: engine, transmission */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-2xs text-muted-foreground">موتور *</label>
              <input
                value={formEngine}
                onChange={(e) => setFormEngine(e.target.value)}
                placeholder="مثلاً: موتور ۲.۵ لیتری ۴ سیلندر هیبرید"
                className="w-full h-9 rounded-lg border border-border bg-card px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={saving}
              />
            </div>
            <div className="space-y-1">
              <label className="text-2xs text-muted-foreground">گیربکس *</label>
              <select
                value={formTransmission}
                onChange={(e) => setFormTransmission(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-card px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={saving}
              >
                <option value="">انتخاب گیربکس…</option>
                {transmissionOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: fuel type, body type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-2xs text-muted-foreground">
                نوع سوخت *
              </label>
              <select
                value={formFuelType}
                onChange={(e) => setFormFuelType(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-card px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={saving}
              >
                <option value="">انتخاب نوع سوخت…</option>
                {fuelTypeOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-2xs text-muted-foreground">
                نوع بدنه *
              </label>
              <select
                value={formBodyType}
                onChange={(e) => setFormBodyType(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-card px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={saving}
              >
                <option value="">انتخاب نوع بدنه…</option>
                {bodyTypeOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form actions */}
          <div className="flex items-center gap-2 justify-end pt-1">
            <button
              onClick={cancelForm}
              disabled={saving}
              className="btn-secondary text-xs"
            >
              انصراف
            </button>
            <button
              onClick={onSave}
              disabled={
                saving ||
                !formBrand.trim() ||
                !formModel.trim() ||
                !formEngine.trim() ||
                !formTransmission.trim() ||
                !formFuelType.trim() ||
                !formBodyType.trim()
              }
              className="btn-primary text-xs disabled:pointer-events-none disabled:opacity-40"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              {saving
                ? "در حال ذخیره…"
                : editingSpec
                  ? "ذخیره تغییرات"
                  : "ثبت مشخصات"}
            </button>
          </div>
        </div>
      )}

      {/* Brand → Model → Spec accordion */}
      {grouped.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            هیچ مشخصات فنی ثبت نشده است.
          </p>
          {canEdit && !formOpen && (
            <button onClick={startNew} className="btn-primary text-sm">
              <Plus size={14} />
              ثبت اولین مشخصات
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {grouped.map(({ brand, models }) => {
            const expanded = expandedBrands.has(brand);
            const totalSpecs = models.reduce(
              (sum, m) => sum + m.specs.length,
              0,
            );

            return (
              <div
                key={brand}
                className={`rounded-xl border transition-colors duration-150 ${
                  expanded ? "border-primary/30 bg-primary/5" : "border-border"
                }`}
              >
                {/* Brand header */}
                <button
                  onClick={() => toggleBrand(brand)}
                  className="w-full flex items-center justify-between px-4 py-3 cursor-pointer text-start"
                >
                  <div className="flex items-center gap-2 text-sm font-700 text-foreground">
                    <span
                      className={`transition-transform duration-200 ${
                        expanded ? "rotate-90" : ""
                      }`}
                    >
                      <ChevronRight size={14} />
                    </span>
                    {brand}
                    <span className="text-2xs text-muted-foreground font-500">
                      ({models.length.toLocaleString("fa-IR")} مدل،{" "}
                      {totalSpecs.toLocaleString("fa-IR")} مشخصات)
                    </span>
                  </div>
                </button>

                {/* Expanded: models & specs */}
                {expanded && (
                  <div className="border-t border-border px-4 py-3 space-y-4">
                    {models.map(({ model, specs: modelSpecs }) => (
                      <div key={model}>
                        <p className="text-sm font-600 text-foreground mb-2">
                          {model}
                          <span className="text-2xs text-muted-foreground font-500 mr-1.5">
                            ({modelSpecs.length.toLocaleString("fa-IR")})
                          </span>
                        </p>
                        <div className="flex flex-col gap-1.5 pr-2 border-r-2 border-border">
                          {modelSpecs.map((spec) => (
                            <SpecRow
                              key={spec.id}
                              spec={spec}
                              canEdit={canEdit}
                              onEdit={startEdit}
                              onDelete={onDelete}
                              deleting={deleteTarget === spec.id && saving}
                            />
                          ))}
                        </div>
                      </div>
                    ))}

                    {models.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2">
                        مدلی برای این برند ثبت نشده است.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
