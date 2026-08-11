import { formatDate } from "./utils";
import Avatar from "../../shared/Avatar";
import RoleBadge from "../RoleBadge";
import type { AdminUserRow } from "@/types/admin";
import { Ban, Mail, MapPin, Pencil, Phone } from "lucide-react";

interface Props {
  user: AdminUserRow;
  onEdit: () => void;
}

export function UserHeroCard({ user, onEdit }: Props) {
  return (
    <div className="card-elevated p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white font-800 text-xl shrink-0">
            <Avatar
              src={user.avatar_path}
              name={user.full_name}
              size="w-16 h-16"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-800 text-foreground">
                {user.full_name}
              </h1>
              <RoleBadge role={user.role} />
              {user.status === "SUSPENDED" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-danger/20 bg-danger/10 text-danger text-2xs font-700">
                  <Ban size={11} />
                  معلق
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              عضو از {formatDate(user.created_at)}
            </p>
          </div>
        </div>
        <button onClick={onEdit} className="btn-secondary text-sm self-start">
          <Pencil size={14} />
          ویرایش پروفایل
        </button>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail size={15} className="text-primary shrink-0" />
          <span className="truncate" dir="ltr">
            {user.email}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone size={15} className="text-primary shrink-0" />
          {user.phone ?? "—"}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={15} className="text-primary shrink-0" />
          {user.city ?? "—"}
        </div>
      </div>
    </div>
  );
}
