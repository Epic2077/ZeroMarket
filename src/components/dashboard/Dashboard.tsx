"use client";

import { useEffect, useState } from "react";
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

export default function Dashboard() {
  const { profile } = useUserInfo();
  const { seller } = useSeller(profile?.id ?? "");
  const [activeTab, setActiveTab] = useState<DashTabId>("overview");
  const [showBulkImport, setShowBulkImport] = useState(false);
  const isSeller = seller !== null;

  useEffect(() => {
    const selectNotificationTab = () => {
      if (window.location.hash === "#notif") setActiveTab("notifications");
    };

    selectNotificationTab();
    window.addEventListener("hashchange", selectNotificationTab);
    return () => window.removeEventListener("hashchange", selectNotificationTab);
  }, []);

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
