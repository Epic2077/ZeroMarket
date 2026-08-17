"use client";

import { toFa } from "@/context/carLabels";
import type { CarSpecRow } from "@/lib/supabase/carSpecs";
import { CheckCircle2, Gauge, Cog, Fuel, CarFront } from "lucide-react";

interface SlotSpec {
  brand: string;
  model: string;
  year: string;
  avgPrice: number;
  trend7d: number;
  activeListings: number;
  spec: CarSpecRow | null;
}

interface Props {
  specs: SlotSpec[];
}

function formatPriceShort(value: number): string {
  if (value >= 1_000_000_000)
    return toFa((value / 1_000_000_000).toFixed(2)) + " میلیارد";
  return toFa(Math.round(value / 1_000_000)) + " میلیون";
}

// Determines which value is "better" for a given row (lower is better for price)
function bestIndex(values: number[], lowerIsBetter = false): number | null {
  if (values.length < 2 || values.some((v) => !v)) return null;
  const target = lowerIsBetter ? Math.min(...values) : Math.max(...values);
  return values.indexOf(target);
}

export default function SpecsComparisonTable({ specs }: Props) {
  const valid = specs.filter((s) => s.brand && s.model);
  if (valid.length < 2) return null;

  const priceBest = bestIndex(
    valid.map((s) => s.avgPrice),
    true,
  );

  const rows: {
    label: string;
    icon: React.ReactNode;
    values: React.ReactNode[];
    highlight?: number | null;
  }[] = [
    {
      label: "موتور",
      icon: <Gauge size={14} className="text-primary" />,
      values: valid.map((s) => s.spec?.engine ?? "—"),
    },
    {
      label: "گیربکس",
      icon: <Cog size={14} className="text-accent" />,
      values: valid.map((s) => s.spec?.transmission ?? "—"),
    },
    {
      label: "سوخت",
      icon: <Fuel size={14} className="text-warning" />,
      values: valid.map((s) => s.spec?.fuel_type ?? "—"),
    },
    {
      label: "بدنه",
      icon: <CarFront size={14} className="text-negotiable" />,
      values: valid.map((s) => s.spec?.body_type ?? "—"),
    },
    {
      label: "میانگین قیمت",
      icon: <CheckCircle2 size={14} className="text-success" />,
      values: valid.map((s) =>
        s.avgPrice ? formatPriceShort(s.avgPrice) : "—",
      ),
      highlight: priceBest,
    },
    {
      label: "روند ۷ روزه",
      icon: <CheckCircle2 size={14} className="text-success" />,
      values: valid.map((s) =>
        s.trend7d ? `${s.trend7d > 0 ? "+" : ""}${s.trend7d}٪` : "—",
      ),
    },
    {
      label: "آگهی فعال",
      icon: <CheckCircle2 size={14} className="text-success" />,
      values: valid.map((s) =>
        s.activeListings ? toFa(s.activeListings) : "—",
      ),
    },
  ];

  return (
    <div className="card-elevated overflow-hidden mt-6">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-700 text-foreground">مقایسه مشخصات</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40">
              <th className="px-4 py-3 text-right text-xs font-700 text-muted-foreground whitespace-nowrap">
                مشخصات
              </th>
              {valid.map((s, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-center text-xs font-800 whitespace-nowrap ${i === 0 ? "text-primary" : i === 1 ? "text-accent" : "text-success"}`}
                >
                  {s.brand} {s.model}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-t border-border">
                <td className="px-4 py-3 text-xs font-600 text-muted-foreground whitespace-nowrap">
                  <span className="flex items-center gap-1.5">
                    {row.icon}
                    {row.label}
                  </span>
                </td>
                {row.values.map((value, vi) => (
                  <td
                    key={vi}
                    className={`px-4 py-3 text-center text-xs ${row.highlight === vi ? "bg-success/5 text-success font-700" : "text-foreground"}`}
                  >
                    {value}
                    {row.highlight === vi && (
                      <CheckCircle2
                        size={12}
                        className="inline-block ml-1 text-success"
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
