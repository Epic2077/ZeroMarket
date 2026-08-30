"use client";

import { CheckCircle, Plus, X } from "lucide-react";
import { Section } from "@/components/shared/Section";
import { type ChangeEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";

interface FactoryOptionsSectionProps {
  factoryOptions: string[];
  onAddOption: (option: string) => void;
  onRemoveOption: (option: string) => void;
  draftValue: string;
  onDraftChange: (value: string) => void;
  onDraftKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export function FactoryOptionsSection({
  factoryOptions,
  onAddOption,
  onRemoveOption,
  draftValue,
  onDraftChange,
  onDraftKeyDown,
}: FactoryOptionsSectionProps) {
  return (
    <Section
      icon={<CheckCircle size={16} className="text-success" />}
      title="امکانات و تجهیزات کارخانه"
    >
      <div className="flex items-center gap-2 mb-3">
        <input
          value={draftValue}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onDraftChange(e.target.value)}
          onKeyDown={onDraftKeyDown}
          placeholder="افزودن امکانات (مثلاً سانروف)…"
          className="flex-1 h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Button
          type="button"
          onClick={() => onAddOption(draftValue)}
          disabled={!draftValue.trim()}
          className="text-sm shrink-0 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Plus size={14} />
          افزودن
        </Button>
      </div>
      {factoryOptions.length === 0 ? (
        <p className="text-xs text-muted-foreground py-3 text-center rounded-lg border border-dashed border-border">
          امکاناتی افزوده نشده است.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {factoryOptions.map((opt) => (
            <span
              key={opt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/8 border border-success/20 rounded-lg text-xs font-600 text-foreground"
            >
              {opt}
              <button
                type="button"
                onClick={() => onRemoveOption(opt)}
                aria-label={`حذف ${opt}`}
                className="text-muted-foreground hover:text-danger"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </Section>
  );
}