"use client";

import { useUserInfo } from "@/context/UserInfoProvider";
import UserNotificationFeed from "@/components/shared/UserNotificationFeed";

export default function NotificationsTab() {
  const { user } = useUserInfo();
  if (!user?.id) return null;
  return <UserNotificationFeed userId={user.id} />;
}
