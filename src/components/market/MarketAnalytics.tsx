"use client";

import {
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Loader2,
  BarChart3,
  Zap,
  Car,
} from "lucide-react";
import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
import { fetchModelsByBrand } from "@/lib/supabase/taxonomy";
import { useListings } from "@/hooks/useListings";
import { listingRowToListing } from "@/lib/supabase/listings";
import { supabase } from "@/lib/supabase/client";
import { toFa } from "@/context/carLabels";
import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const InsightChart = dynamic(
  () => import("@/components/home/PricingInsight/InsightChart"),
  { ssr: false },
);
const PriceScatter = dynamic(() => import("./PriceScatter"), { ssr: false });

// ── Types ────────────────────────────────────────────────────────────

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
interface MarketOverviewItem {
  brand: string;
  model: string;
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

function formatPriceShort(value: number): string {
  if (value >= 1_000_000_000)
    return toFa((value / 1_000_000_000).toFixed(2)) + " میلیارد";
  return toFa(Math.round(value / 1_000_000)) + " میلیون";
}

const selectClass =
  "h-9 rounded-lg border border-border bg-card text-sm text-foreground px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 cursor-pointer";

// ── Component ────────────────────────────────────────────────────────

export default function MarketAnalytics() {
  const { values, loading: taxLoading } = useTaxonomyOptions();
  const { listings: rawListings, loading: listingsLoading } = useListings();

  const brandOptions = useMemo(() => values("BRAND"), [values]);
  const yearOptions = useMemo(() => values("YEAR"), [values]);
  const allListings = useMemo(
    () => rawListings.map((row) => listingRowToListing(row)),
    [rawListings],
  );

  // ── Comparison state ───────────────────────────────────────────────
  const [slots, setSlots] = useState<CarSlot[]>([
    { brand: "", model: "", year: "" },
  ]);
  const [modelOptions, setModelOptions] = useState<string[][]>([[]]);
  const [modelsLoading, setModelsLoading] = useState<boolean[]>([false]);
  const [insights, setInsights] = useState<(InsightData | null)[]>([null]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // ── Market overview state ──────────────────────────────────────────
  const [overview, setOverview] = useState<{
    gainers: MarketOverviewItem[];
    droppers: MarketOverviewItem[];
    mostActive: MarketOverviewItem[];
  } | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

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
          if (s.year) q = q.eq("year", s.year);
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

  // ── Fetch market overview ──────────────────────────────────────────
  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const { data } = await supabase
        .from("car_market_insights")
        .select(
          "brand, model, avg_listed_price, avg_price_7d_ago, total_active_listings",
        )
        .not("avg_listed_price", "is", null)
        .order("total_active_listings", { ascending: false })
        .limit(50);
      if (!data) {
        setOverview(null);
        setOverviewLoading(false);
        return;
      }
      const items: MarketOverviewItem[] = (data as any[])
        .map((d) => {
          const avg = Number(d.avg_listed_price),
            ago7d = Number(d.avg_price_7d_ago || 0);
          return {
            brand: d.brand,
            model: d.model,
            avgPrice: avg || 0,
            trend7d: ago7d > 0 ? Math.round(((avg - ago7d) / ago7d) * 100) : 0,
            activeListings: Number(d.total_active_listings) || 0,
          };
        })
        .filter((d) => d.avgPrice > 0);
      const sorted = [...items].sort((a, b) => b.trend7d - a.trend7d);
      setOverview({
        gainers: sorted.filter((i) => i.trend7d > 0).slice(0, 5),
        droppers: [...items]
          .sort((a, b) => a.trend7d - b.trend7d)
          .filter((i) => i.trend7d < 0)
          .slice(0, 5),
        mostActive: [...items]
          .sort((a, b) => b.activeListings - a.activeListings)
          .slice(0, 5),
      });
    } catch {
      setOverview(null);
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInsights();
  }, [fetchInsights]);
  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

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
    setSlots((p) => [...p, { brand: "", model: "", year: "" }]);
    setModelOptions((p) => [...p, []]);
    setModelsLoading((p) => [...p, false]);
  };
  const removeSlot = (idx: number) => {
    if (slots.length <= 1) return;
    setSlots((p) => p.filter((_, i) => i !== idx));
    setModelOptions((p) => p.filter((_, i) => i !== idx));
    setModelsLoading((p) => p.filter((_, i) => i !== idx));
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

  // ── Scatter data for selected car ──────────────────────────────────
  const scatterCar = useMemo(() => {
    const s = slots[0];
    if (!s.brand || !s.model) return null;
    return {
      brand: s.brand,
      model: s.model,
      year: s.year || null,
      marketAvg: insights[0]?.avgPrice ?? 0,
    };
  }, [slots, insights]);
  const scatterListings = useMemo(() => {
    if (!scatterCar) return [];
    return allListings
      .filter(
        (l) =>
          l.brand === scatterCar.brand &&
          l.model === scatterCar.model &&
          (!scatterCar.year || l.year === Number(scatterCar.year)),
      )
      .map((l) => ({
        id: l.id,
        price: l.price,
        seller: l.sellerName,
        status: l.status,
        city: l.city,
      }));
  }, [allListings, scatterCar]);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8 vazir-matn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-800 text-foreground">تحلیل بازار</h1>
        <p className="text-sm text-muted-foreground mt-1">
          مقایسه قیمت، روندهای بازار و نمای کلی از وضعیت خودروها
        </p>
      </div>

      {/* ── Market Overview Cards ──────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-lg font-700 text-foreground mb-4">
          <BarChart3 size={18} className="text-primary" />
          نمای بازار
        </h2>
        {overviewLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : overview ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Gainers */}
            <div className="card-elevated p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-700 text-success mb-3">
                <TrendingUp size={14} />
                بیشترین رشد ۷ روزه
              </h3>
              <div className="space-y-2">
                {overview.gainers.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-600 text-foreground truncate">
                      {item.brand} {item.model}
                    </span>
                    <span className="font-mono text-success font-700">
                      +{item.trend7d}٪
                    </span>
                  </div>
                ))}
                {overview.gainers.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    داده‌ای موجود نیست
                  </p>
                )}
              </div>
            </div>
            {/* Top Droppers */}
            <div className="card-elevated p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-700 text-danger mb-3">
                <TrendingDown size={14} />
                بیشترین کاهش ۷ روزه
              </h3>
              <div className="space-y-2">
                {overview.droppers.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-600 text-foreground truncate">
                      {item.brand} {item.model}
                    </span>
                    <span className="font-mono text-danger font-700">
                      {item.trend7d}٪
                    </span>
                  </div>
                ))}
                {overview.droppers.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    داده‌ای موجود نیست
                  </p>
                )}
              </div>
            </div>
            {/* Most Active */}
            <div className="card-elevated p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-700 text-primary mb-3">
                <Zap size={14} />
                فعال‌ترین بازارها
              </h3>
              <div className="space-y-2">
                {overview.mostActive.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-600 text-foreground truncate">
                      {item.brand} {item.model}
                    </span>
                    <span className="font-mono text-muted-foreground">
                      {toFa(item.activeListings)} آگهی
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* ── Comparison Tool ────────────────────────────────────────── */}
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
                      onClick={() => removeSlot(idx)}
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
                    onChange={(e) => updateSlot(idx, "brand", e.target.value)}
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
                      onChange={(e) => updateSlot(idx, "model", e.target.value)}
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
                    onChange={(e) => updateSlot(idx, "year", e.target.value)}
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
                      <span className="text-muted-foreground">
                        میانگین قیمت
                      </span>
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
                onClick={addSlot}
                className="flex items-center justify-center gap-2 py-2.5 border border-dashed border-border rounded-xl text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <Plus size={14} />
                افزودن خودرو برای مقایسه
              </button>
            )}
          </div>

          {/* Chart */}
          <div className="lg:col-span-2">
            <div className="card-elevated p-5 min-h-[300px]">
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

      {/* ── Price Scatter ──────────────────────────────────────────── */}
      {scatterCar && scatterListings.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-700 text-foreground mb-4">
            <Zap size={18} className="text-warning" />
            تحلیل قیمت — {scatterCar.brand} {scatterCar.model}
          </h2>
          <div className="card-elevated p-5">
            <div className="mb-4">
              <p className="text-sm font-700 text-foreground">
                پراکندگی قیمت آگهی‌ها
              </p>
              <p className="text-2xs text-muted-foreground mt-0.5">
                {toFa(scatterListings.length)} آگهی فعال — میانگین بازار:{" "}
                <span className="font-mono text-primary">
                  {formatPriceShort(scatterCar.marketAvg)}
                </span>
              </p>
            </div>
            <PriceScatter
              listings={scatterListings}
              marketAvg={scatterCar.marketAvg}
            />
          </div>
        </section>
      )}
    </div>
  );
}
