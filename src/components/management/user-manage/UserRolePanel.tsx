"use client";

import { roleLabel, ROLE_ORDER } from "@/context/adminData";
import type { AdminUserRow } from "@/types/admin";
import { Ban, CheckCircle2, ShieldHalf } from "lucide-react";
import { toast } from "sonner";
import { VerifyUserButton } from "./VerifyUserButton";

interface Props {
  user: AdminUserRow;
  onUpdate: (updates: {
    role?: string;
    status?: string;
    verified?: boolean;
  }) => Promise<boolean>;
  onSuspendRequest: () => void;
}

export function UserRolePanel({ user, onUpdate, onSuspendRequest }: Props) {
  return (
    <div className="card-elevated p-5">
      <h2 className="text-sm font-700 text-foreground mb-3">مدیریت نقش</h2>
      <div className="flex flex-col gap-2">
        {ROLE_ORDER.map((role) => {
          const isCurrent = user.role === role;
          return (
            <button
              key={role}
              onClick={async () => {
                if (isCurrent) return;
                const ok = await onUpdate({ role });
                if (ok) toast.success(`نقش به «${roleLabel[role]}» تغییر کرد`);
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
            const ok = await onUpdate({ role: "ADMIN" });
            if (ok)
              toast.success(`«${user.full_name}» به‌عنوان مدیر افزوده شد`);
          }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-700 bg-negotiable/10 border border-negotiable/25 text-negotiable hover:bg-negotiable/20 transition-colors duration-150"
        >
          <ShieldHalf size={14} />
          تبدیل به مدیر
        </button>
        <VerifyUserButton user={user} onUpdate={onUpdate} />
        {user.status === "ACTIVE" ? (
          <button
            onClick={onSuspendRequest}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-700 bg-danger/10 border border-danger/25 text-danger hover:bg-danger/20 transition-colors duration-150"
          >
            <Ban size={14} />
            تعلیق حساب
          </button>
        ) : (
          <button
            onClick={async () => {
              const ok = await onUpdate({ status: "ACTIVE" });
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
  );
}
