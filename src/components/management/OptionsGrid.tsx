"use client";

import { OptionRow } from "./OptionRow";

interface OptionsGridProps {
  options: string[];
  canEdit: boolean;
  onRemove: (value: string) => Promise<void>;
  onRename: (oldVal: string, newVal: string) => Promise<void>;
}

export function OptionsGrid({
  options,
  canEdit,
  onRemove,
  onRename,
}: OptionsGridProps) {
  if (options.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
        گزینه‌ای ثبت نشده است.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((value) => (
        <OptionRow
          key={value}
          value={value}
          canEdit={canEdit}
          onRemove={() => onRemove(value)}
          onRename={(newValue) => onRename(value, newValue)}
        />
      ))}
    </div>
  );
}
