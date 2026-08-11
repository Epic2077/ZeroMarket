import { brandFa } from "@/context/marketFilters";
import { cityLabel, sellerLabel } from "@/context/carLabels";
import { listings } from "@/context/data";
import type { Listing } from "@/types/dataTypes";

// An aggregated view of a seller, derived from their listings. Sellers are not
// stored separately — every listing carries the seller fields, so the directory
// and seller profile are built by grouping listings on `sellerName`.
export interface SellerSummary {
  id: string; // seller UUID (from Supabase) or slug (mock data)
  slug: string;
  name: string; // Persian display name
  nameEn: string; // raw source name (used for matching / search)
  avatar_path: string; // initials shown in the avatar tile
  avatar?: string; // compatibility alias for older call sites
  city: string; // Persian city of the seller's first listing
  verified: boolean;
  responseRate: number;
  memberSince: string; // gregorian year as stored in the data
  activeListings: number;
  totalListings: number;
  totalSoldCount: number;
  sellerScore: number;
  minPrice: number; // cheapest listing price (0 = none)
  brands: string[]; // distinct Persian brand names (specialty)
  listings: Listing[];
}

// URL-safe slug from the latin seller name, e.g. "Aria Motors" → "aria-motors".
export const sellerSlug = (sellerName: string): string =>
  sellerName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function buildSellers(): SellerSummary[] {
  const bySeller = new Map<string, Listing[]>();
  for (const listing of listings) {
    const group = bySeller.get(listing.sellerName) ?? [];
    group.push(listing);
    bySeller.set(listing.sellerName, group);
  }

  return (
    Array.from(bySeller.entries())
      .map(([nameEn, sellerListings]) => {
        const [first] = sellerListings;
        const brands = Array.from(
          new Set(sellerListings.map((l) => brandFa[l.brand] ?? l.brand)),
        );
        return {
          id: sellerSlug(nameEn), // mock: use slug as id since no real UUID
          slug: sellerSlug(nameEn),
          name: sellerLabel(nameEn),
          nameEn,
          avatar_path: first.sellerAvatar ?? "S",
          city: cityLabel(first.city),
          verified: first.sellerVerified,
          responseRate: first.sellerResponseRate,
          memberSince: first.sellerMemberSince,
          activeListings: sellerListings.filter((l) => l.status === "active")
            .length,
          totalListings: sellerListings.length,
          totalSoldCount: 0,
          sellerScore: 0,
          minPrice: Math.min(...sellerListings.map((l) => l.price)),
          brands,
          listings: sellerListings,
        };
      })
      // Verified sellers first, then by number of listings.
      .sort(
        (a, b) =>
          Number(b.verified) - Number(a.verified) ||
          b.totalListings - a.totalListings,
      )
  );
}

export const sellers: SellerSummary[] = buildSellers();

export const getSellerBySlug = (slug: string): SellerSummary | undefined =>
  sellers.find((seller) => seller.slug === slug);
