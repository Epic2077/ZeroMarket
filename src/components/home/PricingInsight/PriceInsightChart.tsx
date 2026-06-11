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
  Legend,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-card-hover p-3 text-xs">
        <p className="font-700 text-foreground mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div
            key={`tooltip-${entry.dataKey}`}
            className="flex items-center justify-between gap-4 mb-1"
          >
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </span>
            <span className="font-mono font-700 text-foreground">
              {entry.value}0M ﷼
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function PriceInsightChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        data={priceChartData}
        margin={{ top: 5, right: 5, left: -10, bottom: 0 }}
      >
        <defs>
          <linearGradient id="camryGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1B4FD8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1B4FD8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="tucsonGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="sportageGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={["dataMin - 40", "dataMax + 40"]}
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            fontSize: "11px",
            color: "#94A3B8",
            paddingTop: "8px",
          }}
          formatter={(value) => (
            <span style={{ color: "#94A3B8" }}>{value}</span>
          )}
        />
        <Area
          type="monotone"
          dataKey="camry"
          name="Toyota Camry"
          stroke="#1B4FD8"
          strokeWidth={2}
          fill="url(#camryGrad)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="tucson"
          name="Hyundai Tucson"
          stroke="#0EA5E9"
          strokeWidth={2}
          fill="url(#tucsonGrad)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="sportage"
          name="Kia Sportage"
          stroke="#10B981"
          strokeWidth={2}
          fill="url(#sportageGrad)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
