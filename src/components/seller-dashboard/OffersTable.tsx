"use client";

import LatestTable from "@/components/home/Latest/Table";
import { useCallback, useMemo, useState } from "react";
import {
  updateRequestStatus,
  type BuyRequestRow,
  type BuyRequestStatus,
} from "@/lib/supabase/buyRequests";
import { getOfferColumns } from "@/context/offers";
import type { CarOffer, OfferStatus } from "@/context/offers";
import { toast } from "sonner";

const STATUS_TO_DB: Record<string, BuyRequestStatus> = {
  accepted: "ACCEPTED",
  rejected: "REJECTED",
  negotiable: "NEGOTIABLE",
};

const STATUS_FROM_DB: Record<string, OfferStatus> = {
  WAITING: "pending",
  ACCEPTED: "accepted",
  NEGOTIABLE: "negotiable",
  REJECTED: "rejected",
};

interface Props {
  requests: BuyRequestRow[];
}

function toCarOffer(r: BuyRequestRow): CarOffer {
  return {
    id: r.id,
    buyer: r.buyer_name,
    initials: r.buyer_name.charAt(0),
    offer: r.offered_price,
    date: new Date(r.created_at).toLocaleDateString("fa-IR"),
    status: STATUS_FROM_DB[r.status] ?? "pending",
  };
}

export default function OffersTable({ requests }: Props) {
  const [offers, setOffers] = useState<CarOffer[]>(() =>
    requests.map(toCarOffer),
  );

  const updateStatus = useCallback(
    async (id: string, status: OfferStatus) => {
      const dbStatus = STATUS_TO_DB[status];
      if (!dbStatus) return;

      // Optimistic update
      setOffers((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );

      try {
        await updateRequestStatus(id, dbStatus);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "خطا در به‌روزرسانی");
        // Revert on failure
        const original = requests.find((r) => r.id === id);
        if (original) {
          setOffers((prev) =>
            prev.map((o) =>
              o.id === id
                ? { ...o, status: STATUS_FROM_DB[original.status] ?? "pending" }
                : o,
            ),
          );
        }
      }
    },
    [requests],
  );

  const columns = useMemo(() => getOfferColumns(updateStatus), [updateStatus]);

  return <LatestTable columns={columns} data={offers} />;
}
