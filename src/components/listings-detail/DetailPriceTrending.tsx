"use client";
import { priceChartData } from "@/context/data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-card p-2 text-xs">
        <p className="font-700 text-foreground">{label}</p>
        <p className="font-mono font-700 text-primary mt-0.5">
          {payload[0].value}0M ﷼
        </p>
      </div>
    );
  }
  return null;
};

export default function DetailPriceTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={100}>
      <AreaChart
        data={priceChartData}
        margin={{ top: 2, right: 0, left: -30, bottom: 0 }}
      >
        <defs>
          <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1B4FD8" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#1B4FD8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: "#94A3B8", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#94A3B8", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="camry"
          stroke="var(--primary)"
          strokeWidth={1.5}
          fill="url(#detailGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
