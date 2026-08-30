"use client";

import { profileTabs, type ProfileTabId } from "@/context/userProfile";
import { useUserInfo } from "@/context/UserInfoProvider";
import { useMemo, useState } from "react";
import BannerSettings from "./BannerSettings";
import BecomeSellerForm from "./BecomeSellerForm";
import NotificationSettings from "./NotificationSettings";
import PersonalInfoForm from "./PersonalInfoForm";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import SecurityForm from "./SecurityForm";

export default function UserProfile() {
  const { profile } = useUserInfo();
  const [activeTab, setActiveTab] = useState<ProfileTabId>("personal");

  const appStatus = profile?.seller_application_status ?? "NONE";

  // The "become a seller" tab is only relevant while the account is still a
  // regular user (or has a pending/just-submitted application).
  const visibleTabs = useMemo(
    () =>
      profile?.verified === true
        ? profileTabs.filter((tab) => tab.id !== "seller")
        : profileTabs,
    [profile?.verified],
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      <ProfileHeader appStatus={appStatus} />
      <ProfileTabs
        tabs={visibleTabs}
        active={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-6">
        {activeTab === "personal" && (
          <div className="flex flex-col gap-6">
            <PersonalInfoForm />
            <BannerSettings />
          </div>
        )}
        {activeTab === "security" && <SecurityForm />}
        {activeTab === "notifications" && <NotificationSettings />}
        {activeTab === "seller" && <BecomeSellerForm status={appStatus} />}
      </div>
    </div>
  );
}
