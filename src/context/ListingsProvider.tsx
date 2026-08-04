"use client";

//MOCK

import { listings as seedListings } from "@/context/data";
import { sellerSlug } from "@/context/sellers";
import type { Listing } from "@/types/dataTypes";
import type { ProductInput } from "@/types/admin";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface ListingsContextValue {
  listings: Listing[];
  getListing: (id: string) => Listing | undefined;
  listingsByOwner: (ownerId: string) => Listing[];
  updateListing: (id: string, input: ProductInput) => void;
  // Returns the new listing id so callers can navigate to it.
  createListing: (
    ownerId: string,
    base: Partial<Listing>,
    input: ProductInput,
  ) => string;
  deleteListing: (id: string) => void;
}

const ListingsContext = createContext<ListingsContextValue | null>(null);

// Attach the managed owner id (derived from the seller name) to a seed listing.
const withOwner = (l: Listing): Listing => ({
  ...l,
  ownerId: l.ownerId ?? `usr-${sellerSlug(l.sellerName)}`,
});

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(() =>
    seedListings.map(withOwner),
  );
  const seq = useRef(0);

  const getListing = useCallback(
    (id: string) => listings.find((l) => l.id === id),
    [listings],
  );

  const listingsByOwner = useCallback(
    (ownerId: string) => listings.filter((l) => l.ownerId === ownerId),
    [listings],
  );

  const updateListing = useCallback(
    (id: string, input: ProductInput) =>
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...input } : l)),
      ),
    [],
  );

  const createListing = useCallback(
    (ownerId: string, base: Partial<Listing>, input: ProductInput): string => {
      const id = `listing-new-${(seq.current += 1)}`;
      const listing: Listing = {
        // sensible defaults for fields the editor doesn't expose
        priceUnit: "Toman",
        sellerVerified: false,
        sellerResponseRate: 90,
        sellerMemberSince: "1402",
        sellerActiveListings: 1,
        sellerAvatar: "؟",
        sellerName: "فروشنده",
        marketAvgBuy: input.price,
        marketAvgSell: input.price,
        priceVsMarket: 0,
        trend7d: 0,
        listedDate: new Date().toISOString().slice(0, 10),
        ...base,
        ...input,
        id,
        ownerId,
      };
      setListings((prev) => [listing, ...prev]);
      return id;
    },
    [],
  );

  const deleteListing = useCallback(
    (id: string) => setListings((prev) => prev.filter((l) => l.id !== id)),
    [],
  );

  const value = useMemo<ListingsContextValue>(
    () => ({
      listings,
      getListing,
      listingsByOwner,
      updateListing,
      createListing,
      deleteListing,
    }),
    [
      listings,
      getListing,
      listingsByOwner,
      updateListing,
      createListing,
      deleteListing,
    ],
  );

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings(): ListingsContextValue {
  const ctx = useContext(ListingsContext);
  if (!ctx) {
    throw new Error("useListings must be used within a <ListingsProvider>");
  }
  return ctx;
}
