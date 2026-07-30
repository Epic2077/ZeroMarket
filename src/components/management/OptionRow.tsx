"use client";

import { useState } from "react";
import { Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";

interface OptionRowProps {
  value: string;
  canEdit: boolean;
  onRemove: () => void;
  onRename: (newValue: string) => Promise<void>;
}

export function OptionRow({ value, canEdit, onRemove, onRename }: OptionRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const save = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onRename(trimmed);
      setEditing(false);
      toast.success("گزینه ویرایش شد");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در ویرایش");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/5 px-3 py-2">
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
          disabled={saving}
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={save}
            disabled={saving}
            aria-label="ذخیره"
            className="flex items-center justify-center w-7 h-7 rounded-lg text-success hover:bg-success/10 transition-colors duration-150 disabled:opacity-40"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
          </button>
          <button
            onClick={() => {
              setDraft(value);
              setEditing(false);
            }}
            disabled={saving}
            aria-label="انصراف"
            className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
      <span className="text-sm text-foreground">{value}</span>
      {canEdit && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            aria-label="ویرایش"
            className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors duration-150"
          >
            <Pencil size={13} />
          </button>
          <ConfirmDeleteModal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={onRemove}
            title={`حذف «${value}»`}
            message={`آیا مطمئن هستید که می‌خواهید «${value}» را حذف کنید؟ این عملیات غیرقابل بازگشت است.`}
          />
          <button
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="حذف"
            className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors duration-150"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}