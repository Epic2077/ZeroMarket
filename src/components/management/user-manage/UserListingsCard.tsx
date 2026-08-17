import { formatPrice } from "@/context/data";
import StatusBadge from "../../shared/StatusBadge";
import type { Listing } from "@/types/dataTypes";
import { ExternalLink, Loader2, Pencil, ShoppingBag } from "lucide-react";
import Link from "next/link";

interface Props {
  listings: Listing[];
  loading: boolean;
}

export function UserListingsCard({ listings, loading }: Props) {
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag size={18} className="text-primary" />
        <h2 className="text-sm font-700 text-foreground">آگهی‌ها</h2>
      </div>
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 size={18} className="animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            در حال بارگذاری…
          </span>
        </div>
      ) : listings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          این کاربر هیچ آگهی ثبت نکرده است
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-right py-2 px-2 font-600">خودرو</th>
                <th className="text-right py-2 px-2 font-600">سال</th>
                <th className="text-right py-2 px-2 font-600">قیمت</th>
                <th className="text-right py-2 px-2 font-600">وضعیت</th>
                <th className="text-right py-2 px-2 font-600">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-border/60 hover:bg-muted/50 transition-colors"
                >
                  <td className="py-2.5 px-2">
                    <div className="font-600 text-foreground">
                      {l.brand} {l.model}
                    </div>
                    <div className="text-2xs text-muted-foreground">
                      {l.trim}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 tabular-nums">{l.year}</td>
                  <td className="py-2.5 px-2 font-mono tabular-nums">
                    {formatPrice(l.price)}
                  </td>
                  <td className="py-2.5 px-2">
                    {l.deletedAt ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-muted text-muted-foreground text-2xs font-700">
                        حذف شده
                      </span>
                    ) : (
                      <StatusBadge status={l.status} />
                    )}
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/manage/products/${l.id}`}
                        className="inline-flex items-center gap-1 text-2xs font-600 text-primary hover:underline"
                      >
                        <Pencil size={12} />
                        ویرایش
                      </Link>
                      <Link
                        href={`/market/listings/${l.id}`}
                        className="inline-flex items-center gap-1 text-2xs font-600 text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink size={12} />
                        مشاهده
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
