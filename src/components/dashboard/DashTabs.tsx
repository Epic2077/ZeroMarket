import { useUserInfo } from "@/context/UserInfoProvider";
import { supabase } from "@/lib/supabase/client";
import { Store } from "lucide-react";
import { useEffect, useState } from "react";

export type DashTabId =
  | "overview"
  | "saved"
  | "userRequests"
  | "vehicleRequests"
  | "notifications"
  | "alerts"
  | "listings"
  | "sellerRequests"
  | "analytics";

type DashTab = { id: DashTabId; label: string; group: "user" | "seller" };

const userTabs: DashTab[] = [
  { id: "overview", label: "خلاصه داشبورد", group: "user" },
  { id: "notifications", label: "اعلان‌ها", group: "user" },
  { id: "saved", label: "آگهی‌های ذخیره‌شده", group: "user" },
  { id: "userRequests", label: "درخواست‌های من", group: "user" },
  { id: "vehicleRequests", label: "ثبت نام های خودرو", group: "user" },
  { id: "alerts", label: "هشدارهای قیمت", group: "user" },
];

const sellerTabs: DashTab[] = [
  { id: "listings", label: "آگهی‌های من", group: "seller" },
  { id: "sellerRequests", label: "درخواست‌های فروش", group: "seller" },
  { id: "analytics", label: "تحلیل‌ها", group: "seller" },
];

interface Props {
  active: DashTabId;
  onChange: (tab: DashTabId) => void;
  isSeller: boolean;
}

export default function DashTabs({ active, onChange, isSeller }: Props) {
  const { user } = useUserInfo();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    supabase
      .from("user_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_unread", true)
      .then(({ count, error }: { count: number | null; error: unknown }) => {
        if (!error && count != null) setUnreadCount(count);
      });
  }, [user?.id]);

  const tabs = isSeller
    ? [...userTabs.slice(0, 1), ...userTabs.slice(1), ...sellerTabs]
    : userTabs;

  return (
    <div className="mb-6 -mx-4 px-4 overflow-x-auto overscroll-x-contain scrollbar-none sm:mx-0 sm:px-0 sm:overflow-x-visible">
      <div className="flex w-max items-center gap-1 border-b border-border sm:w-auto sm:flex-wrap">
        {tabs.map((tab, index) => {
          const isSellerTab = tab.group === "seller";
          const startsSellerGroup =
            isSellerTab && tabs[index - 1]?.group !== "seller";

          return (
            <div key={tab.id} className="contents">
              {startsSellerGroup && (
                <div className="flex items-center gap-2 self-stretch px-2 text-2xs font-700 text-success">
                  <span className="h-5 w-px bg-success/30" />
                  <span className="inline-flex items-center gap-1 whitespace-nowrap">
                    <Store size={12} />
                    معامله
                  </span>
                </div>
              )}
              <button
                onClick={() => onChange(tab.id)}
                className={`relative shrink-0 whitespace-nowrap px-3.5 py-2.5 text-xs font-600 transition-colors duration-150 border-b-2 -mb-px sm:text-sm sm:px-4 ${
                  active === tab.id
                    ? isSellerTab
                      ? "border-success text-success"
                      : "border-primary text-primary"
                    : isSellerTab
                      ? "border-transparent text-muted-foreground hover:text-success"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.id === "notifications" && unreadCount > 0 && (
                  <span className="absolute -top-0.5 -left-0.5 inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-700 text-white bg-danger rounded-full">
                    {unreadCount}
                  </span>
                )}
                {tab.label}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
