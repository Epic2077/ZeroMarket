import ListingDetailContent from "@/components/listings-detail/ListingDetailContent";
import { listings } from "@/context/data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
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
