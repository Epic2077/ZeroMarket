import { supabase } from "./client";

export type NotificationKind = "REQUEST" | "PRICE" | "SAVED" | "SYSTEM";

export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  description: string;
  kind: NotificationKind;
  is_unread: boolean;
  href: string | null;
  action_label: string | null;
  created_at: string;
}

/** Fetch current user's unread notifications. */
export async function getUnreadNotifications(): Promise<UserNotification[]> {
  const { data, error } = await supabase
    .from("user_notifications")
    .select("id, title, description, kind, href, action_label, created_at, is_unread")
    .eq("is_unread", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as UserNotification[];
}

/** Fetch all notifications for current user (including read). */
export async function getAllNotifications(limit = 50): Promise<UserNotification[]> {
  const { data, error } = await supabase
    .from("user_notifications")
    .select("id, title, description, kind, href, action_label, created_at, is_unread")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as UserNotification[];
}

/** Mark a notification as read. */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("user_notifications")
    .update({ is_unread: false })
    .eq("id", notificationId);

  if (error) throw error;
}

/** Mark all notifications as read for current user. */
export async function markAllNotificationsAsRead(): Promise<void> {
  const { error } = await supabase
    .from("user_notifications")
    .update({ is_unread: false })
    .eq("is_unread", true);

  if (error) throw error;
}

/** Get unread count for current user. */
export async function getUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from("user_notifications")
    .select("*", { count: "exact", head: true })
    .eq("is_unread", true);

  if (error) throw error;
  return count ?? 0;
}