"use client";

import { useState } from "react";
import { useUserInfo } from "@/context/UserInfoProvider";
import { useSeller } from "@/hooks/useSellers";
import AnalyticsTab from "../seller-dashboard/AnalyticsTab";
import BulkImportModal from "../seller-dashboard/BulkImportModal";
import ListingsTab from "../seller-dashboard/ListingsTab";
import RequestsTab from "../seller-dashboard/RequestsTab";
import StatsGrid from "../seller-dashboard/StatsGrid";
import NotificationsTab from "../user-dashboard/NotificationsTab";
import MyRequestsTab from "../user-dashboard/MyRequestsTab";
import MyVehicleRequestsTab from "../user-dashboard/MyVehicleRequestsTab";
import PriceAlertsTab from "../user-dashboard/PriceAlertsTab";
import SavedListingsTab from "../user-dashboard/SavedListingsTab";
import UserStatsGrid from "../user-dashboard/UserStatsGrid";
import DashHeader from "./DashHeader";
import DashTabs, { type DashTabId } from "./DashTabs";
import { useHashTab } from "@/hooks/useHashTab";

const DASH_TAB_IDS: DashTabId[] = [
  "overview",
  "saved",
  "userRequests",
  "vehicleRequests",
  "notifications",
  "alerts",
  "listings",
  "sellerRequests",
  "analytics",
];

// Legacy deep link (`/dashboard/user#notif`) still opens the notifications tab.
const DASH_TAB_ALIASES: Record<string, DashTabId> = {
  notif: "notifications",
};

export default function Dashboard() {
  const { profile } = useUserInfo();
  const { seller } = useSeller(profile?.id ?? "");
  const [activeTab, setActiveTab] = useHashTab<DashTabId>(
    "overview",
    DASH_TAB_IDS,
    DASH_TAB_ALIASES,
  );
  const [showBulkImport, setShowBulkImport] = useState(false);
  const isSeller = seller !== null;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      <DashHeader onBulkImport={() => setShowBulkImport(true)} />
      <DashTabs
        active={activeTab}
        onChange={setActiveTab}
        isSeller={isSeller}
      />

      {activeTab === "overview" && (
        <>
          {isSeller && <StatsGrid />}
          <UserStatsGrid />
        </>
      )}
      {activeTab === "saved" && <SavedListingsTab />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "userRequests" && <MyRequestsTab />}
      {activeTab === "vehicleRequests" && <MyVehicleRequestsTab />}
      {activeTab === "alerts" && <PriceAlertsTab />}
      {isSeller && activeTab === "listings" && <ListingsTab />}
      {isSeller && activeTab === "sellerRequests" && <RequestsTab />}
      {isSeller && activeTab === "analytics" && <AnalyticsTab />}

      {isSeller && showBulkImport && (
        <BulkImportModal onClose={() => setShowBulkImport(false)} />
      )}
    </div>
  );
}
