"use client";

import { useUserInfo } from "@/context/UserInfoProvider";
import { createTicket, uploadTicketAttachment } from "@/lib/supabase/tickets";
import { ArrowRight, Loader2, Paperclip, Send, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewTicketPage() {
  const { user } = useUserInfo();
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("ابتدا وارد حساب کاربری خود شوید");
      return;
    }
    if (!subject.trim()) {
      toast.error("موضوع تیکت الزامی است");
      return;
    }
    if (!message.trim()) {
      toast.error("متن پیام الزامی است");
      return;
    }

    setSending(true);
    try {
      let attachmentUrl: string | undefined;
      if (file) attachmentUrl = await uploadTicketAttachment(file);

      const ticketId = await createTicket(
        user.id,
        subject.trim(),
        message.trim(),
        attachmentUrl,
      );
      toast.success("تیکت با موفقیت ثبت شد");
      router.push(`/contact/${ticketId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در ثبت تیکت");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="pt-20" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 lg:px-8 xl:px-10 py-8 vazir-matn">
        <Link
          href="/contact"
          className="inline-flex items-center gap-1 text-xs font-600 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowRight size={14} /> بازگشت به تیکت‌ها
        </Link>

        <h1 className="text-2xl font-800 text-foreground mb-2">
          ثبت تیکت جدید
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          موضوع و توضیحات خود را وارد کنید. تیم پشتیبانی در اسرع وقت پاسخ
          می‌دهد.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-600 text-foreground mb-1.5">
              موضوع <span className="text-danger">*</span>
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="موضوع تیکت را وارد کنید…"
              className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-600 text-foreground mb-1.5">
              پیام <span className="text-danger">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="توضیحات خود را بنویسید…"
              rows={6}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-600 text-foreground mb-1.5">
              پیوست (اختیاری)
            </label>
            {file ? (
              <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg">
                <Paperclip size={14} className="text-muted-foreground" />
                <span className="text-xs text-foreground flex-1 truncate">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-muted-foreground hover:text-danger"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 cursor-pointer transition-colors">
                <Paperclip size={14} /> انتخاب فایل
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/contact"
              className="btn-secondary flex-1 justify-center text-sm"
            >
              انصراف
            </Link>
            <button
              type="submit"
              disabled={sending}
              className="btn-primary flex-1 justify-center text-sm flex items-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> در حال ثبت…
                </>
              ) : (
                <>
                  <Send size={14} /> ثبت تیکت
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
