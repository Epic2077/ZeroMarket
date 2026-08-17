"use client";

import { TrendingUp, Plus, X, Loader2 } from "lucide-react";
import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
import { fetchModelsByBrand } from "@/lib/supabase/taxonomy";
import { supabase } from "@/lib/supabase/client";
import { toFa, toEn } from "@/context/carLabels";
import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const InsightChart = dynamic(() => import("./InsightChart"), { ssr: false });

interface CarSlot {
  brand: string;
  model: string;
  year: string;
}
interface InsightData {
  avgPrice: number;
  trend7d: number;
  activeListings: number;
}

const CHART_COLORS = ["#1B4FD8", "#0EA5E9", "#10B981"];
const PRICE_COLORS = ["text-primary", "text-accent", "text-success"];
const BG_COLORS = ["bg-primary/10", "bg-accent/10", "bg-success/10"];
const BORDER_COLORS = [
  "border-primary/25",
  "border-accent/25",
  "border-success/25",
];

function formatPriceShort(value: number): string {
  if (value >= 1_000_000_000)
    return toFa((value / 1_000_000_000).toFixed(2)) + " میلیارد";
  return toFa(Math.round(value / 1_000_000)) + " میلیون";
}

export default function PriceInsightWidget() {
  const { values, loading: taxLoading } = useTaxonomyOptions();
  const brandOptions = useMemo(() => values("BRAND"), [values]);
  const yearOptions = useMemo(() => values("YEAR"), [values]);
  const [slots, setSlots] = useState<CarSlot[]>([
    { brand: "", model: "", year: "" },
  ]);
  const [modelOptions, setModelOptions] = useState<string[][]>([[]]);
  const [modelsLoading, setModelsLoading] = useState<boolean[]>([false]);
  const [insights, setInsights] = useState<(InsightData | null)[]>([null]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const fetchModels = useCallback(async (brand: string, slotIdx: number) => {
    if (!brand) {
      setModelOptions((p) => {
        const n = [...p];
        n[slotIdx] = [];
        return n;
      });
      return;
    }
    setModelsLoading((p) => {
      const n = [...p];
      n[slotIdx] = true;
      return n;
    });
    try {
      const rows = await fetchModelsByBrand(brand);
      setModelOptions((p) => {
        const n = [...p];
        n[slotIdx] = rows.map((r) => r.value);
        return n;
      });
    } catch {
      setModelOptions((p) => {
        const n = [...p];
        n[slotIdx] = [];
        return n;
      });
    } finally {
      setModelsLoading((p) => {
        const n = [...p];
        n[slotIdx] = false;
        return n;
      });
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    if (!slots.some((s) => s.brand && s.model)) {
      setInsights(slots.map(() => null));
      return;
    }
    setInsightsLoading(true);
    try {
      const results = await Promise.all(
        slots.map(async (s) => {
          if (!s.brand || !s.model) return null;
          let q = supabase
            .from("car_market_insights")
            .select("avg_listed_price, avg_price_7d_ago, total_active_listings")
            .eq("brand", s.brand)
            .eq("model", s.model);
          if (s.year) q = q.eq("year", Number(toEn(s.year)));
          const { data } = await q.maybeSingle();
          if (!data) return null;
          const avg = Number(data.avg_listed_price),
            ago7d = Number(data.avg_price_7d_ago || 0);
          return {
            avgPrice: avg || 0,
            trend7d: ago7d > 0 ? Math.round(((avg - ago7d) / ago7d) * 100) : 0,
            activeListings: Number(data.total_active_listings) || 0,
          } as InsightData;
        }),
      );
      setInsights(results);
    } catch {
      setInsights(slots.map(() => null));
    } finally {
      setInsightsLoading(false);
    }
  }, [slots]);

  useEffect(() => {
    void fetchInsights();
  }, [fetchInsights]);

  const updateSlot = (idx: number, field: keyof CarSlot, value: string) => {
    setSlots((prev) => {
      const n = [...prev];
      n[idx] = { ...n[idx], [field]: value };
      if (field === "brand") {
        n[idx] = { ...n[idx], model: "", year: "" };
        void fetchModels(value, idx);
      }
      return n;
    });
  };
  const addSlot = () => {
    if (slots.length >= 3) return;
    setSlots((prev) => [...prev, { brand: "", model: "", year: "" }]);
    setModelOptions((prev) => [...prev, []]);
    setModelsLoading((prev) => [...prev, false]);
  };
  const removeSlot = (idx: number) => {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((_, i) => i !== idx));
    setModelOptions((prev) => prev.filter((_, i) => i !== idx));
    setModelsLoading((prev) => prev.filter((_, i) => i !== idx));
  };
  const hasAnyData = insights.some((i) => i !== null);
  const chartData = useMemo(
    () =>
      slots
        .map((s, i) => ({
          name: s.model ? s.brand + " " + s.model : "",
          price: insights[i]?.avgPrice ?? 0,
          color: CHART_COLORS[i],
        }))
        .filter((d) => d.price > 0),
    [slots, insights],
  );

  return (
    <section className="bg-foreground py-14 vazir-matn">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10">
        <div className="flex flex-col lg:flex-row gap-8" dir="rtl">
          <div className="lg:w-1/3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-4">
              <TrendingUp size={13} className="text-accent" />
              <span className="text-xs font-600 text-accent tracking-wide">
                هوش قیمت‌گذاری
              </span>
            </div>
            <h2 className="text-2xl font-700 text-white mb-3">
              تحلیل قیمت بازار
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              برند، مدل و سال (اختیاری) را انتخاب کنید و تا ۳ خودرو را مقایسه
              کنید.
            </p>
            <div className="flex flex-col gap-4 mb-6">
              {slots.map((slot, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 ${BG_COLORS[idx]} ${BORDER_COLORS[idx]}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-700 text-slate-300">
                      خودرو {toFa(idx + 1)}
                    </span>
                    {slots.length > 1 && (
                      <button
                        onClick={() => removeSlot(idx)}
                        className="p-0.5 rounded text-slate-500 hover:text-danger transition-colors"
                        aria-label="حذف"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <select
                      value={slot.brand}
                      onChange={(e) => updateSlot(idx, "brand", e.target.value)}
                      disabled={taxLoading}
                      className="h-9 rounded-lg border border-white/10 bg-white/10 text-sm text-slate-200 px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 cursor-pointer"
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
                        onChange={(e) =>
                          updateSlot(idx, "model", e.target.value)
                        }
                        disabled={!slot.brand || modelsLoading[idx]}
                        className="h-9 w-full rounded-lg border border-white/10 bg-white/10 text-sm text-slate-200 px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 cursor-pointer"
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
                          className="absolute left-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
                        />
                      )}
                    </div>
                    <select
                      value={slot.year}
                      onChange={(e) => updateSlot(idx, "year", e.target.value)}
                      disabled={!slot.model}
                      className="h-9 rounded-lg border border-white/10 bg-white/10 text-sm text-slate-200 px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 cursor-pointer"
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
                        className="animate-spin text-slate-400"
                      />
                      <span className="text-xs text-slate-400">
                        در حال دریافت…
                      </span>
                    </div>
                  ) : insights[idx] ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">میانگین قیمت</span>
                        <div
                          className={`font-mono font-700 mt-0.5 ${PRICE_COLORS[idx]}`}
                        >
                          {formatPriceShort(insights[idx]!.avgPrice)}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">روند ۷ روزه</span>
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
                    <p className="text-xs text-slate-500 mt-3">
                      داده‌ای یافت نشد
                    </p>
                  ) : null}
                </div>
              ))}
              {slots.length < 3 && (
                <button
                  onClick={addSlot}
                  className="flex items-center justify-center gap-2 py-2.5 border border-dashed border-white/15 rounded-xl text-xs text-slate-400 hover:text-white hover:border-white/30 transition-colors"
                >
                  <Plus size={14} />
                  افزودن خودرو برای مقایسه
                </button>
              )}
            </div>
            {/* <div className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/20 rounded-xl">
              <Lock size={16} className="text-warning shrink-0" />
              <div>
                <div className="text-xs font-700 text-warning">
                  تحلیل کامل — ویژه
                </div>
                <div className="text-2xs text-slate-400 mt-0.5">
                  تاریخچه ۳۰ روزه، مقایسه مدل‌ها، خروجی
                </div>
              </div>
            </div> */}
          </div>
          <div className="lg:w-2/3 w-full">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              {!hasAnyData && !insightsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <TrendingUp size={32} className="text-slate-600 mb-3" />
                  <p className="text-sm text-slate-400">
                    برای مشاهده نمودار، حداقل یک خودرو با برند و مدل انتخاب کنید
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm font-700 text-white">
                        مقایسه قیمت بازار
                      </div>
                      <div className="text-2xs text-slate-400 mt-0.5">
                        {slots
                          .filter((s) => s.brand && s.model)
                          .map((s) => s.brand + " " + s.model)
                          .join(" · ") || "خودرویی انتخاب نشده"}
                      </div>
                    </div>
                  </div>
                  <InsightChart data={chartData} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
