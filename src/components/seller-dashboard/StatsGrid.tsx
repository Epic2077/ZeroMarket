import { sellerStats } from "@/context/sellerDashboard";
import { ArrowDown, ArrowUp } from "lucide-react";

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {sellerStats.map((stat) => (
        <div key={stat.id} className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              {stat.icon}
            </div>
            <span
              className={`flex items-center gap-0.5 text-xs font-700 ${stat.up ? "text-success" : "text-danger"}`}
            >
              {stat.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
              {stat.change}
            </span>
          </div>
          <div className="stat-value text-2xl">{stat.value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
