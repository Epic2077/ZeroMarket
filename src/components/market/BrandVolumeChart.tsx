"use client";
import { brandVolumeData } from "@/context/data";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-card-hover p-2.5 text-xs">
        <p className="font-700 text-foreground">{label}</p>
        <p className="text-muted-foreground mt-1">
          <span className="font-mono font-700 text-primary">
            {payload[0].value}
          </span>{" "}
          listings
        </p>
      </div>
    );
  }
  return null;
};

export default function BrandVolumeChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart
        data={brandVolumeData}
        margin={{ top: 4, right: 0, left: -24, bottom: 0 }}
        barSize={10}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="brand"
          tick={{ fill: "#94A3B8", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#94A3B8", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
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
