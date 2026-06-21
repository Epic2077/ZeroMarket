"use client";

import RequestStatusBadge from "@/components/seller-dashboard/RequestStatusBadge";
import { myRequests } from "@/context/userProfile";
import { Store, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const faNum = (n: number) => n.toLocaleString("fa-IR");

export default function MyRequestsTab() {
  const [requests, setRequests] = useState(myRequests);

  const cancel = (id: string, title: string) => {
    setRequests((prev) => prev.filter((req) => req.id !== id));
    toast.success(`درخواست «${title}» لغو شد`);
  };

  return (
    <div className="card-elevated overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-700 text-foreground">
          درخواست‌های خرید من ({faNum(requests.length)})
        </h2>
      </div>

      {requests.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-muted-foreground">
          درخواست فعالی ندارید.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {requests.map((req) => {
            // Only still-open requests can be withdrawn by the buyer.
            const cancellable =
              req.status === "pending" || req.status === "negotiable";
            return (
              <div
                key={req.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30 transition-colors duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                    <Store size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-700 text-foreground">
                      {req.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {req.seller}
                    </div>
                    <div className="text-2xs text-muted-foreground mt-0.5">
                      {req.time}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-mono font-700 text-foreground">
                    {req.offer.toLocaleString("fa-IR")} تومان
                  </div>
                  <div className="text-2xs text-muted-foreground">
                    پیشنهاد شما
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RequestStatusBadge status={req.status} />
                  {cancellable && (
                    <button
                      onClick={() => cancel(req.id, req.title)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-danger/25 bg-danger/10 text-danger text-xs font-700 rounded-lg hover:bg-danger/20 transition-colors duration-150"
                    >
                      <X size={12} />
                      لغو درخواست
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
