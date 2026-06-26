"use client";

import { useTaxonomy } from "@/context/TaxonomyProvider";
import {
  taxonomyCategories,
  type TaxonomyCategory,
} from "@/context/taxonomy";
import { Check, Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Single editable option row with inline rename.
function OptionRow({
  value,
  category,
}: {
  value: string;
  category: TaxonomyCategory;
}) {
  const { renameOption, removeOption } = useTaxonomy();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => {
    if (!draft.trim()) return;
    renameOption(category, value, draft);
    setEditing(false);
    toast.success("گزینه ویرایش شد");
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      ) : (
        <span className="text-sm text-foreground">{value}</span>
      )}
      <div className="flex items-center gap-1 shrink-0">
        {editing ? (
          <>
            <button
              onClick={save}
              aria-label="ذخیره"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-success hover:bg-success/10 transition-colors duration-150"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => {
                setDraft(value);
                setEditing(false);
              }}
              aria-label="انصراف"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              aria-label="ویرایش"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors duration-150"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => {
                removeOption(category, value);
                toast.success("گزینه حذف شد");
              }}
              aria-label="حذف"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors duration-150"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function TaxonomyManager() {
  const { taxonomy, addOption } = useTaxonomy();
  const [active, setActive] = useState<TaxonomyCategory>("brands");
  const [draft, setDraft] = useState("");

  const meta = taxonomyCategories.find((c) => c.id === active)!;
  const options = taxonomy[active];

  const handleAdd = () => {
    const value = draft.trim();
    if (!value) return;
    if (addOption(active, value)) {
      toast.success(`«${value}» افزوده شد`);
      setDraft("");
    } else {
      toast.error("این گزینه از قبل وجود دارد");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      {/* Category switcher */}
      <div className="card-elevated p-3 h-fit">
        <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1 text-xs font-700 text-muted-foreground">
          <Tags size={14} />
          دسته‌بندی گزینه‌ها
        </div>
        <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto">
          {taxonomyCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActive(cat.id);
                setDraft("");
              }}
              className={`whitespace-nowrap text-right px-3 py-2 rounded-lg text-sm font-600 transition-colors duration-150 ${
                active === cat.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.label}
              <span className="text-2xs text-muted-foreground mr-1">
                ({taxonomy[cat.id].length.toLocaleString("fa-IR")})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Options editor */}
      <div className="card-elevated p-5 lg:col-span-3">
        <h3 className="text-sm font-700 text-foreground mb-1">{meta.label}</h3>
        <p className="text-xs text-muted-foreground mb-4">
          گزینه‌های «{meta.label}» در فرم ثبت آگهی نمایش داده می‌شوند.
        </p>

        {/* Add new */}
        <div className="flex items-center gap-2 mb-4">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={`افزودن ${meta.noun} جدید…`}
            className="flex-1 h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleAdd}
            disabled={!draft.trim()}
            className="btn-primary text-sm shrink-0 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Plus size={14} />
            افزودن
          </button>
        </div>

        {/* List */}
        {options.length === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center rounded-lg border border-dashed border-border">
            گزینه‌ای ثبت نشده است.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {options.map((value) => (
              <OptionRow key={value} value={value} category={active} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
