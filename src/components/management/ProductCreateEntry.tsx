"use client";

import { useAdmin } from "@/context/AdminProvider";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductEditor from "./ProductEditor";
import ProductEditorGuard from "./ProductEditorGuard";

// Resolves the target seller (from `?owner=usr-...`) for the create page.
export default function ProductCreateEntry() {
  const { users } = useAdmin();
  const ownerId = useSearchParams().get("owner") ?? "";
  const owner = users.find((u) => u.id === ownerId);

  if (!owner) {
    return (
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-16 text-center">
        <p className="text-sm text-muted-foreground">فروشنده نامعتبر است.</p>
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
        owner={owner}
        backHref={`/dashboard/manage/users/${owner.id}`}
      />
    </ProductEditorGuard>
  );
}
