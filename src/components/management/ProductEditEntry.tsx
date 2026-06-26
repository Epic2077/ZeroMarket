"use client";

import { useAdmin } from "@/context/AdminProvider";
import { useListings } from "@/context/ListingsProvider";
import Link from "next/link";
import ProductEditor from "./ProductEditor";
import ProductEditorGuard from "./ProductEditorGuard";

// Resolves an existing listing + its owner from context for the edit page.
export default function ProductEditEntry({ listingId }: { listingId: string }) {
  const { getListing } = useListings();
  const { users } = useAdmin();

  const listing = getListing(listingId);
  const owner = listing
    ? users.find((u) => u.id === listing.ownerId)
    : undefined;

  if (!listing || !owner) {
    return (
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-16 text-center">
        <p className="text-sm text-muted-foreground">محصول یافت نشد.</p>
        <Link
          href="/dashboard/owner"
          className="btn-secondary text-sm mt-4 inline-flex"
        >
          بازگشت
        </Link>
      </div>
    );
  }

  return (
    <ProductEditorGuard ownerId={owner.id}>
      <ProductEditor
        listing={listing}
        owner={owner}
        backHref={`/dashboard/manage/users/${owner.id}`}
      />
    </ProductEditorGuard>
  );
}
