"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { useAdmin } from "@/context/AdminProvider";
import { roleLabel } from "@/context/adminData";
import type { AdminAccount, PlatformRole, PlatformUser } from "@/types/admin";
import { Search, UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import RoleBadge from "../management/RoleBadge";

interface Props {
  admin: AdminAccount;
  users: PlatformUser[];
  onClose: () => void;
}

type RoleFilter = "all" | PlatformRole;

const roleFilters: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "USER", label: roleLabel.USER },
  { value: "ADMIN", label: roleLabel.ADMIN },
  { value: "OWNER", label: roleLabel.OWNER },
];

export default function AssignUsersModal({ admin, users, onClose }: Props) {
  const { assignUsers } = useAdmin();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Only users this admin doesn't already manage are assignable.
  const assignable = useMemo(
    () => users.filter((u) => !admin.assignedUserIds.includes(u.id)),
    [users, admin.assignedUserIds],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assignable.filter((u) => {
      if (role !== "all" && u.role !== role) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q)
      );
    });
  }, [assignable, query, role]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((u) => selected.has(u.id));

  const toggleAllFiltered = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) filtered.forEach((u) => next.delete(u.id));
      else filtered.forEach((u) => next.add(u.id));
      return next;
    });

  const handleAssign = () => {
    if (selected.size === 0) return;
    assignUsers(admin.id, Array.from(selected));
    toast.success(
      `${selected.size.toLocaleString("fa-IR")} کاربر به ${admin.name} اختصاص یافت`,
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 vazir-matn mt-10"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label={`اختصاص کاربر به ${admin.name}`}
    >
      <div
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-800 text-foreground">
              اختصاص کاربر به {admin.name}
            </h2>
            <p className="text-2xs text-muted-foreground mt-0.5">
              کاربران را جست‌وجو و انتخاب کنید — چند انتخاب همزمان ممکن است.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors duration-150"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search + role filter */}
        <div className="px-5 py-3 border-b border-border shrink-0 flex flex-col gap-2.5">
          <div className="relative">
            <Search
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جست‌وجوی نام، ایمیل یا شهر…"
              className="w-full h-9 rounded-lg border border-border bg-card pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {roleFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setRole(f.value)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-600 transition-colors duration-150 ${
                  role === f.value
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Select-all bar */}
        {filtered.length > 0 && (
          <div
            onClick={toggleAllFiltered}
            className="flex items-center gap-2 px-5 py-2 text-xs font-600 text-muted-foreground hover:bg-muted/40 transition-colors duration-150 border-b border-border shrink-0 text-right"
          >
            <Checkbox
              checked={allFilteredSelected}
              className="pointer-events-none"
            />
            انتخاب همه ({filtered.length.toLocaleString("fa-IR")})
          </div>
        )}

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {assignable.length === 0
                ? "همه کاربران به این مدیر اختصاص یافته‌اند."
                : "کاربری یافت نشد."}
            </p>
          ) : (
            filtered.map((user) => {
              const isSelected = selected.has(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => toggle(user.id)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-right transition-colors duration-150 border-b border-border last:border-0 ${
                    isSelected ? "bg-primary/5" : "hover:bg-muted/40"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    className="pointer-events-none"
                  />
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-xs font-700 text-foreground shrink-0">
                    {user.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-600 text-foreground truncate">
                      {user.name}
                    </div>
                    <div
                      className="text-2xs text-muted-foreground truncate"
                      dir="ltr"
                    >
                      {user.email}
                    </div>
                  </div>
                  <RoleBadge role={user.role} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-border shrink-0">
          <span className="text-xs text-muted-foreground">
            {selected.size.toLocaleString("fa-IR")} انتخاب شده
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-secondary text-sm">
              انصراف
            </button>
            <button
              onClick={handleAssign}
              disabled={selected.size === 0}
              className="btn-primary text-sm disabled:opacity-40 disabled:pointer-events-none"
            >
              <UserPlus size={14} />
              اختصاص ({selected.size.toLocaleString("fa-IR")})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
