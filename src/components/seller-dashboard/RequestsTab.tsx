import { formatPrice } from "@/context/data";
import { buyRequests } from "@/context/sellerDashboard";
import { CheckCircle, MessageSquare, XCircle } from "lucide-react";
import RequestStatusBadge from "./RequestStatusBadge";

export default function RequestsTab() {
  return (
    <div className="card-elevated overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-700 text-foreground">
          همه درخواست‌های خرید ({buyRequests.length})
        </h2>
      </div>
      <div className="divide-y divide-border">
        {buyRequests.map((req) => (
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
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-left">
                <div className="text-sm font-mono font-700 text-foreground">
                  {formatPrice(req.offer)}
                </div>
                <div className="text-2xs text-muted-foreground">پیشنهاد قیمت</div>
              </div>
              <RequestStatusBadge status={req.status} />
              {req.status === "pending" && (
                <div className="flex items-center gap-1.5">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-success/10 border border-success/25 text-success text-xs font-700 rounded-lg hover:bg-success/20 transition-colors duration-150">
                    <CheckCircle size={12} />
                    تأیید
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-negotiable/10 border border-negotiable/25 text-negotiable text-xs font-700 rounded-lg hover:bg-negotiable/20 transition-colors duration-150">
                    <MessageSquare size={12} />
                    مذاکره
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-danger/10 border border-danger/25 text-danger text-xs font-700 rounded-lg hover:bg-danger/20 transition-colors duration-150">
                    <XCircle size={12} />
                    رد
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
