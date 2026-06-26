import ProductCreateEntry from "@/components/management/ProductCreateEntry";
import { Suspense } from "react";

export default function NewProductPage() {
  return (
    <main className="pt-16" dir="rtl">
      <Suspense>
        <ProductCreateEntry />
      </Suspense>
    </main>
  );
}
