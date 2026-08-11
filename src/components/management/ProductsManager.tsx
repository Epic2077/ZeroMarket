"use client";

import StatusBadge from "@/components/shared/StatusBadge";
import { brandModelLabel, cityLabel } from "@/context/carLabels";
import { formatPrice } from "@/context/data";
import { useListings } from "@/hooks/useListings";
import { listingRowToListing } from "@/lib/supabase/listings";
import { supabase } from "@/lib/supabase/client";
import type { PlatformUser, ProductInput } from "@/types/admin";
import type { Listing } from "@/types/dataTypes";
import { Eye, Pencil, Plus, ShoppingBag, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import BulkImportProductsModal from "./BulkImportProductsModal";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  user: PlatformUser;
}

export default function ProductsManager({ user }: Props) {
  const { listings: rawListings } = useListings();
  const products = rawListings
    .filter((r) => r.seller_id === user.id)
    .map((r) => listingRowToListing(r));
  const [pendingDelete, setPendingDelete] = useState<Listing | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const canHaveProducts = user.role !== "USER";

  const handleBulk = async (rows: ProductInput[]) => {
    for (const row of rows) {
      await supabase.from("listings").insert({
        seller_id: user.id,
        brand: row.brand,
        model: row.model,
        trim: row.trim,
        year: row.year,
        price: row.price,
        price_unit: "تومان",
        color: row.color,
        color_hex: row.colorHex ?? "#1b4fd8",
        city: row.city,
        shipment_days: row.deliveryDays,
        body_type: row.bodyType,
        engine_power: row.engine,
        gearbox: row.transmission,
        fuel: row.fuelType,
        other_options: row.factoryOptions ?? [],
        status: "WAITING",
        slug: `${row.brand}-${row.model}-${row.year}-${crypto.randomUUID().slice(0, 8)}`.replace(
          /\s+/g,
          "-",
        ),
      });
    }
    toast.success(`${rows.length.toLocaleString("fa-IR")} محصول افزوده شد`);
    setBulkOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-700 text-foreground">
          محصولات ({products.length.toLocaleString("fa-IR")})
        </h3>
        {canHaveProducts && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkOpen(true)}
              className="btn-secondary text-xs"
            >
              <Upload size={13} />
              ورود گروهی (اکسل)
            </button>
            <Link
              href={`/dashboard/manage/products/new?owner=${user.id}`}
              className="btn-primary text-xs"
            >
              <Plus size={13} />
              افزودن محصول
            </Link>
          </div>
        )}
      </div>

      {!canHaveProducts ? (
        <div className="rounded-xl border border-dashed border-border py-8 flex flex-col items-center gap-1.5 text-center">
          <ShoppingBag size={18} className="text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            این حساب خریدار است و محصولی ندارد. برای افزودن محصول، ابتدا نقش را
            به فروشنده تغییر دهید.
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
          این فروشنده محصولی ندارد.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="text-sm font-600 text-foreground truncate">
                  {brandModelLabel(p)} · {p.trim}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-price text-xs text-foreground">
                    {formatPrice(p.price)} تومان
                  </span>
                  <span className="text-2xs text-muted-foreground">
                    {cityLabel(p.city)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={p.status} />
                <Link
                  href={`/market/listings/${p.id}`}
                  aria-label="مشاهده محصول"
                  title="مشاهده"
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors duration-150"
                >
                  <Eye size={14} />
                </Link>
                <Link
                  href={`/dashboard/manage/products/${p.id}`}
                  aria-label="ویرایش محصول"
                  title="ویرایش"
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors duration-150"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => setPendingDelete(p)}
                  aria-label="حذف محصول"
                  title="حذف"
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-danger hover:border-danger/40 transition-colors duration-150"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="حذف محصول"
          description={`«${brandModelLabel(pendingDelete)} ${pendingDelete.trim}» برای همیشه حذف می‌شود.`}
          confirmLabel="حذف"
          onConfirm={async () => {
            await supabase.from("listings").delete().eq("id", pendingDelete.id);
            setPendingDelete(null);
            toast.success("محصول حذف شد");
          }}
          onClose={() => setPendingDelete(null)}
        />
      )}

      {bulkOpen && (
        <BulkImportProductsModal
          sellerName={user.name}
          onImport={handleBulk}
          onClose={() => setBulkOpen(false)}
        />
      )}
    </div>
  );
}
