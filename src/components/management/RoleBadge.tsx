import { roleLabel } from "@/context/adminData";
import type { ProfileRole } from "@/types/admin";
import { BadgeCheck, ShieldHalf, User } from "lucide-react";

const config: Record<ProfileRole, { className: string; icon: typeof User }> = {
  USER: {
    className: "bg-muted text-muted-foreground border-border",
    icon: User,
  },
  ADMIN: {
    className: "bg-primary/10 text-primary border-primary/20",
    icon: ShieldHalf,
  },
  OWNER: {
    className: "bg-success/10 text-success border-success/20",
    icon: BadgeCheck,
  },
};

export default function RoleBadge({ role }: { role: ProfileRole }) {
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
