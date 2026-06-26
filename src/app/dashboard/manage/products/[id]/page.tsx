import ProductEditEntry from "@/components/management/ProductEditEntry";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <main className="pt-16" dir="rtl">
      <ProductEditEntry listingId={id} />
    </main>
  );
}
