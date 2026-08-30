import { dashboardTabs, type DashboardTabId } from "@/context/sellerDashboard";
import { useUserInfo } from "@/context/UserInfoProvider";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface Props {
  active: DashboardTabId;
  onChange: (tab: DashboardTabId) => void;
}

export default function DashboardTabs({ active, onChange }: Props) {
  const { user } = useUserInfo();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    supabase
      .from("user_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_unread", true)
      .then(({ count, error }: { count: number | null; error: any }) => {
        if (!error && count != null) setUnreadCount(count);
      });
  }, [user?.id]);

  return (
    <div className="flex items-center gap-1 border-b border-border mb-6">
      {dashboardTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2.5 text-sm font-600 transition-colors duration-150 border-b-2 -mb-px ${
            active === tab.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.id === "summary" && unreadCount > 0 && (
            <span className="absolute -top-0.5 -left-0.5 inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-700 text-white bg-danger rounded-full">
              {unreadCount}
            </span>
          )}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
