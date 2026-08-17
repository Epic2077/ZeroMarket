"use client";

import { useTaxonomyOptions } from "@/hooks/useTaxonomyOptions";
import { fetchModelsByBrand } from "@/lib/supabase/taxonomy";
import {
  fetchCarSpecsByBrandModel,
  type CarSpecRow,
} from "@/lib/supabase/carSpecs";
import { useListings } from "@/hooks/useListings";
import { listingRowToListing } from "@/lib/supabase/listings";
import { supabase } from "@/lib/supabase/client";
import { toEn } from "@/context/carLabels";
import { useCallback, useEffect, useMemo, useState } from "react";

import MarketOverviewSection, {
  type MarketOverviewItem,
} from "./analytics/MarketOverviewSection";
import CarComparisonSection, {
  type CarSlot,
  type InsightData,
} from "./analytics/CarComparisonSection";
import SpecsComparisonTable from "./analytics/SpecsComparisonTable";
import PriceScatterSection from "./analytics/PriceScatterSection";

export default function MarketAnalytics() {
  const { values, loading: taxLoading } = useTaxonomyOptions();
  const { listings: rawListings } = useListings();

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

  // ── Specs state ────────────────────────────────────────────────────
  const [carSpecs, setCarSpecs] = useState<(CarSpecRow | null)[]>([null]);

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

  // ── Fetch car specs for comparison ────────────────────────────────
  useEffect(() => {
    const loadSpecs = async () => {
      const specs = await Promise.all(
        slots.map(async (s) => {
          if (!s.brand || !s.model) return null;
          try {
            return await fetchCarSpecsByBrandModel(
              s.brand,
              s.model,
              s.year ? toEn(s.year) : null,
            );
          } catch {
            return null;
          }
        }),
      );
      setCarSpecs(specs);
    };
    void loadSpecs();
  }, [slots]);

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

  // ── Scatter data for first selected car ────────────────────────────
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
    const scatterYear = scatterCar.year ? Number(toEn(scatterCar.year)) : null;
    return allListings
      .filter(
        (l) =>
          l.brand === scatterCar.brand &&
          l.model === scatterCar.model &&
          (!scatterYear || l.year === scatterYear),
      )
      .map((l) => ({
        id: l.id,
        price: l.price,
        seller: l.sellerName,
        status: l.status,
        city: l.city,
      }));
  }, [allListings, scatterCar]);

  // ── Specs for comparison table ─────────────────────────────────────
  const comparisonSpecs = useMemo(
    () =>
      slots
        .map((s, i) => ({
          brand: s.brand,
          model: s.model,
          year: s.year,
          avgPrice: insights[i]?.avgPrice ?? 0,
          trend7d: insights[i]?.trend7d ?? 0,
          activeListings: insights[i]?.activeListings ?? 0,
          spec: carSpecs[i] ?? null,
        }))
        .filter((s) => s.brand && s.model),
    [slots, insights, carSpecs],
  );

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8 vazir-matn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-800 text-foreground">تحلیل بازار</h1>
        <p className="text-sm text-muted-foreground mt-1">
          مقایسه قیمت، مشخصات و روندهای بازار خودروها
        </p>
      </div>

      <MarketOverviewSection overview={overview} loading={overviewLoading} />

      <CarComparisonSection
        slots={slots}
        modelOptions={modelOptions}
        modelsLoading={modelsLoading}
        insights={insights}
        insightsLoading={insightsLoading}
        brandOptions={brandOptions}
        yearOptions={yearOptions}
        taxLoading={taxLoading}
        onUpdateSlot={updateSlot}
        onAddSlot={addSlot}
        onRemoveSlot={removeSlot}
      />

      <SpecsComparisonTable specs={comparisonSpecs} />

      {scatterCar && (
        <div className="mt-10">
          <PriceScatterSection
            carLabel={`${scatterCar.brand} ${scatterCar.model}`}
            marketAvg={scatterCar.marketAvg}
            listings={scatterListings}
          />
        </div>
      )}
    </div>
  );
}
