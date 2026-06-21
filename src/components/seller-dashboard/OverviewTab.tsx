import { formatPrice } from "@/context/data";
import {
  buyRequests,
  performanceMetrics,
  quickActions,
  type BuyRequest,
} from "@/context/sellerDashboard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CheckCircle, ChevronDown, MessageSquare, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import RequestStatusBadge from "./RequestStatusBadge";

interface Props {
  onViewAllRequests: () => void;
}

// The always-visible summary row of a request. `trigger` is the optional
// collapsible toggle rendered at the end (only for actionable requests).
function RequestSummary({
  req,
  trigger,
}: {
  req: BuyRequest;
  trigger?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-700 text-foreground">
          {req.buyer.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-600 text-foreground">{req.buyer}</div>
          <div className="text-xs text-muted-foreground">{req.listing}</div>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-mono font-700 text-foreground">
          {req.offer.toLocaleString()} تومان
        </div>
        <div className="text-2xs text-muted-foreground">{req.time}</div>
      </div>
      <div className="flex items-center gap-3">
        <RequestStatusBadge status={req.status} />
        {trigger}
      </div>
    </div>
  );
}

function RequestActions() {
  return (
    <div className="flex items-center gap-2 px-5 pb-4 pt-1">
      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-success/10 border border-success/25 text-success text-xs font-700 rounded-lg hover:bg-success/20 transition-colors duration-150">
        <CheckCircle size={13} />
        تأیید
      </button>
      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-negotiable/10 border border-negotiable/25 text-negotiable text-xs font-700 rounded-lg hover:bg-negotiable/20 transition-colors duration-150">
        <MessageSquare size={13} />
        مذاکره
      </button>
      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-danger/10 border border-danger/25 text-danger text-xs font-700 rounded-lg hover:bg-danger/20 transition-colors duration-150">
        <XCircle size={13} />
        رد
      </button>
    </div>
  );
}

export default function OverviewTab({ onViewAllRequests }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Recent requests */}
      <div className="xl:col-span-2">
        <div className="card-elevated overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-700 text-foreground">
              آخرین درخواست‌های خرید
            </h2>
            <button
              onClick={onViewAllRequests}
              className="text-xs text-primary font-600 hover:underline"
            >
              مشاهده همه
            </button>
          </div>
          <div className="divide-y divide-border">
            {buyRequests.slice(0, 3).map((req) =>
              req.status === "pending" ? (
                <Collapsible
                  key={req.id}
                  className="transition-colors duration-150 hover:bg-muted/30"
                >
                  <RequestSummary
                    req={req}
                    trigger={
                      <CollapsibleTrigger
                        aria-label="نمایش عملیات"
                        className="group rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <ChevronDown
                          size={16}
                          className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                        />
                      </CollapsibleTrigger>
                    }
                  />
                  <CollapsibleContent>
                    <RequestActions />
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <div
                  key={req.id}
                  className="transition-colors duration-150 hover:bg-muted/30"
                >
                  <RequestSummary req={req} />
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Quick stats sidebar */}
      <div className="flex flex-col gap-4">
        {/* Performance card */}
        <div className="card-elevated p-5">
          <h3 className="text-sm font-700 text-foreground mb-4">
            عملکرد این ماه
          </h3>
          <div className="flex flex-col gap-3">
            {performanceMetrics.map((item) => (
              <div key={`perf-${item.label}`}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-700 text-foreground">{item.value}</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.bar}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card-elevated p-5">
          <h3 className="text-sm font-700 text-foreground mb-3">دسترسی سریع</h3>
          <div className="flex flex-col gap-2">
            {quickActions.map((action) => (
              <button
                key={`action-${action.label}`}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-500 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150 text-right w-full"
              >
                <span className={action.color}>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
