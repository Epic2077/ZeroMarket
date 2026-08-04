"use client";

import { NotebookPen } from "lucide-react";
import { Section } from "@/components/shared/Section";
import { Controller, type Control } from "react-hook-form";
import type { ProductFormValues } from "@/lib/validation/product";

interface SellerNotesSectionProps {
  control: Control<ProductFormValues>;
}

export function SellerNotesSection({ control }: SellerNotesSectionProps) {
  return (
    <Section
      icon={<NotebookPen size={16} className="text-negotiable" />}
      title="یادداشت های شخصی فروشنده"
    >
      <Controller
        control={control}
        name="sellerNotes"
        render={({ field }) => (
          <textarea
            {...field}
            rows={4}
            placeholder="یادداشت‌های داخلی درباره این آگهی…"
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        )}
      />
      <p className="text-2xs text-muted-foreground mt-1.5">
        این یادداشت‌ها فقط برای شما قابل مشاهده است و در آگهی عمومی نمایش داده
        نمی‌شود.
      </p>
    </Section>
  );
}
