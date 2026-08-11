import SellerProfileClient from "@/components/sellers/SellerProfileClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SellerPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <main className="pt-16" dir="rtl">
      <SellerProfileClient sellerId={id} />
    </main>
  );
}
