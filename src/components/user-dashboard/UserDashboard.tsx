"use client";

import { useState } from "react";
import type { UserDashboardTabId } from "@/context/userProfile";
import MyRequestsTab from "./MyRequestsTab";
import PriceAlertsTab from "./PriceAlertsTab";
import SavedListingsTab from "./SavedListingsTab";
import UserDashboardHeader from "./UserDashboardHeader";
import UserDashboardTabs from "./UserDashboardTabs";
import UserStatsGrid from "./UserStatsGrid";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<UserDashboardTabId>("saved");

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      <UserDashboardHeader />
      <UserStatsGrid />
      <UserDashboardTabs active={activeTab} onChange={setActiveTab} />

      {activeTab === "saved" && <SavedListingsTab />}
      {activeTab === "requests" && <MyRequestsTab />}
      {activeTab === "alerts" && <PriceAlertsTab />}
    </div>
  );
}
