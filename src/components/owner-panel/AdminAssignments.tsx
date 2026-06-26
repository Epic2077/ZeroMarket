"use client";

import { useAdmin } from "@/context/AdminProvider";
import type { AdminAccount, PlatformUser } from "@/types/admin";
import { ShieldHalf, Trash2, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "../management/ConfirmDialog";
import RoleBadge from "../management/RoleBadge";
import AssignUsersModal from "./AssignUsersModal";

// One admin card: shows the users they manage and lets the owner add/remove
// access, or remove the admin entirely.
function AdminAssignmentCard({
  admin,
  users,
}: {
  admin: AdminAccount;
  users: PlatformUser[];
}) {
  const { unassignUser, removeAdmin } = useAdmin();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const assigned = admin.assignedUserIds
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is PlatformUser => Boolean(u));

  return (
    <div className="card-elevated p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-negotiable/15 text-negotiable flex items-center justify-center font-800 text-sm shrink-0">
          {admin.avatar}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <ShieldHalf size={14} className="text-negotiable shrink-0" />
            <span className="text-sm font-700 text-foreground truncate">
              {admin.name}
            </span>
          </div>
          <div className="text-2xs text-muted-foreground truncate" dir="ltr">
            {admin.email}
          </div>
        </div>
        <div className="mr-auto flex items-center gap-2 shrink-0">
          <span className="text-2xs text-muted-foreground">
            {assigned.length.toLocaleString("fa-IR")} کاربر
          </span>
          <button
            onClick={() => setConfirmRemove(true)}
            aria-label="حذف مدیر"
            title="حذف مدیر"
            className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors duration-150"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Assigned users */}
      <div className="flex flex-col gap-2 mb-4">
        {assigned.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2 text-center rounded-lg border border-dashed border-border">
            هنوز کاربری اختصاص نیافته است.
          </p>
        ) : (
          assigned.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-card flex items-center justify-center text-2xs font-700 text-foreground shrink-0">
                  {user.avatar}
                </div>
                <span className="text-xs font-600 text-foreground truncate">
                  {user.name}
                </span>
                <RoleBadge role={user.role} />
              </div>
              <button
                onClick={() => {
                  unassignUser(admin.id, user.id);
                  toast.success(`دسترسی به «${user.name}» لغو شد`);
                }}
                aria-label="لغو دسترسی"
                title="لغو دسترسی"
                className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors duration-150 shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Assign new */}
      <button
        onClick={() => setAssignOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-primary/40 text-primary text-sm font-600 hover:bg-primary/5 transition-colors duration-150"
      >
        <UserPlus size={14} />
        افزودن کاربر…
      </button>

      {assignOpen && (
        <AssignUsersModal
          admin={admin}
          users={users}
          onClose={() => setAssignOpen(false)}
        />
      )}

      {confirmRemove && (
        <ConfirmDialog
          title="حذف مدیر"
          description={`دسترسی مدیریتی «${admin.name}» حذف می‌شود.`}
          confirmLabel="حذف"
          onConfirm={() => {
            removeAdmin(admin.id);
            toast.success("مدیر حذف شد");
          }}
          onClose={() => setConfirmRemove(false)}
        />
      )}
    </div>
  );
}

// Form to register a brand-new admin by name + email.
function AddAdminForm() {
  const { createAdmin } = useAdmin();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("نام و ایمیل الزامی است");
      return;
    }
    createAdmin(name, email);
    toast.success(`«${name.trim()}» به‌عنوان مدیر افزوده شد`);
    setName("");
    setEmail("");
  };

  return (
    <form
      onSubmit={submit}
      className="card-elevated p-5 flex flex-col sm:flex-row sm:items-end gap-3"
    >
      <div className="flex-1">
        <label className="text-xs font-600 text-muted-foreground mb-1.5 block">
          نام مدیر
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="نام و نام خانوادگی"
          className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div className="flex-1">
        <label className="text-xs font-600 text-muted-foreground mb-1.5 block">
          ایمیل
        </label>
        <input
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@zeromarket.ir"
          className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <button type="submit" className="btn-primary text-sm shrink-0">
        <UserPlus size={14} />
        افزودن مدیر
      </button>
    </form>
  );
}

export default function AdminAssignments() {
  const { admins, users } = useAdmin();

  return (
    <div className="flex flex-col gap-4">
      <AddAdminForm />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <UserPlus size={14} className="text-primary" />
        کاربران را به مدیران اختصاص دهید تا بتوانند پروفایل و آگهی‌های آن‌ها را
        مدیریت کنند. می‌توانید یک کاربر را از پروفایلش نیز به مدیر تبدیل کنید.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {admins.map((admin) => (
          <AdminAssignmentCard key={admin.id} admin={admin} users={users} />
        ))}
      </div>
    </div>
  );
}
