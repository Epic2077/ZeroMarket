import { analyticsCards } from "@/context/sellerDashboard";

export default function AnalyticsTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {analyticsCards.map((card) => (
        <div key={`analytics-${card.title}`} className="card-elevated p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              {card.icon}
            </div>
            <span className="text-xs font-700 text-success bg-success/10 px-2 py-0.5 rounded-full">
              {card.change}
            </span>
          </div>
          <div className="stat-value text-3xl mb-1">{card.value}</div>
          <div className="text-sm font-600 text-foreground">{card.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
