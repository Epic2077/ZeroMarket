"use client";

import { useAdmin } from "@/context/AdminProvider";
import { sellerSlug } from "@/context/sellers";
import { useSession } from "@/context/SessionProvider";
import { useUserInfo } from "@/context/UserInfoProvider";
import type { Listing } from "@/types/dataTypes";
import { Pencil } from "lucide-react";
import Link from "next/link";

// Edit shortcut shown on the product detail page for the owner, an admin who
// manages this product's seller, or the seller themselves.
export default function EditProductButton({ listing }: { listing: Listing }) {
  const { role, adminId } = useSession();
  const { admins } = useAdmin();
  const { user } = useUserInfo();

  const ownerId = listing.ownerId ?? `usr-${sellerSlug(listing.sellerName)}`;
  const isSeller = user?.id === listing.seller_id;

  const allowedAsAdmin =
    role === "owner" ||
    (role === "admin" &&
      Boolean(
        admins.find((a) => a.id === adminId)?.assignedUserIds.includes(ownerId),
      ));

  const allowed = allowedAsAdmin || isSeller;

  if (!allowed) return null;

  // Seller gets a distinct visual style (accent instead of primary).
  const isAdminEdit = allowedAsAdmin;

  return (
    <Link
      href={`/dashboard/manage/products/${listing.id}`}
      className={
        isAdminEdit
          ? "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-700 bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-colors duration-150"
          : "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-700 bg-accent/10 border border-accent/25 text-accent hover:bg-accent/20 transition-colors duration-150"
      }
    >
      <Pencil size={14} />
      {isAdminEdit ? "ویرایش محصول" : "ویرایش آگهی"}
    </Link>
  );
}
