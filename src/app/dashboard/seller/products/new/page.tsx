import SellerProductCreateEntry from "@/components/seller-dashboard/SellerProductCreateEntry";
import { Suspense } from "react";

export default function SellerNewProductPage() {
  return (
    <main className="pt-16" dir="rtl">
      <Suspense>
        <SellerProductCreateEntry />
      </Suspense>
    </main>
  );
}
