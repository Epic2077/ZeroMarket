"use client";

import { useUserInfo } from "@/context/UserInfoProvider";
import { useUserStats } from "@/hooks/useUserStats";
import { ArrowDown, ArrowUp } from "lucide-react";

export default function UserStatsGrid() {
  const { user } = useUserInfo();
  const { stats, loading } = useUserStats(user?.id);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card-elevated p-5 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-muted" />
              <div className="w-10 h-4 rounded bg-muted" />
            </div>
            <div className="w-12 h-7 rounded bg-muted mb-1" />
            <div className="w-24 h-3 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.id} className="card-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              {stat.icon}
            </div>
            {stat.change && (
              <span
                className={`flex items-center gap-0.5 text-xs font-700 ${stat.up ? "text-success" : "text-danger"}`}
              >
                {stat.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                {stat.change}
              </span>
            )}
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
