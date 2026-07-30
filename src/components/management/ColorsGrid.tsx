"use client";

import { OptionActions } from "./OptionActions";

interface ColorsGridProps {
  colors: string[];
  taxonomy: any;
  canEdit: boolean;
  onRemove: (color: string) => void;
  onRename: (oldVal: string, newVal: string) => void;
}

function getColorHex(taxonomy: any, colorName: string): string {
  return (
    taxonomy.COLOR?.find((r: any) => r.value === colorName)?.metadata?.hex ??
    "#1b4fd8"
  );
}

export function ColorsGrid({ colors, taxonomy, canEdit, onRemove, onRename }: ColorsGridProps) {
  if (colors.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
        گزینه‌ای ثبت نشده است.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {colors.map((color) => {
        const hex = getColorHex(taxonomy, color);
        return (
          <div
            key={color}
            className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-5 h-5 rounded-full border border-border shrink-0"
                style={{ backgroundColor: hex }}
              />
              <span className="text-sm text-foreground truncate">{color}</span>
              <span className="text-2xs text-muted-foreground font-mono-nums shrink-0">{hex}</span>
            </div>
            {canEdit && (
              <OptionActions
                value={color}
                onRemove={() => onRemove(color)}
                onRename={(newVal) => onRename(color, newVal)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}