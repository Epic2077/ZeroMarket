"use client";

import { Plus, X, Loader2, Car, BarChart3 } from "lucide-react";
import { toFa } from "@/context/carLabels";
import dynamic from "next/dynamic";

const InsightChart = dynamic(
  () => import("@/components/home/PricingInsight/InsightChart"),
  { ssr: false },
);

export interface CarSlot {
  brand: string;
  model: string;
  year: string;
}
export interface InsightData {
  avgPrice: number;
  trend7d: number;
  activeListings: number;
}

const CHART_COLORS = ["#1B4FD8", "#0EA5E9", "#10B981"];
const PRICE_COLORS = ["text-primary", "text-accent", "text-success"];
const BG_COLORS = ["bg-primary/5", "bg-accent/5", "bg-success/5"];
const BORDER_COLORS = [
  "border-primary/25",
  "border-accent/25",
  "border-success/25",
];

const selectClass =
  "h-9 rounded-lg border border-border bg-card text-sm text-foreground px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 cursor-pointer";

function formatPriceShort(value: number): string {
  if (value >= 1_000_000_000)
    return toFa((value / 1_000_000_000).toFixed(2)) + " میلیارد";
  return toFa(Math.round(value / 1_000_000)) + " میلیون";
}

interface Props {
  slots: CarSlot[];
  modelOptions: string[][];
  modelsLoading: boolean[];
  insights: (InsightData | null)[];
  insightsLoading: boolean;
  brandOptions: string[];
  yearOptions: string[];
  taxLoading: boolean;
  onUpdateSlot: (idx: number, field: keyof CarSlot, value: string) => void;
  onAddSlot: () => void;
  onRemoveSlot: (idx: number) => void;
}

export default function CarComparisonSection({
  slots,
  modelOptions,
  modelsLoading,
  insights,
  insightsLoading,
  brandOptions,
  yearOptions,
  taxLoading,
  onUpdateSlot,
  onAddSlot,
  onRemoveSlot,
}: Props) {
  const hasAnyData = insights.some((i) => i !== null);
  const chartData = slots
    .map((s, i) => ({
      name: s.model ? s.brand + " " + s.model : "",
      price: insights[i]?.avgPrice ?? 0,
      color: CHART_COLORS[i],
    }))
    .filter((d) => d.price > 0);

  return (
    <section className="mb-10">
      <h2 className="flex items-center gap-2 text-lg font-700 text-foreground mb-4">
        <Car size={18} className="text-accent" />
        مقایسه خودروها
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selectors */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-4 ${BG_COLORS[idx]} ${BORDER_COLORS[idx]}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-700 text-foreground">
                  خودرو {toFa(idx + 1)}
                </span>
                {slots.length > 1 && (
                  <button
                    onClick={() => onRemoveSlot(idx)}
                    className="p-0.5 rounded text-muted-foreground hover:text-danger transition-colors"
                    aria-label="حذف"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <select
                  value={slot.brand}
                  onChange={(e) => onUpdateSlot(idx, "brand", e.target.value)}
                  disabled={taxLoading}
                  className={selectClass}
                  dir="rtl"
                >
                  <option value="">انتخاب برند</option>
                  {brandOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <div className="relative">
                  <select
                    value={slot.model}
                    onChange={(e) => onUpdateSlot(idx, "model", e.target.value)}
                    disabled={!slot.brand || modelsLoading[idx]}
                    className={selectClass + " w-full"}
                    dir="rtl"
                  >
                    <option value="">انتخاب مدل</option>
                    {(modelOptions[idx] ?? []).map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  {modelsLoading[idx] && (
                    <Loader2
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
                    />
                  )}
                </div>
                <select
                  value={slot.year}
                  onChange={(e) => onUpdateSlot(idx, "year", e.target.value)}
                  disabled={!slot.model}
                  className={selectClass}
                  dir="rtl"
                >
                  <option value="">همه سال‌ها</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              {insightsLoading ? (
                <div className="flex items-center gap-2 mt-3">
                  <Loader2
                    size={14}
                    className="animate-spin text-muted-foreground"
                  />
                  <span className="text-xs text-muted-foreground">
                    در حال دریافت…
                  </span>
                </div>
              ) : insights[idx] ? (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">میانگین قیمت</span>
                    <div
                      className={`font-mono font-700 mt-0.5 ${PRICE_COLORS[idx]}`}
                    >
                      {formatPriceShort(insights[idx]!.avgPrice)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">روند ۷ روزه</span>
                    <div
                      className={`font-mono font-700 mt-0.5 ${insights[idx]!.trend7d >= 0 ? "text-success" : "text-danger"}`}
                    >
                      {(insights[idx]!.trend7d > 0 ? "+" : "") +
                        insights[idx]!.trend7d +
                        "٪"}
                    </div>
                  </div>
                </div>
              ) : slot.brand && slot.model ? (
                <p className="text-xs text-muted-foreground mt-3">
                  داده‌ای یافت نشد
                </p>
              ) : null}
            </div>
          ))}
          {slots.length < 3 && (
            <button
              onClick={onAddSlot}
              className="flex items-center justify-center gap-2 py-2.5 border border-dashed border-border rounded-xl text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              <Plus size={14} /> افزودن خودرو برای مقایسه
            </button>
          )}
        </div>

        {/* Chart */}
        <div className="lg:col-span-2">
          <div className="card-elevated p-5 min-h-75">
            {!hasAnyData && !insightsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BarChart3 size={32} className="text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  برای مشاهده نمودار، حداقل یک خودرو انتخاب کنید
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="text-sm font-700 text-foreground">
                    مقایسه قیمت بازار
                  </div>
                  <div className="text-2xs text-muted-foreground mt-0.5">
                    {slots
                      .filter((s) => s.brand && s.model)
                      .map((s) => s.brand + " " + s.model)
                      .join(" · ") || "—"}
                  </div>
                </div>
                <InsightChart data={chartData} />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
