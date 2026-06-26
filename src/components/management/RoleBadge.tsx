import { roleLabel } from "@/context/adminData";
import type { PlatformRole } from "@/types/admin";
import { BadgeCheck, ShoppingBag, Store } from "lucide-react";

const config: Record<
  PlatformRole,
  { className: string; icon: typeof Store }
> = {
  buyer: {
    className: "bg-muted text-muted-foreground border-border",
    icon: ShoppingBag,
  },
  seller: {
    className: "bg-primary/10 text-primary border-primary/20",
    icon: Store,
  },
  confirmed_seller: {
    className: "bg-success/10 text-success border-success/20",
    icon: BadgeCheck,
  },
};

export default function RoleBadge({ role }: { role: PlatformRole }) {
  const { className, icon: Icon } = config[role];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-2xs font-700 ${className}`}
    >
      <Icon size={11} />
      {roleLabel[role]}
    </span>
  );
}
