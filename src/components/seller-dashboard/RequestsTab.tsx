"use client";

import { formatPrice } from "@/context/data";
import {
  buyRequests,
  type BuyRequest,
  type RequestStatus,
} from "@/context/sellerDashboard";
import { CheckCircle, MessageSquare, XCircle } from "lucide-react";
import { useState } from "react";
import RequestStatusBadge from "./RequestStatusBadge";

const faNum = (n: number) => n.toLocaleString("fa-IR");

// Status the seller can switch a request to — available on every row, so an
// already-accepted or negotiating request can be changed/cancelled too.
const requestActions: {
  status: RequestStatus;
  title: string;
  icon: typeof CheckCircle;
  className: string;
}[] = [
  {
    status: "approved",
    title: "تأیید",
    icon: CheckCircle,
    className:
      "bg-success/10 border-success/25 text-success hover:bg-success/20",
  },
  {
    status: "negotiable",
    title: "مذاکره",
    icon: MessageSquare,
    className:
      "bg-negotiable/10 border-negotiable/25 text-negotiable hover:bg-negotiable/20",
  },
  {
    status: "declined",
    title: "رد",
    icon: XCircle,
    className: "bg-danger/10 border-danger/25 text-danger hover:bg-danger/20",
  },
];

export default function RequestsTab() {
  const [requests, setRequests] = useState<BuyRequest[]>(buyRequests);

  const updateStatus = (id: string, status: RequestStatus) =>
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status } : req)),
    );

  return (
    <div className="card-elevated overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-700 text-foreground">
          همه درخواست‌های خرید ({faNum(requests.length)})
        </h2>
      </div>
      <div className="divide-y divide-border">
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-muted/30 transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-700 text-foreground flex-shrink-0">
                {req.buyer.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-700 text-foreground">
                  {req.buyer}
                </div>
                <div className="text-xs text-muted-foreground">
                  {req.listing}
                </div>
                <div className="text-2xs text-muted-foreground mt-0.5">
                  {req.time}
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-mono font-700 text-foreground">
                {req.offer.toLocaleString()} تومان
              </div>
              <div className="text-2xs text-muted-foreground">پیشنهاد قیمت</div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <RequestStatusBadge status={req.status} />
              <div className="flex items-center gap-1.5">
                {requestActions.map((action) => {
                  const Icon = action.icon;
                  const isActive = req.status === action.status;
                  return (
                    <button
                      key={action.status}
                      onClick={() => updateStatus(req.id, action.status)}
                      title={action.title}
                      aria-label={action.title}
                      className={`flex items-center gap-1 px-3 py-1.5 border text-xs font-700 rounded-lg transition-colors duration-150 ${action.className} ${isActive ? "ring-1 ring-current" : ""}`}
                    >
                      <Icon size={12} />
                      {action.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
