"use client";

import { ChevronRight, Loader2, Plus } from "lucide-react";
import { OptionActions } from "./OptionActions";
import { AddOptionForm } from "./AddOptionForm";

interface BrandAccordionProps {
  brands: string[];
  familiesByBrand: Record<string, string[]>;
  modelsByBrand: Record<string, string[]>;
  modelsLoading: boolean;
  expandedBrands: Set<string>;
  onToggleBrand: (brand: string) => void;
  modelDrafts: Record<string, string>;
  familyDrafts: Record<string, string>;
  onFamilyDraftChange: (brand: string, value: string) => void;
  onAddFamily: (brand: string) => Promise<void>;
  onModelDraftChange: (familyKey: string, value: string) => void;
  onAddModel: (brand: string) => Promise<void>;
  canEdit: boolean;
  onRemoveBrand: (brand: string) => Promise<void>;
  onRenameBrand: (oldVal: string, newVal: string) => Promise<void>;
  onRemoveFamily: (family: string) => Promise<void>;
  onRenameFamily: (oldVal: string, newVal: string) => Promise<void>;
  onRemoveModel: (model: string) => Promise<void>;
  onRenameModel: (oldVal: string, newVal: string) => Promise<void>;
}

export function BrandAccordion({
  brands,
  familiesByBrand,
  modelsByBrand,
  modelsLoading,
  expandedBrands,
  onToggleBrand,
  modelDrafts,
  familyDrafts,
  onFamilyDraftChange,
  onAddFamily,
  onModelDraftChange,
  onAddModel,
  canEdit,
  onRemoveBrand,
  onRenameBrand,
  onRemoveFamily,
  onRenameFamily,
  onRemoveModel,
  onRenameModel,
}: BrandAccordionProps) {
  if (brands.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
        گزینه‌ای ثبت نشده است.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {brands.map((brand) => {
        const expanded = expandedBrands.has(brand);
        const families = familiesByBrand[brand] ?? [];
        return (
          <div
            key={brand}
            className={`rounded-xl border transition-colors duration-150 ${
              expanded ? "border-primary/30 bg-primary/5" : "border-border"
            }`}
          >
            <div
              onClick={() => onToggleBrand(brand)}
              className="flex items-center justify-between px-4 py-3 cursor-pointer"
            >
              <div className="flex items-center gap-2 text-sm font-700 text-foreground group-hover:text-primary transition-colors duration-150">
                <span
                  className={`transition-transform duration-200 ${
                    expanded ? "rotate-90" : ""
                  }`}
                >
                  <ChevronRight size={14} />
                </span>
                {brand}
                <span className="text-2xs text-muted-foreground font-500">
                  ({families.length.toLocaleString("fa-IR")} خانواده)
                </span>
              </div>
              {canEdit && (
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <OptionActions
                    value={brand}
                    onRemove={() => onRemoveBrand(brand)}
                    onRename={(newVal) => onRenameBrand(brand, newVal)}
                  />
                </div>
              )}
            </div>

            {expanded && (
              <div className="border-t border-border px-4 py-3">
                {modelsLoading ? (
                  <div className="py-4 flex justify-center">
                    <Loader2 size={16} className="animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {families.map((family) => {
                      const familyKey = `${brand}|${family}`;
                      const models = modelsByBrand[familyKey] ?? [];
                      return (
                        <div key={family} className="mb-4">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-xs font-700 text-foreground">
                              {family}
                            </p>
                            {canEdit && (
                              <OptionActions
                                value={family}
                                onRemove={() => onRemoveFamily(family)}
                                onRename={(newVal) =>
                                  onRenameFamily(family, newVal)
                                }
                              />
                            )}
                          </div>
                          {models.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-3">
                              {models.map((model) => (
                                <div
                                  key={`${familyKey}|${model}`}
                                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
                                >
                                  <p className="text-sm text-foreground">{model}</p>
                                  {canEdit && (
                                    <OptionActions
                                      value={model}
                                      onRemove={() => onRemoveModel(model)}
                                      onRename={(newVal) =>
                                        onRenameModel(model, newVal)
                                      }
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="rounded-lg border border-accent/20 bg-accent/5 p-2.5">
                            <p className="mb-2 text-2xs font-700 text-accent">
                              افزودن مدل به خانواده «{family}»
                            </p>
                            <AddOptionForm
                              value={modelDrafts[familyKey] ?? ""}
                              onChange={(v) => onModelDraftChange(familyKey, v)}
                              onSubmit={() => onAddModel(familyKey)}
                              placeholder="نام مدل را وارد کنید…"
                              disabled={modelsLoading}
                            >
                              <input
                                value={modelDrafts[familyKey] ?? ""}
                                onChange={(e) =>
                                  onModelDraftChange(familyKey, e.target.value)
                                }
                                placeholder="نام مدل را وارد کنید…"
                                className="flex-1 h-8 rounded-lg border border-accent/25 bg-card px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent/30"
                                disabled={modelsLoading}
                              />
                              <button
                                type="submit"
                                disabled={
                                  !(modelDrafts[familyKey] ?? "").trim() ||
                                  modelsLoading
                                }
                                className="btn-primary text-xs h-8 shrink-0 disabled:pointer-events-none disabled:opacity-40"
                              >
                                <Plus size={12} />
                                افزودن مدل
                              </button>
                            </AddOptionForm>
                          </div>
                        </div>
                      );
                    })}

                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
                      <p className="mb-2 text-2xs font-700 text-primary">
                        افزودن خانواده به برند «{brand}»
                      </p>
                      <AddOptionForm
                        value={familyDrafts[brand] ?? ""}
                        onChange={(v) => onFamilyDraftChange(brand, v)}
                        onSubmit={() => onAddFamily(brand)}
                        placeholder="نام خانواده را وارد کنید…"
                        disabled={modelsLoading}
                      >
                        <input
                          value={familyDrafts[brand] ?? ""}
                          onChange={(e) =>
                            onFamilyDraftChange(brand, e.target.value)
                          }
                          placeholder="نام خانواده را وارد کنید…"
                          className="flex-1 h-9 rounded-lg border border-primary/25 bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          disabled={modelsLoading}
                        />
                        <button
                          type="submit"
                          disabled={
                            !(familyDrafts[brand] ?? "").trim() ||
                            modelsLoading
                          }
                          className="btn-primary text-sm h-9 shrink-0 disabled:pointer-events-none disabled:opacity-40"
                        >
                          <Plus size={14} />
                          افزودن خانواده
                        </button>
                      </AddOptionForm>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
