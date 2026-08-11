import { faNum, faPct } from "./utils";
import {
  BarChart3,
  CheckCircle2,
  Eye,
  Send,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

interface Props {
  totalListings: number;
  activeCount: number;
  totalViews: number;
  responseRate: number;
  salesVolume: number;
}

export function UserAnalyticsCard({
  totalListings,
  activeCount,
  totalViews,
  responseRate,
  salesVolume,
}: Props) {
  const metrics = [
    {
      icon: <ShoppingBag size={16} className="text-primary" />,
      label: "کل محصولات",
      value: faNum(totalListings),
    },
    {
      icon: <CheckCircle2 size={16} className="text-success" />,
      label: "محصول فعال",
      value: faNum(activeCount),
    },
    {
      icon: <Send size={16} className="text-accent" />,
      label: "درخواست‌ها",
      value: "—",
    },
    {
      icon: <Eye size={16} className="text-warning" />,
      label: "بازدید کل",
      value: faNum(totalViews),
    },
  ];

  const bars = [
    {
      label: "نرخ پاسخ",
      value: responseRate,
      color: "bg-success",
    },
    {
      label: "نرخ تبدیل",
      value: 0,
      color: "bg-primary",
    },
  ];

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={18} className="text-primary" />
        <h2 className="text-sm font-700 text-foreground">تحلیل‌ها</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {metrics.map((m) => (
          <div key={m.label} className="bg-muted rounded-xl p-3">
            <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center mb-2">
              {m.icon}
            </div>
            <div className="stat-value text-xl">{m.value}</div>
            <div className="text-2xs text-muted-foreground mt-0.5">
              {m.label}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{b.label}</span>
              <span className="font-700 text-foreground">{faPct(b.value)}</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${b.color}`}
                style={{ width: `${b.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between bg-foreground rounded-xl px-4 py-3 text-white">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <TrendingUp size={14} />
          حجم فروش
        </span>
        <span className="text-price text-lg">
          {salesVolume.toLocaleString("fa-IR")} تومان
        </span>
      </div>
    </div>
  );
}
