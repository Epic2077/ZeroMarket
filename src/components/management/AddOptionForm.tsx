"use client";

import { Plus } from "lucide-react";
import { ReactNode } from "react";

interface AddOptionFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
  children?: ReactNode;
}

export function AddOptionForm({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled,
  children,
}: AddOptionFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex items-center gap-2">
      {children ?? (
        <>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            placeholder={placeholder}
            className="flex-1 h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={disabled}
          />
          <button
            type="submit"
            disabled={!value.trim() || disabled}
            className="btn-primary text-sm shrink-0 disabled:pointer-events-none disabled:opacity-40"
          >
            <Plus size={14} />
            افزودن
          </button>
        </>
      )}
    </form>
  );
}