"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Cell,
  ReferenceLine,
} from "recharts";
import { toFa } from "@/context/carLabels";

interface ScatterListing {
  id: string;
  price: number;
  seller: string;
  status: string;
  city: string;
}

interface Props {
  listings: ScatterListing[];
  marketAvg: number;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#10B981",
  negotiable: "#8B5CF6",
  reserved: "#3B82F6",
  pending: "#F59E0B",
  sold: "#EF4444",
};

const STATUS_LABELS: Record<string, string> = {
  active: "موجود",
  negotiable: "قابل مذاکره",
  reserved: "رزرو",
  pending: "در انتظار",
  sold: "فروخته",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-xl shadow-lg p-3 text-xs">
        <p className="font-700 text-foreground mb-1">{d.seller}</p>
        <p className="text-muted-foreground">
          قیمت:{" "}
          <span className="font-mono text-foreground">
            {toFa(d.price.toLocaleString("en-US"))} تومان
          </span>
        </p>
        <p className="text-muted-foreground">
          شهر: {d.city} ·{" "}
          <span style={{ color: STATUS_COLORS[d.status] }}>
            {STATUS_LABELS[d.status] ?? d.status}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function PriceScatter({ listings, marketAvg }: Props) {
  const data = listings.map((l, i) => ({
    ...l,
    x: i,
    y: l.price,
    z: 30,
  }));

  const minPrice = Math.min(...listings.map((l) => l.price));
  const maxPrice = Math.max(...listings.map((l) => l.price));
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="x" hide />
        <YAxis
          domain={[minPrice - padding, maxPrice + padding]}
          tick={{ fill: "#64748B", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={80}
          tickFormatter={(v) => {
            if (v >= 1_000_000_000)
              return toFa((v / 1_000_000_000).toFixed(1)) + "B";
            return toFa(Math.round(v / 1_000_000)) + "M";
          }}
        />
        <ZAxis dataKey="z" range={[40, 40]} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={marketAvg}
          stroke="#1B4FD8"
          strokeDasharray="6 3"
          strokeWidth={2}
          label={{
            value: "میانگین بازار",
            position: "right",
            fill: "#1B4FD8",
            fontSize: 11,
          }}
        />
        <Scatter data={data}>
          {data.map((entry) => (
            <Cell
              key={entry.id}
              fill={STATUS_COLORS[entry.status] ?? "#94A3B8"}
              fillOpacity={0.7}
              stroke={STATUS_COLORS[entry.status] ?? "#94A3B8"}
              strokeWidth={1}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
