import type { ReactNode } from "react";

interface MarketplaceSummaryProp {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
}

interface MarketplaceSummaryProps {
  summary: MarketplaceSummaryProp[];
}

export default function MarketplaceSummary({
  summary,
}: MarketplaceSummaryProps) {
  return (
    <div className="card-elevated p-4">
      <p className="section-label mb-3">خلاصه بازار</p>
      <div className="flex flex-col gap-2.5">
        {summary.map((item) => (
          <div
            key={`sidebar-${item.label}`}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-1.5">
              {item.icon}
              <span className="text-xs text-muted-foreground">
                {item.label}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-700 text-foreground ml-2">
                {item.value}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                {item.sub}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
