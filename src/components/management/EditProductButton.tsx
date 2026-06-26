"use client";

import { useAdmin } from "@/context/AdminProvider";
import { sellerSlug } from "@/context/sellers";
import { useSession } from "@/context/SessionProvider";
import type { Listing } from "@/types/dataTypes";
import { Pencil } from "lucide-react";
import Link from "next/link";

// Edit shortcut shown on the product detail page for the owner or an admin who
// manages this product's seller. (Seller-self editing arrives with seller auth.)
export default function EditProductButton({ listing }: { listing: Listing }) {
  const { role, adminId } = useSession();
  const { admins } = useAdmin();

  const ownerId = listing.ownerId ?? `usr-${sellerSlug(listing.sellerName)}`;

  const allowed =
    role === "owner" ||
    (role === "admin" &&
      Boolean(
        admins.find((a) => a.id === adminId)?.assignedUserIds.includes(ownerId),
      ));

  if (!allowed) return null;

  return (
    <Link
      href={`/dashboard/manage/products/${listing.id}`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-700 bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-colors duration-150"
    >
      <Pencil size={14} />
      ویرایش محصول
    </Link>
  );
}
