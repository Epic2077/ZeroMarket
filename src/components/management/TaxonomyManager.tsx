"use client";

import { useSession } from "@/context/SessionProvider";
import { useTaxonomy } from "@/context/TaxonomyProvider";
import {
  taxonomyCategories,
  type TaxonomyCategory,
} from "@/context/taxonomy";
import { Check, CheckCheck, Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function OptionRow({
  value,
  category,
  canEdit,
  onRemove,
  onRename,
}: {
  value: string;
  category: TaxonomyCategory;
  canEdit: boolean;
  onRemove: (value: string) => void;
  onRename: (oldValue: string, newValue: string) => boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const save = () => {
    if (!draft.trim()) return;
    onRename(value, draft);
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
        {canEdit && editing ? (
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
        ) : canEdit ? (
          <>
            <button
              onClick={() => setEditing(true)}
              aria-label="ویرایش"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors duration-150"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onRemove(value)}
              aria-label="حذف"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors duration-150"
            >
              <Trash2 size={13} />
            </button>
          </>
        ) : (
          <span className="text-2xs text-muted-foreground">در انتظار تایید مالک</span>
        )}
      </div>
    </div>
  );
}

export default function TaxonomyManager() {
  const {
    taxonomy,
    addOption,
    removeOption,
    renameOption,
    pendingChanges,
    submitChange,
    approveChange,
    rejectChange,
  } = useTaxonomy();
  const { role } = useSession();
  const [active, setActive] = useState<TaxonomyCategory>("brands");
  const [draft, setDraft] = useState("");

  const meta = taxonomyCategories.find((c) => c.id === active)!;
  const options = taxonomy[active];
  const isOwner = role === "owner";

  const handleAdd = () => {
    const value = draft.trim();
    if (!value) return;

    if (isOwner) {
      if (addOption(active, value)) {
        toast.success(`«${value}» افزوده شد`);
        setDraft("");
      } else {
        toast.error("این گزینه از قبل وجود دارد");
      }
      return;
    }

    submitChange({
      category: active,
      action: "add",
      value,
      requestedBy: "admin",
    });
    toast.success("درخواست افزودن برای تایید مالک ثبت شد");
    setDraft("");
  };

  const handleRemove = (value: string) => {
    if (isOwner) {
      removeOption(active, value);
      toast.success("گزینه حذف شد");
      return;
    }

    submitChange({
      category: active,
      action: "remove",
      value,
      requestedBy: "admin",
    });
    toast.success("درخواست حذف برای تایید مالک ثبت شد");
  };

  const handleRename = (oldValue: string, newValue: string) => {
    if (isOwner) {
      return renameOption(active, oldValue, newValue);
    }

    submitChange({
      category: active,
      action: "rename",
      value: oldValue,
      newValue,
      requestedBy: "admin",
    });
    toast.success("درخواست تغییر نام برای تایید مالک ثبت شد");
    return true;
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
      {isOwner && pendingChanges.length > 0 && (
        <div className="card-elevated p-5 lg:col-span-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-700 text-foreground">
            <CheckCheck size={16} className="text-primary" />
            تغییرات در انتظار تایید مالک
          </div>
          <div className="space-y-3">
            {pendingChanges.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-sm font-700 text-foreground">
                    {request.action === "add" && `افزودن «${request.value}»`}
                    {request.action === "remove" && `حذف «${request.value}»`}
                    {request.action === "rename" &&
                      `تغییر «${request.value}» به «${request.newValue ?? ""}»`}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    دسته: {
                      taxonomyCategories.find((cat) => cat.id === request.category)?.label
                    }
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const ok = approveChange(request.id);
                      toast[ok ? "success" : "error"](
                        ok ? "تغییر تایید و اعمال شد" : "اعمال تغییر ناموفق بود",
                      );
                    }}
                    className="btn-primary text-sm"
                  >
                    تایید
                  </button>
                  <button
                    onClick={() => {
                      rejectChange(request.id);
                      toast.success("تغییر رد شد");
                    }}
                    className="btn-secondary text-sm"
                  >
                    رد
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-elevated h-fit p-3">
        <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1 text-xs font-700 text-muted-foreground">
          <Tags size={14} />
          دسته‌بندی گزینه‌ها
        </div>
        <div className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
          {taxonomyCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActive(cat.id);
                setDraft("");
              }}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-right text-sm font-600 transition-colors duration-150 ${
                active === cat.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.label}
              <span className="mr-1 text-2xs text-muted-foreground">
                ({taxonomy[cat.id].length.toLocaleString("fa-IR")})
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="card-elevated p-5 lg:col-span-3">
        <h3 className="mb-1 text-sm font-700 text-foreground">{meta.label}</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          {isOwner
            ? `گزینه‌های «${meta.label}» در فرم ثبت آگهی نمایش داده می‌شوند.`
            : `تغییرات «${meta.label}» پس از تایید مالک اعمال می‌شوند.`}
        </p>

        <div className="mb-4 flex items-center gap-2">
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
            className="btn-primary text-sm shrink-0 disabled:pointer-events-none disabled:opacity-40"
          >
            <Plus size={14} />
            افزودن
          </button>
        </div>

        {options.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
            گزینه‌ای ثبت نشده است.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {options.map((value) => (
              <OptionRow
                key={value}
                value={value}
                category={active}
                canEdit={isOwner}
                onRemove={handleRemove}
                onRename={handleRename}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
