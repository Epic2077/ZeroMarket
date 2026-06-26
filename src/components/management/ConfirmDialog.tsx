"use client";

import { AlertTriangle, X } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onClose: () => void;
}

// Lightweight confirmation modal for irreversible actions (delete post,
// suspend account). Sits above other modals.
export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "تأیید",
  tone = "danger",
  onConfirm,
  onClose,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center p-4 vazir-matn"
      dir="rtl"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-start gap-3 px-5 py-5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              tone === "danger"
                ? "bg-danger/10 text-danger"
                : "bg-primary/10 text-primary"
            }`}
          >
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-700 text-foreground">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150"
          >
            <X size={15} />
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-muted/30">
          <button onClick={onClose} className="btn-secondary text-sm">
            انصراف
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`text-sm px-4 py-2 rounded-lg font-700 text-white transition-colors duration-150 ${
              tone === "danger"
                ? "bg-danger hover:bg-danger/90"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
