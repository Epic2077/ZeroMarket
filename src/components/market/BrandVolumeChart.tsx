"use client";
import { brandFa } from "@/context/marketFilters";
import { toFa } from "@/context/carLabels";
import type { Listing } from "@/types/dataTypes";
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  listings: Listing[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-card-hover p-2.5 text-xs">
        <p className="font-700 text-foreground">{payload[0].payload.brand}</p>
        <p className="text-muted-foreground mt-1">
          <span className="font-mono font-700 text-primary">
            {toFa(payload[0].value)}
          </span>{" "}
          آگهی
        </p>
      </div>
    );
  }
  return null;
};

export default function BrandVolumeChart({ listings }: Props) {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of listings) {
      const persianBrand = brandFa[l.brand] ?? l.brand;
      counts.set(persianBrand, (counts.get(persianBrand) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([brand, count]) => ({ brand, listings: count }))
      .sort((a, b) => b.listings - a.listings)
      .slice(0, 10);
  }, [listings]);

  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 0, left: -24, bottom: 0 }}
        barSize={12}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="brand"
          tick={{ fill: "#94A3B8", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#94A3B8", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => toFa(v)}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "var(--muted)" }}
        />
        <Bar
          dataKey="listings"
          fill="var(--primary)"
          radius={[3, 3, 0, 0]}
          opacity={0.85}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
