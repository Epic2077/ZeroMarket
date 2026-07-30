"use client";

import { roleLabel, ROLE_ORDER } from "@/context/adminData";
import type { AdminUserRow } from "@/types/admin";
import { useSession } from "@/context/SessionProvider";
import {
  ArrowRight,
  Ban,
  BarChart3,
  CheckCircle2,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Send,
  ShieldHalf,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { startTransition, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "./ConfirmDialog";
import ProfileFormModal from "./ProfileFormModal";
import RoleBadge from "./RoleBadge";
import VerifiedBadge from "../shared/VerifiedBadeg";
import Avatar from "../shared/Avatar";

interface Props {
  userId: string;
}

const faNum = (n: number) => n.toLocaleString("fa-IR");
const faPct = (n: number) => `${faNum(n)}٪`;

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("");
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

export default function UserManageView({ userId }: Props) {
  const { role: viewerRole } = useSession();
  const [user, setUser] = useState<AdminUserRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [editProfile, setEditProfile] = useState(false);

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
  }, [fetchUser]);

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

  const metrics = [
    {
      icon: <ShoppingBag size={16} className="text-primary" />,
      label: "کل محصولات",
      value: "—",
    },
    {
      icon: <CheckCircle2 size={16} className="text-success" />,
      label: "محصول فعال",
      value: "—",
    },
    {
      icon: <Send size={16} className="text-accent" />,
      label: "درخواست‌ها",
      value: "—",
    },
    {
      icon: <Eye size={16} className="text-warning" />,
      label: "بازدید کل",
      value: faNum(totalViews),
    },
  ];

  const bars = [
    {
      label: "نرخ پاسخ",
      value: responseRate,
      color: "bg-success",
    },
    {
      label: "نرخ تبدیل",
      value: 0,
      color: "bg-primary",
    },
  ];

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
      <div className="card-elevated p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white font-800 text-xl shrink-0">
              <Avatar
                src={user.avatar_path}
                name={user.full_name}
                size="w-16 h-16"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-800 text-foreground">
                  {user.full_name}
                </h1>
                <RoleBadge role={user.role} />
                {user.status === "SUSPENDED" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-danger/20 bg-danger/10 text-danger text-2xs font-700">
                    <Ban size={11} />
                    معلق
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                عضو از {formatDate(user.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditProfile(true)}
            className="btn-secondary text-sm self-start"
          >
            <Pencil size={14} />
            ویرایش پروفایل
          </button>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail size={15} className="text-primary shrink-0" />
            <span className="truncate" dir="ltr">
              {user.email}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone size={15} className="text-primary shrink-0" />
            {user.phone ?? "—"}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={15} className="text-primary shrink-0" />
            {user.city ?? "—"}
          </div>
        </div>
      </div>

      {/* Two-column: analytics + management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="card-elevated p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-primary" />
              <h2 className="text-sm font-700 text-foreground">تحلیل‌ها</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {metrics.map((m) => (
                <div key={m.label} className="bg-muted rounded-xl p-3">
                  <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center mb-2">
                    {m.icon}
                  </div>
                  <div className="stat-value text-xl">{m.value}</div>
                  <div className="text-2xs text-muted-foreground mt-0.5">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {bars.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{b.label}</span>
                    <span className="font-700 text-foreground">
                      {faPct(b.value)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${b.color}`}
                      style={{ width: `${b.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between bg-foreground rounded-xl px-4 py-3 text-white">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <TrendingUp size={14} />
                حجم فروش
              </span>
              <span className="text-price text-lg">
                {salesVolume.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          </div>

          {/* Products — placeholder until backend endpoint is ready */}
          <div className="card-elevated p-6">
            <p className="text-sm text-muted-foreground text-center py-8">
              مدیریت آگهی‌ها به‌زودی در دسترس خواهد بود
            </p>
          </div>
        </div>

        {/* Management (1/3) */}
        <div className="flex flex-col gap-6">
          {canManageRoles ? (
            <div className="card-elevated p-5">
              <h2 className="text-sm font-700 text-foreground mb-3">
                مدیریت نقش
              </h2>
              <div className="flex flex-col gap-2">
                {ROLE_ORDER.map((role) => {
                  const isCurrent = user.role === role;
                  return (
                    <button
                      key={role}
                      onClick={async () => {
                        if (isCurrent) return;
                        const ok = await updateUser({ role });
                        if (ok)
                          toast.success(
                            `نقش به «${roleLabel[role]}» تغییر کرد`,
                          );
                      }}
                      disabled={isCurrent}
                      className={`w-full text-right px-3 py-2 rounded-lg text-xs font-700 border transition-colors duration-150 ${
                        isCurrent
                          ? "bg-primary/10 border-primary/30 text-primary cursor-default"
                          : "bg-card border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {isCurrent
                        ? `نقش فعلی: ${roleLabel[role]}`
                        : `تبدیل به ${roleLabel[role]}`}
                    </button>
                  );
                })}
              </div>

              <h2 className="text-sm font-700 text-foreground mt-5 mb-3">
                وضعیت و دسترسی
              </h2>
              <div className="flex flex-col gap-2">
                <button
                  onClick={async () => {
                    const ok = await updateUser({ role: "ADMIN" });
                    if (ok)
                      toast.success(
                        `«${user.full_name}» به‌عنوان مدیر افزوده شد`,
                      );
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-700 bg-negotiable/10 border border-negotiable/25 text-negotiable hover:bg-negotiable/20 transition-colors duration-150"
                >
                  <ShieldHalf size={14} />
                  تبدیل به مدیر
                </button>
                {user.verified === false ? (
                  <button
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-700 bg-negotiable/10 border border-negotiable/25 text-negotiable hover:bg-negotiable/20 transition-colors duration-150"
                    onClick={async () => {
                      const ok = await updateUser({ verified: true });
                      if (ok)
                        toast.success(
                          `«${user.full_name}» به کاربر نایید شده تغییر یافت`,
                        );
                    }}
                  >
                    <VerifiedBadge />
                    تایید کردن کاربر
                  </button>
                ) : (
                  <button
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-700 bg-danger/10 border border-negotiable/25 text-danger hover:bg-negotiable/20 transition-colors duration-150"
                    onClick={async () => {
                      const ok = await updateUser({ verified: true });
                      if (ok)
                        toast.success(
                          `«${user.full_name}» به کاربر نایید نشده تغییر یافت`,
                        );
                    }}
                  >
                    <VerifiedBadge className="text-red" />
                    برداشتن تایید کاربر
                  </button>
                )}
                {user.status === "ACTIVE" ? (
                  <button
                    onClick={() => setConfirmSuspend(true)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-700 bg-danger/10 border border-danger/25 text-danger hover:bg-danger/20 transition-colors duration-150"
                  >
                    <Ban size={14} />
                    تعلیق حساب
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      const ok = await updateUser({ status: "ACTIVE" });
                      if (ok) toast.success("حساب فعال شد");
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-700 bg-success/10 border border-success/25 text-success hover:bg-success/20 transition-colors duration-150"
                  >
                    <CheckCircle2 size={14} />
                    فعال‌سازی حساب
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {user.verified === false ? (
                <button
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-700 bg-negotiable/10 border border-negotiable/25 text-negotiable hover:bg-negotiable/20 transition-colors duration-150"
                  onClick={async () => {
                    const ok = await updateUser({ verified: true });
                    if (ok)
                      toast.success(
                        `«${user.full_name}» به کاربر نایید شده تغییر یافت`,
                      );
                  }}
                >
                  <VerifiedBadge />
                  تایید کردن کاربر
                </button>
              ) : (
                <button
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-700 bg-negotiable/10 border border-negotiable/25 text-negotiable hover:bg-negotiable/20 transition-colors duration-150"
                  onClick={async () => {
                    const ok = await updateUser({ verified: true });
                    if (ok)
                      toast.success(
                        `«${user.full_name}» به کاربر نایید نشده تغییر یافت`,
                      );
                  }}
                >
                  <VerifiedBadge />
                  برداشتن تایید کاربر
                </button>
              )}
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
