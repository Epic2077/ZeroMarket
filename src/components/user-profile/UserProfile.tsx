"use client";

import {
  currentUser,
  profileTabs,
  type ProfileTabId,
} from "@/context/userProfile";
import type { SellerApplicationStatus } from "@/types/user";
import { useMemo, useState } from "react";
import BecomeSellerForm from "./BecomeSellerForm";
import NotificationSettings from "./NotificationSettings";
import PersonalInfoForm from "./PersonalInfoForm";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import SecurityForm from "./SecurityForm";

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState<ProfileTabId>("personal");
  const [appStatus, setAppStatus] = useState<SellerApplicationStatus>(
    currentUser.sellerApplicationStatus,
  );

  // The "become a seller" tab is only relevant while the account is still a
  // regular user (or has a pending/just-submitted application).
  const visibleTabs = useMemo(
    () =>
      currentUser.role === "seller"
        ? profileTabs.filter((tab) => tab.id !== "seller")
        : profileTabs,
    [],
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      <ProfileHeader appStatus={appStatus} />
      <ProfileTabs tabs={visibleTabs} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === "personal" && <PersonalInfoForm />}
        {activeTab === "security" && <SecurityForm />}
        {activeTab === "notifications" && <NotificationSettings />}
        {activeTab === "seller" && (
          <BecomeSellerForm
            status={appStatus}
            onSubmitted={() => setAppStatus("pending")}
          />
        )}
      </div>
    </div>
  );
}
