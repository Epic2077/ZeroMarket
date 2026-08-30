"use client";

import type { AdminUserRow } from "@/types/admin";
import { useSession } from "@/context/SessionProvider";
import { supabase } from "@/lib/supabase/client";
import { listingRowToListing, type ListingRow } from "@/lib/supabase/listings";
import type { Listing } from "@/types/dataTypes";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import ConfirmDialog from "./ConfirmDialog";
import ProfileFormModal from "./ProfileFormModal";
import { UserHeroCard } from "./user-manage/UserHeroCard";
import { UserAnalyticsCard } from "./user-manage/UserAnalyticsCard";
import { UserListingsCard } from "./user-manage/UserListingsCard";
import { UserRolePanel } from "./user-manage/UserRolePanel";
import { VerifyUserButton } from "./user-manage/VerifyUserButton";
import { formatDate, initials } from "./user-manage/utils";

interface Props {
  userId: string;
}

export default function UserManageView({ userId }: Props) {
  const { role: viewerRole } = useSession();
  const [user, setUser] = useState<AdminUserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [editProfile, setEditProfile] = useState(false);

  // ── Listings ─────────────────────────────────────────────────────────
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  const fetchListings = useCallback(async () => {
    setListingsLoading(true);
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setListings(
        (data as ListingRow[]).map((row) => listingRowToListing(row)),
      );
    }
    setListingsLoading(false);
  }, [userId]);

  const backHref =
    viewerRole === "admin" ? "/dashboard/admin" : "/dashboard/owner";

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      startTransition(() => setUser(data.user ?? null));
    } catch (err) {
      startTransition(() => {
        setError(err instanceof Error ? err.message : "Unknown error");
        setUser(null);
      });
    } finally {
      startTransition(() => setLoading(false));
    }
  }, [userId]);

  useEffect(() => {
    void fetchUser();
    void fetchListings();
  }, [fetchUser, fetchListings]);

  // ── Derived values (must stay above any early return) ────────────────
  const activeCount = useMemo(
    () =>
      listings.filter((l) => l.status === "active" || l.status === "negotiable")
        .length,
    [listings],
  );

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-16 text-center">
        <Loader2
          size={24}
          className="text-muted-foreground mx-auto mb-3 animate-spin"
        />
        <p className="text-sm text-muted-foreground">در حال بارگذاری…</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          {error ? `خطا: ${error}` : "کاربر یافت نشد."}
        </p>
        <Link
          href={backHref}
          className="btn-secondary text-sm mt-4 inline-flex"
        >
          بازگشت
        </Link>
      </div>
    );
  }

  const canManageRoles = viewerRole === "owner";

  const updateUser = async (updates: {
    role?: string;
    status?: string;
    verified?: boolean;
  }) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      startTransition(() => setUser(data.user ?? null));
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در به‌روزرسانی");
      return false;
    }
  };

  const totalViews = user.total_views ?? 0;
  const responseRate =
    typeof user.response_rate === "string"
      ? Number(user.response_rate)
      : (user.response_rate ?? 0);
  const salesVolume =
    typeof user.total_sales_volume === "string"
      ? Number(user.total_sales_volume)
      : (user.total_sales_volume ?? 0);

  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-8 xl:px-10 py-8">
      {/* Back */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-xs font-600 text-muted-foreground hover:text-foreground transition-colors duration-150 mb-4"
      >
        <ArrowRight size={14} />
        بازگشت به پنل
      </Link>

      {/* Hero */}
      <UserHeroCard user={user} onEdit={() => setEditProfile(true)} />

      {/* Two-column: analytics + management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <UserAnalyticsCard
            totalListings={listings.length}
            activeCount={activeCount}
            totalViews={totalViews}
            responseRate={responseRate}
            salesVolume={salesVolume}
          />
          <UserListingsCard listings={listings} loading={listingsLoading} />
        </div>

        {/* Management (1/3) */}
        <div className="flex flex-col gap-6">
          {canManageRoles ? (
            <UserRolePanel
              user={user}
              onUpdate={updateUser}
              onSuspendRequest={() => setConfirmSuspend(true)}
            />
          ) : (
            <>
              <VerifyUserButton user={user} onUpdate={updateUser} />
              <div className="card-elevated p-5 text-xs text-muted-foreground leading-relaxed">
                شما به‌عنوان مدیر می‌توانید پروفایل و آگهی‌های این کاربر را
                ویرایش کنید. تغییر نقش، تعلیق حساب و مدیریت مدیران تنها در
                اختیار مالک است.
              </div>
            </>
          )}
        </div>
      </div>

      {editProfile && (
        <ProfileFormModal
          user={{
            id: user.id,
            name: user.full_name,
            email: user.email,
            phone: user.phone ?? "",
            city: user.city ?? "",
            avatar: initials(user.full_name),
            avatarPath: user.avatar_path,
            role: user.role,
            verified: user.verified,
            status: user.status,
            joinedAt: formatDate(user.created_at),
            analytics: {
              requests: 0,
              views: totalViews,
              salesVolume,
              responseRate,
              conversion: 0,
            },
          }}
          onAvatarChange={(avatarPath) => {
            startTransition(() =>
              setUser((prev) =>
                prev ? { ...prev, avatar_path: avatarPath } : prev,
              ),
            );
          }}
          onSubmit={async (input) => {
            try {
              const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  full_name: input.name,
                  email: input.email,
                  phone: input.phone,
                  city: input.city,
                }),
              });
              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error ?? `HTTP ${res.status}`);
              }
              const data = await res.json();
              startTransition(() => setUser(data.user ?? null));
              toast.success("پروفایل با موفقیت به‌روزرسانی شد");
            } catch (err) {
              toast.error(
                err instanceof Error ? err.message : "خطا در به‌روزرسانی",
              );
            }
            setEditProfile(false);
          }}
          onClose={() => setEditProfile(false)}
        />
      )}

      {confirmSuspend && (
        <ConfirmDialog
          title="تعلیق حساب کاربر"
          description={`«${user.full_name}» تا فعال‌سازی مجدد به آگهی‌ها و درخواست‌ها دسترسی نخواهد داشت.`}
          confirmLabel="تعلیق"
          onConfirm={async () => {
            const ok = await updateUser({ status: "SUSPENDED" });
            if (ok) toast.success("حساب معلق شد");
            setConfirmSuspend(false);
          }}
          onClose={() => setConfirmSuspend(false)}
        />
      )}
    </div>
  );
}
