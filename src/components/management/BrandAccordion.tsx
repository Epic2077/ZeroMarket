"use client";

import { ChevronRight, Loader2, Plus } from "lucide-react";
import { OptionActions } from "./OptionActions";
import { AddOptionForm } from "./AddOptionForm";

interface BrandAccordionProps {
  brands: string[];
  modelsByBrand: Record<string, string[]>;
  modelsLoading: boolean;
  expandedBrands: Set<string>;
  onToggleBrand: (brand: string) => void;
  modelDrafts: Record<string, string>;
  onModelDraftChange: (brand: string, value: string) => void;
  onAddModel: (brand: string) => Promise<void>;
  canEdit: boolean;
  onRemoveBrand: (brand: string) => Promise<void>;
  onRenameBrand: (oldVal: string, newVal: string) => Promise<void>;
  onRemoveModel: (model: string) => Promise<void>;
  onRenameModel: (oldVal: string, newVal: string) => Promise<void>;
}

export function BrandAccordion({
  brands,
  modelsByBrand,
  modelsLoading,
  expandedBrands,
  onToggleBrand,
  modelDrafts,
  onModelDraftChange,
  onAddModel,
  canEdit,
  onRemoveBrand,
  onRenameBrand,
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
        const models = modelsByBrand[brand] ?? [];
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
                  ({models.length.toLocaleString("fa-IR")} مدل)
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
                    {models.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-3">
                        {models.map((model) => (
                          <div
                            key={model}
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

                    <AddOptionForm
                      value={modelDrafts[brand] ?? ""}
                      onChange={(v) => onModelDraftChange(brand, v)}
                      onSubmit={() => onAddModel(brand)}
                      placeholder={`افزودن مدل به ${brand}…`}
                      disabled={modelsLoading}
                    >
                      <input
                        value={modelDrafts[brand] ?? ""}
                        onChange={(e) =>
                          onModelDraftChange(brand, e.target.value)
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && onAddModel(brand)
                        }
                        placeholder={`افزودن مدل به ${brand}…`}
                        className="flex-1 h-8 rounded-lg border border-border bg-card px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                        disabled={modelsLoading}
                      />
                      <button
                        type="submit"
                        disabled={
                          !(modelDrafts[brand] ?? "").trim() || modelsLoading
                        }
                        className="btn-primary text-xs h-8 shrink-0 disabled:pointer-events-none disabled:opacity-40"
                      >
                        <Plus size={12} />
                        افزودن مدل
                      </button>
                    </AddOptionForm>
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
