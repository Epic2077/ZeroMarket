import ListingDetailContent from "@/components/listings-detail/ListingDetailContent";
import { listings } from "@/context/data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Pre-render a route for every known listing.
export function generateStaticParams() {
  return listings.map((listing) => ({ id: listing.id }));
}

export default async function SinglePage({ params }: PageProps) {
  const { id } = await params;
  const listing = listings.find((l) => l.id === id);

  if (!listing) notFound();

  return (
    <main>
      <ListingDetailContent listing={listing} />
    </main>
  );
}
