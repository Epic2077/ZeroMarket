"use client";

import { Code, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "../ui/code-block";
import { useEffect, useState } from "react";

export default function TelegramConnectionDialog() {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  async function handleConnect() {
    setLoading(true);
    setError(null);
    setCode(null);

    try {
      const response = await fetch("/api/telegram/link-code", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "خطایی رخ داده است.");
      }
      setCode(data.code);
      setRemainingSeconds(60);
    } catch (error) {
      setError(error instanceof Error ? error.message : "خطایی رخ داده است.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (remainingSeconds === 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);
  return (
    <Dialog>
      <DialogTrigger>
        <div className="btn-secondary text-sm">
          <Send />
          اتصال به تلگرام
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm" dir="rtl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>اتصال به تلگرام</DialogTitle>
          <DialogDescription>
            این کد را در ربات تلگرام ما وارد کنید تا حساب کاربری شما به تلگرام
            متصل شود.
          </DialogDescription>
        </DialogHeader>

        <Label htmlFor="code">کد اتصال</Label>
        <CodeBlock>
          <CodeBlockHeader className="p-2">
            <CodeBlockTitle>
              <Code />
              <b className="ml-4">{code ?? "------"}</b>
            </CodeBlockTitle>
            <CodeBlockActions>
              <CodeBlockCopyButton value={code ?? ""} disabled={!code} />
            </CodeBlockActions>
          </CodeBlockHeader>
        </CodeBlock>
        <DialogDescription className="text-xs text-muted-foreground text-center">
          {code
            ? "کد تا ۶۰ ثانیه معتبر است. پس از آن باید کد جدیدی دریافت کنید."
            : "برای دریافت کد اتصال، روی دکمه زیر بزنید."}
          {code && remainingSeconds > 0 && (
            <span className="block mt-2 font-bold">
              دریافت کد جدید تا {remainingSeconds.toLocaleString("fa-IR")} ثانیه
              دیگر
            </span>
          )}
        </DialogDescription>
        <DialogFooter className="flex-col gap-2">
          {error && (
            <p className="text-center text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full mx-auto"
            disabled={loading || remainingSeconds > 0}
            onClick={handleConnect}
          >
            {loading ? "در حال دریافت..." : code ? "دریافت کد جدید" : "دریافت کد"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
