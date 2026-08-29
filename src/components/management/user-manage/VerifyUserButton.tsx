"use client";

import VerifiedBadge from "../../shared/VerifiedBadeg";
import type { AdminUserRow } from "@/types/admin";
import { toast } from "sonner";

interface Props {
  user: AdminUserRow;
  onUpdate: (updates: { verified: boolean }) => Promise<boolean>;
}

export function VerifyUserButton({ user, onUpdate }: Props) {
  console.log("[VerifyUserButton] user received:", user, "verified:", user?.verified, "type:", typeof user?.verified);
  const handleClick = async () => {
    const verify = user.verified === false;
    const ok = await onUpdate({ verified: verify });
    if (ok)
      toast.success(
        verify
          ? `«${user.full_name}» به کاربر تایید شده تغییر یافت`
          : `«${user.full_name}» به کاربر تایید نشده تغییر یافت`,
      );
  };

  return (
    <button
      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-700 bg-negotiable/10 border border-negotiable/25 text-negotiable hover:bg-negotiable/20 transition-colors duration-150"
      onClick={handleClick}
    >
      {user.verified && <VerifiedBadge />}
      {user.verified === false ? "تایید کردن کاربر" : "برداشتن تایید کاربر"}
    </button>
  );
}
