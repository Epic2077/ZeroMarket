"use client";

import { useUserInfo } from "@/context/UserInfoProvider";
import {
  isListingSaved,
  saveListing,
  unsaveListing,
} from "@/lib/supabase/wishlist";
import { Heart } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  listingId: string;
  /** Optional className overrides for the button. */
  className?: string;
  /** Icon size in pixels. */
  size?: number;
  /** Optional title text for the tooltip. */
  title?: string;
}

// Reusable optimistic save/unsave toggle backed by `wishlist_items`.
export default function SaveListingButton({
  listingId,
  className,
  size = 15,
  title,
}: Props) {
  const { user } = useUserInfo();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);

  // Check initial state on mount.
  useEffect(() => {
    if (!user?.id || !listingId) return;
    let cancelled = false;
    isListingSaved(user.id, listingId)
      .then((result) => {
        if (!cancelled) setSaved(result);
      })
      .catch(() => {})
      .finally(() => {
        initialized.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, listingId]);

  const toggle = useCallback(async () => {
    if (!user?.id || !listingId) {
      toast.error("ابتدا وارد حساب کاربری خود شوید");
      return;
    }
    if (loading) return;

    // Optimistic update — flip immediately.
    const next = !saved;
    setSaved(next);
    setLoading(true);

    try {
      if (next) {
        await saveListing(user.id, listingId);
        toast.success("به آگهی‌های ذخیره‌شده اضافه شد");
      } else {
        await unsaveListing(user.id, listingId);
        toast.success("از آگهی‌های ذخیره‌شده حذف شد");
      }
    } catch (err) {
      // Roll back on error.
      setSaved(!next);
      toast.error(err instanceof Error ? err.message : "خطا در ذخیره آگهی");
    } finally {
      setLoading(false);
    }
  }, [user?.id, listingId, saved, loading]);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle();
      }}
      disabled={loading}
      aria-pressed={saved}
      title={title ?? (saved ? "حذف از ذخیره‌شده‌ها" : "ذخیره این آگهی")}
      className={
        className ??
        `p-2 rounded-lg border transition-colors duration-150 ${
          saved
            ? "border-danger/30 bg-danger/8 text-danger"
            : "border-border text-muted-foreground hover:bg-muted"
        }`
      }
    >
      <Heart size={size} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
