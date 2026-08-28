import MarketplaceContent from "@/components/market/MarketplaceContent";
import { Suspense } from "react";

export default function ListingMarketplace() {
  return (
    <main className="pt-16">
      <Suspense fallback={<div className="flex h-20 items-center justify-center">در حال بارگذاری…</div>}>
        <MarketplaceContent />
      </Suspense>
    </main>
  );
}
