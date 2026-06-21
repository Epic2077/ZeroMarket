"use client";

import { useState } from "react";
import type { DashboardTabId } from "@/context/sellerDashboard";
import AnalyticsTab from "./AnalyticsTab";
import BulkImportModal from "./BulkImportModal";
import DashboardHeader from "./DashboardHeader";
import DashboardTabs from "./DashboardTabs";
import ListingsTab from "./ListingsTab";
import NewPostModal from "./NewPostModal";
import OverviewTab from "./OverviewTab";
import RequestsTab from "./RequestsTab";
import StatsGrid from "./StatsGrid";

type ActiveModal = "none" | "newPost" | "bulkImport";

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTabId>("summary");
  const [modal, setModal] = useState<ActiveModal>("none");

  const closeModal = () => setModal("none");

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      <DashboardHeader
        onNewPost={() => setModal("newPost")}
        onBulkImport={() => setModal("bulkImport")}
      />
      <StatsGrid />
      <DashboardTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "summary" && (
        <OverviewTab
          onViewAllRequests={() => setActiveTab("requests")}
          onNewPost={() => setModal("newPost")}
          onBulkImport={() => setModal("bulkImport")}
        />
      )}
      {activeTab === "listings" && <ListingsTab />}
      {activeTab === "requests" && <RequestsTab />}
      {activeTab === "analytics" && <AnalyticsTab />}

      {modal === "newPost" && <NewPostModal onClose={closeModal} />}
      {modal === "bulkImport" && <BulkImportModal onClose={closeModal} />}
    </div>
  );
}
