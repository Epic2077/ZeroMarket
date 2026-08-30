"use client";

import { supabase } from "@/lib/supabase/client";
import { listingRowToListing, type ListingRow } from "@/lib/supabase/listings";
import type { Listing } from "@/types/dataTypes";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import ProductEditor from "./ProductEditor";
import ProductEditorGuard from "./ProductEditorGuard";

interface ProductEditorOwner {
  id: string;
  full_name?: string;
  name?: string;
  avatar_path?: string | null;
  avatar?: string | null;
  verified?: boolean;
  created_at?: string;
}

// Resolves an existing listing + its owner from Supabase for the edit page.
export default function ProductEditEntry({ listingId }: { listingId: string }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [owner, setOwner] = useState<ProductEditorOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (fetchErr || !data) {
        setListing(null);
        setOwner(null);
        setLoading(false);
        return;
      }

      const row = data as ListingRow;
      const l = listingRowToListing(row);
      setListing(l);

      // Fetch seller info
      const { data: sellerData } = await supabase
        .from("sellers")
        .select("id, full_name, avatar_path, verified, created_at")
        .eq("id", row.seller_id)
        .single();

      setOwner({
        id: row.seller_id,
        full_name: sellerData?.full_name ?? undefined,
        avatar_path: sellerData?.avatar_path ?? undefined,
        verified: sellerData?.verified ?? undefined,
        created_at: sellerData?.created_at ?? undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در دریافت محصول");
      setListing(null);
      setOwner(null);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24">
        <Loader2 size={24} className="animate-spin text-primary" />
        <span className="text-sm text-muted-foreground vazir-matn">
          در حال بارگذاری…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-16 text-center">
        <p className="text-sm text-danger mb-3">{error}</p>
        <button onClick={load} className="btn-secondary text-sm">
          تلاش مجدد
        </button>
      </div>
    );
  }

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
        backHref={`/sellers/${owner.id}`}
      />
    </ProductEditorGuard>
  );
}
