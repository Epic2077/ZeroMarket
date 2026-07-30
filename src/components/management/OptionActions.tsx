"use client";

import { useState } from "react";
import { Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";

interface OptionActionsProps {
  value: string;
  onRemove: () => void;
  onRename: (newValue: string) => Promise<void>;
}

export function OptionActions({ value, onRemove, onRename }: OptionActionsProps) {
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
      <div className="flex items-center gap-1">
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
          className="h-7 w-24 rounded border border-border bg-card px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        <button
          onClick={save}
          disabled={saving}
          aria-label="ذخیره"
          className="flex items-center justify-center w-6 h-6 rounded text-success hover:bg-success/10"
        >
          {saving ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Check size={12} />
          )}
        </button>
        <button
          onClick={() => {
            setDraft(value);
            setEditing(false);
          }}
          disabled={saving}
          aria-label="انصراف"
          className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:bg-muted"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        aria-label="ویرایش"
        className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-primary hover:bg-muted"
      >
        <Pencil size={12} />
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
        className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-danger hover:bg-danger/10"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}