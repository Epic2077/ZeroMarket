"use client";

import LatestTable from "@/components/home/Latest/Table";
import { carOffers } from "@/context/offers";
import { sellerListings } from "@/context/sellerDashboard";
import { sellerListingColumns } from "@/context/sellerListings";
import { Handshake, PlusCircle } from "lucide-react";
import OffersTable from "./OffersTable";

const faNum = (n: number) => n.toLocaleString("fa-IR");

export default function ListingsTab() {
  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-700 text-foreground">
          آگهی‌های فعال من ({faNum(sellerListings.length)})
        </h2>
        <button className="btn-primary text-xs">
          <PlusCircle size={13} />
          آگهی جدید
        </button>
      </div>

      <LatestTable
        columns={sellerListingColumns}
        data={sellerListings}
        renderSubRow={() => (
          <div className="bg-muted/20 px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                <Handshake size={13} className="text-primary" />
              </span>
              <h3 className="text-sm font-700 text-foreground">
                پیشنهاد ({faNum(carOffers.length)})
              </h3>
            </div>
            <OffersTable />
          </div>
        )}
      />
    </div>
  );
}
