"use client";

import ListingCard from "@/components/shared/ListingCard";
import { useListings } from "@/hooks/useListings";
import { listingRowToListing } from "@/lib/supabase/listings";
import type { Listing } from "@/types/dataTypes";
import { Layers } from "lucide-react";
import { useMemo } from "react";

interface Props {
  listing: Listing;
}

// Rank other listings by how similar they are to the current one: same model
// (from any seller) first, then same segment, then same brand. This surfaces
// "the same car from other sellers" alongside close alternatives.
function similarityScore(candidate: Listing, current: Listing): number {
  let score = 0;
  if (candidate.model === current.model) score += 4;
  if (candidate.bodyType === current.bodyType) score += 2;
  if (candidate.brand === current.brand) score += 1;
  return score;
}

export default function ListingDetailRelated({ listing }: Props) {
  const { listings: rawListings, loading } = useListings();

  const related = useMemo(() => {
    if (loading || !rawListings.length) return [];
    return rawListings
      .map((row) => listingRowToListing(row))
      .filter((item) => item.id !== listing.id)
      .map((item) => ({ item, score: similarityScore(item, listing) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ item }) => item);
  }, [rawListings, loading, listing]);

  if (related.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="related-heading">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={18} className="text-primary" />
        <h2 id="related-heading" className="text-lg font-800 text-foreground">
          خودروهای مشابه و سایر فروشندگان
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 w-[80%]">
        {related.slice(0, 5).map((item) => (
          <ListingCard key={`related-${item.id}`} listing={item} />
        ))}
      </div>
    </section>
  );
}
