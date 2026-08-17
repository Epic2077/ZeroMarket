"use client";

import { AlertTriangle, X } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  onConfirm: (close: boolean) => void;
  onClose: () => void;
}

/** Two-choice modal shown when a party rejects a request: close it for good,
 *  or only mark it as rejected. */
export default function RejectRequestDialog({
  title,
  description,
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
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-danger/10 text-danger">
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
        <div className="flex flex-col gap-2 px-5 py-4 border-t border-border bg-muted/30">
          <button
            onClick={() => {
              onConfirm(true);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-danger text-white text-sm font-700 rounded-lg hover:bg-danger/90 transition-colors duration-150"
          >
            بستن درخواست
          </button>
          <button
            onClick={() => {
              onConfirm(false);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-1 px-3 py-2 border border-border text-sm font-700 text-foreground rounded-lg hover:bg-muted transition-colors duration-150"
          >
            فقط رد کردن
          </button>
          <button
            onClick={onClose}
            className="w-full px-3 py-2 text-sm text-muted-foreground rounded-lg hover:bg-muted transition-colors duration-150"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
