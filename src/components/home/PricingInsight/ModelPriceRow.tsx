import { topModels } from "@/context/priceInsight";

export default function ModelPriceRow() {
  return (
    <div className="flex flex-col gap-3 mb-6" dir="rtl">
      {topModels?.map((m) => (
        <div
          key={m?.id}
          className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/25 cursor-pointer"
        >
          <div>
            <div className="text-sm font-600 text-white">{m?.brand}</div>
            <div className="flex gap-3 mt-1">
              <span className="text-2xs text-slate-400">
                میانگین خرید:{" "}
                <span className="font-mono text-slate-300">{m?.avgBuy}</span>
              </span>
              <span className="text-2xs text-slate-400">
                میانگین فروش:{" "}
                <span className="font-mono text-slate-300">{m?.avgSell}</span>
              </span>
            </div>
          </div>
          <span
            className={`text-xs font-700 ${m?.positive ? "text-success" : "text-danger"}`}
          >
            {m?.trend}
          </span>
        </div>
      ))}
    </div>
  );
}
