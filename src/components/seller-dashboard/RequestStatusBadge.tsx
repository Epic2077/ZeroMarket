import { requestStatusMap, type RequestStatus } from "@/context/sellerDashboard";

export default function RequestStatusBadge({
  status,
}: {
  status: RequestStatus;
}) {
  const { label, className } = requestStatusMap[status] ?? requestStatusMap.pending;
  return <span className={className}>{label}</span>;
}
