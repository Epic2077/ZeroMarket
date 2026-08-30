"use client";

import { useUserInfo } from "@/context/UserInfoProvider";
import {
  fetchTicket,
  fetchTicketMessages,
  addTicketMessage,
  updateTicketStatus,
  uploadTicketAttachment,
  subscribeToTicketMessages,
  type TicketRow,
  type TicketMessageRow,
  type TicketStatus,
} from "@/lib/supabase/tickets";
import {
  ArrowRight,
  Loader2,
  Paperclip,
  Send,
  X,
  Download,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "OPEN", label: "باز" },
  { value: "IN_PROGRESS", label: "در حال بررسی" },
  { value: "RESOLVED", label: "حل شده" },
  { value: "CLOSED", label: "بسته شده" },
];

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
  }).format(new Date(iso));
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
}

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useUserInfo();
  const [ticket, setTicket] = useState<TicketRow | null>(null);
  const [messages, setMessages] = useState<TicketMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "OWNER";

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [t, msgs] = await Promise.all([
        fetchTicket(id, isAdmin),
        fetchTicketMessages(id),
      ]);
      setTicket(t);
      setMessages(msgs);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [id, isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  // ── Realtime subscription ──────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const sub = subscribeToTicketMessages(id, (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return () => {
      sub.unsubscribe();
    };
  }, [id]);

  // ── Auto-scroll ────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !id || !reply.trim()) return;
    setSending(true);
    try {
      let attachmentUrl: string | undefined;
      if (file) attachmentUrl = await uploadTicketAttachment(file);
      await addTicketMessage(id, user.id, reply.trim(), attachmentUrl);
      setReply("");
      setFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در ارسال پیام");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!id) return;
    try {
      await updateTicketStatus(id, status);
      setTicket((prev) => (prev ? { ...prev, status } : null));
      toast.success("وضعیت تیکت به‌روزرسانی شد");
    } catch {
      toast.error("خطا در تغییر وضعیت");
    }
  };

  if (loading) {
    return (
      <main className="pt-20" dir="rtl">
        <div className="flex items-center justify-center gap-2 py-32">
          <Loader2 size={18} className="animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
            در حال بارگذاری…
          </span>
        </div>
      </main>
    );
  }

  if (!ticket) {
    return (
      <main className="pt-20" dir="rtl">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">تیکت یافت نشد</p>
          <Link
            href="/contact"
            className="btn-secondary text-sm mt-4 inline-flex"
          >
            بازگشت
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 lg:px-8 xl:px-10 py-8 vazir-matn h-[calc(100vh-5rem)] flex flex-col">
        {/* Header */}
        <div className="shrink-0 mb-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1 text-xs font-600 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowRight size={14} /> بازگشت به تیکت‌ها
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-800 text-foreground">
                {ticket.subject}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ticket.user_name} · ایجاد {formatTime(ticket.created_at)}
              </p>
            </div>
            {isAdmin && (
              <select
                value={ticket.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as TicketStatus)
                }
                className="h-9 rounded-lg border border-border bg-card text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                dir="rtl"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-1">
          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMine ? "bg-primary text-white rounded-br-md" : "bg-muted rounded-bl-md"}`}
                >
                  {!isMine && (
                    <p className="text-xs font-700 mb-1 text-muted-foreground">
                      {msg.sender_name}
                    </p>
                  )}
                  {msg.attachment_url && (
                    <div className="mb-2">
                      {isImageUrl(msg.attachment_url) ? (
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => setLightboxUrl(msg.attachment_url)}
                        >
                          <img
                            src={msg.attachment_url}
                            alt="پیوست"
                            className="max-w-full max-h-48 rounded-lg object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                            <Maximize2
                              size={18}
                              className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                            />
                          </div>
                        </div>
                      ) : (
                        <a
                          href={msg.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                            isMine
                              ? "bg-white/10 text-white/80 hover:bg-white/20"
                              : "bg-background text-primary hover:bg-background/80"
                          }`}
                        >
                          <Paperclip size={14} />
                          <span className="flex-1 truncate">فایل پیوست</span>
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                  <p
                    className={`text-2xs mt-1.5 ${isMine ? "text-white/60" : "text-muted-foreground"}`}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="shrink-0 flex flex-col gap-2">
          {file && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <Paperclip size={14} className="text-muted-foreground" />
              <span className="text-xs flex-1 truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-muted-foreground hover:text-danger"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <label className="flex items-center justify-center w-10 h-10 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 cursor-pointer transition-colors shrink-0">
              <Paperclip size={16} />
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="پیام خود را بنویسید…"
              className="flex-1 h-10 rounded-xl border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              dir="rtl"
            />
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="btn-primary w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} className="text-white z-10" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="بستن"
          >
            <X size={20} />
          </button>
          <a
            href={lightboxUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-2 text-sm"
          >
            <Download size={18} /> دانلود
          </a>
          <img
            src={lightboxUrl}
            alt="پیوست"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
