"use client";

import { Gauge, Loader2 } from "lucide-react";
import { Section } from "@/components/shared/Section";

interface TechnicalSpecsSectionProps {
  engine?: string;
  transmission?: string;
  fuelType?: string;
  loading?: boolean;
}

export function TechnicalSpecsSection({
  engine,
  transmission,
  fuelType,
  loading = false,
}: TechnicalSpecsSectionProps) {
  const loadingEl = (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <Loader2 size={10} className="animate-spin" />
      در حال بررسی…
    </span>
  );

  return (
    <Section
      icon={<Gauge size={16} className="text-accent" />}
      title="مشخصات فنی"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-muted rounded-xl p-3">
          <div className="text-2xs text-muted-foreground mb-1">حجم موتور</div>
          <div className="text-sm font-700 text-foreground">
            {loading ? loadingEl : (engine ?? "—")}
          </div>
        </div>
        <div className="bg-muted rounded-xl p-3">
          <div className="text-2xs text-muted-foreground mb-1">گیربکس</div>
          <div className="text-sm font-700 text-foreground">
            {loading ? loadingEl : (transmission ?? "—")}
          </div>
        </div>
        <div className="bg-muted rounded-xl p-3">
          <div className="text-2xs text-muted-foreground mb-1">نوع سوخت</div>
          <div className="text-sm font-700 text-foreground">
            {loading ? loadingEl : (fuelType ?? "—")}
          </div>
        </div>
      </div>
      <p className="text-2xs text-muted-foreground mt-3">
        مشخصات فنی بر اساس برند و مدل انتخاب‌شده به‌صورت خودکار تکمیل می‌شود.
      </p>
    </Section>
  );
}
