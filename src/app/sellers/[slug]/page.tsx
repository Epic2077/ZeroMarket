import SellerProfile from "@/components/sellers/SellerProfile";
import { getSellerBySlug, sellers } from "@/context/sellers";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Pre-render a route for every known seller.
export function generateStaticParams() {
  return sellers.map((seller) => ({ slug: seller.slug }));
}

export default async function SellerPage({ params }: PageProps) {
  const { slug } = await params;
  const seller = getSellerBySlug(slug);

  if (!seller) notFound();

  return (
    <main className="pt-16" dir="rtl">
      <SellerProfile seller={seller} />
    </main>
  );
}
