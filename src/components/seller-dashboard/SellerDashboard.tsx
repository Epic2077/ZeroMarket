"use client";

import { useState } from "react";
import type { DashboardTabId } from "@/context/sellerDashboard";
import AnalyticsTab from "./AnalyticsTab";
import BulkImportModal from "./BulkImportModal";
import DashboardHeader from "./DashboardHeader";
import DashboardTabs from "./DashboardTabs";
import ListingsTab from "./ListingsTab";
import OverviewTab from "./OverviewTab";
import RequestsTab from "./RequestsTab";
import StatsGrid from "./StatsGrid";

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTabId>("summary");
  const [showBulkImport, setShowBulkImport] = useState(false);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      <DashboardHeader onBulkImport={() => setShowBulkImport(true)} />
      <StatsGrid />
      <DashboardTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "summary" && (
        <OverviewTab
          onViewAllRequests={() => setActiveTab("requests")}
          onBulkImport={() => setShowBulkImport(true)}
        />
      )}
      {activeTab === "listings" && <ListingsTab />}
      {activeTab === "requests" && <RequestsTab />}
      {activeTab === "analytics" && <AnalyticsTab />}

      {showBulkImport && <BulkImportModal onClose={() => setShowBulkImport(false)} />}
    </div>
  );
}
