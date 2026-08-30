"use client";

import { useUserInfo } from "@/context/UserInfoProvider";
import { fetchTickets, type TicketRow } from "@/lib/supabase/tickets";
import { toFa } from "@/context/carLabels";
import {
  MessageSquare,
  Plus,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof MessageSquare; className: string }
> = {
  OPEN: {
    label: "باز",
    icon: AlertCircle,
    className: "bg-warning/10 text-warning border-warning/25",
  },
  IN_PROGRESS: {
    label: "در حال بررسی",
    icon: Clock,
    className: "bg-accent/10 text-accent border-accent/25",
  },
  RESOLVED: {
    label: "حل شده",
    icon: CheckCircle,
    className: "bg-success/10 text-success border-success/25",
  },
  CLOSED: {
    label: "بسته شده",
    icon: XCircle,
    className: "bg-muted text-muted-foreground border-border",
  },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} دقیقه پیش`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ساعت پیش`;
  return `${Math.floor(hrs / 24)} روز پیش`;
}

export default function ContactPage() {
  const { user, profile } = useUserInfo();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "OWNER";

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      setTickets(await fetchTickets(user.id, isAdmin));
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="pt-20" dir="rtl">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8 vazir-matn">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-800 text-foreground">تماس با ما</h1>
            <p className="text-sm text-muted-foreground mt-1">
              تیکت‌های پشتیبانی خود را مشاهده و مدیریت کنید
            </p>
          </div>
          {!isAdmin && (
            <Link
              href="/contact/new"
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Plus size={15} /> تیکت جدید
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16">
            <Loader2 size={18} className="animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              در حال بارگذاری…
            </span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <MessageSquare
              size={32}
              className="text-muted-foreground mx-auto mb-3"
            />
            <p className="text-sm text-muted-foreground">
              هیچ تیکتی ثبت نشده است
            </p>
            {!isAdmin && (
              <Link
                href="/contact/new"
                className="btn-primary text-sm mt-4 inline-flex items-center gap-2"
              >
                <Plus size={15} /> ثبت تیکت جدید
              </Link>
            )}
          </div>
        ) : (
          <div className="card-elevated overflow-hidden">
            <div className="divide-y divide-border">
              {tickets.map((ticket) => {
                const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.OPEN;
                const Icon = cfg.icon;
                return (
                  <Link
                    key={ticket.id}
                    href={`/contact/${ticket.id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors duration-150"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <MessageSquare
                          size={18}
                          className="text-muted-foreground"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-700 text-foreground truncate">
                          {ticket.subject}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {isAdmin && <span>{ticket.user_name} · </span>}
                          {timeAgo(ticket.updated_at)}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-600 border shrink-0 mr-3 ${cfg.className}`}
                    >
                      <Icon size={12} />
                      {cfg.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
