"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { toFa } from "@/context/carLabels";

interface Props {
  data: { name: string; price: number; color: string }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-xl shadow-lg p-3 text-xs">
        <p className="font-700 text-foreground mb-1">{d.name}</p>
        <span className="font-mono text-primary">
          {toFa(Math.round(d.price).toLocaleString("en-US"))} تومان
        </span>
      </div>
    );
  }
  return null;
};

export default function InsightChart({ data }: Props) {
  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={60}
          tickFormatter={(v) => {
            if (v >= 1_000_000_000)
              return toFa((v / 1_000_000_000).toFixed(1)) + "B";
            return toFa(Math.round(v / 1_000_000)) + "M";
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="price" radius={[8, 8, 0, 0]} maxBarSize={80}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
