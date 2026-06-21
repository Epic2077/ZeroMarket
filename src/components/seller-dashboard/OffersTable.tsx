"use client";

import LatestTable from "@/components/home/Latest/Table";
import {
  carOffers,
  getOfferColumns,
  type CarOffer,
  type OfferStatus,
} from "@/context/offers";
import { useMemo, useState } from "react";

export default function OffersTable() {
  const [offers, setOffers] = useState<CarOffer[]>(carOffers);

  const updateStatus = (id: string, status: OfferStatus) =>
    setOffers((prev) =>
      prev.map((offer) => (offer.id === id ? { ...offer, status } : offer)),
    );

  // Stable handler (functional setState) → build columns once.
  const columns = useMemo(() => getOfferColumns(updateStatus), []);

  return <LatestTable columns={columns} data={offers} />;
}
