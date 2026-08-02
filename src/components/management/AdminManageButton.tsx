"use client";

import { useAdmin } from "@/context/AdminProvider";
import { useSession } from "@/context/SessionProvider";
import { ShieldHalf } from "lucide-react";
import Link from "next/link";

interface Props {
  // The managed-user id to jump to (e.g. `usr-aria-motors`).
  userId: string;
  label?: string;
  className?: string;
}

// Shown on public pages (seller profile, listing detail, user profile) when the
// viewer is acting as owner or as an admin who manages this user. Deep-links to
// the management page for fast edits.
export default function AdminManageButton({
  userId,
  label = "مدیریت ادمین",
  className = "",
}: Props) {
  const { role, adminId } = useSession();
  const { users, admins } = useAdmin();

  if (role === "user") return null;
  if (!users.some((u) => u.id === userId)) return null;

  if (role === "admin") {
    const me = admins.find((a) => a.id === adminId);
    if (!me?.assignedUserIds.includes(userId)) return null;
  }

  return (
    <Link
      href={`/dashboard/manage/users/${userId}`}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-700 bg-negotiable/10 border border-negotiable/25 text-negotiable hover:bg-negotiable/20 transition-colors duration-150 ${className}`}
    >
      <ShieldHalf size={14} />
      {label}
    </Link>
  );
}
