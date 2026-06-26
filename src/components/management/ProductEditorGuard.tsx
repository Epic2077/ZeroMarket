"use client";

import { useAdmin } from "@/context/AdminProvider";
import { useSession } from "@/context/SessionProvider";
import { ShieldHalf } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

// Gate access to a managed owner's products: owner sees all, an admin only
// their assigned users, guests none. Renders `children` when allowed.
export default function ProductEditorGuard({
  ownerId,
  children,
}: {
  ownerId: string;
  children: ReactNode;
}) {
  const { role, adminId } = useSession();
  const { admins } = useAdmin();

  const allowed =
    role === "owner" ||
    (role === "admin" &&
      Boolean(
        admins
          .find((a) => a.id === adminId)
          ?.assignedUserIds.includes(ownerId),
      ));

  if (!allowed) {
    return (
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-16 text-center">
        <ShieldHalf size={28} className="text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-700 text-foreground">دسترسی ندارید</p>
        <p className="text-xs text-muted-foreground mt-1">
          اجازه ویرایش محصولات این فروشنده را ندارید.
        </p>
        <Link
          href="/dashboard/owner"
          className="btn-secondary text-sm mt-4 inline-flex"
        >
          بازگشت
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
