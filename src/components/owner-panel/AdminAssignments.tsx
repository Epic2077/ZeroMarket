"use client";

import { useAdmin } from "@/context/AdminProvider";
import type { AdminAccount, PlatformUser } from "@/types/admin";
import { ShieldHalf, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

// One admin card: access is global for every admin, so the owner only reviews
// the roster and can remove an admin entirely if needed.
function AdminAssignmentCard({
  admin,
  users,
}: {
  admin: AdminAccount;
  users: PlatformUser[];
}) {
  const { removeAdmin } = useAdmin();

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
        <button
          onClick={() => {
            removeAdmin(admin.id);
            toast.success("مدیر حذف شد");
          }}
          aria-label="حذف مدیر"
          title="حذف مدیر"
          className="mr-auto flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors duration-150 shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3 text-xs leading-6 text-muted-foreground">
        این مدیر به همه کاربران دسترسی دارد و تخصیص جداگانه‌ای وجود ندارد.
        {users.length.toLocaleString("fa-IR")} کاربر در کل سامانه قابل مدیریت
        است.
      </div>
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
          placeholder="admin@KhodroJu.ir"
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
        <Users size={14} className="text-primary" />
        همه مدیران به همه کاربران دسترسی دارند. از این بخش فقط می‌توانید مدیران
        را اضافه یا حذف کنید.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {admins.map((admin) => (
          <AdminAssignmentCard key={admin.id} admin={admin} users={users} />
        ))}
      </div>
    </div>
  );
}
